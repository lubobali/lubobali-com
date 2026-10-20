"""The logic behind the 3 doors (B3; split out of api.py to keep it small).

Order of checks on every AI door (cheapest first, money last):
bot checks -> ticket -> one-per-visitor / IP -> budget reserve -> AI call ->
settle the real cost. A refusal is a RefusalError(status, code); api.py
turns it into a plain message. The story is never logged or stored.
"""

from __future__ import annotations

import json
import logging
import time
from collections.abc import Callable
from datetime import datetime
from urllib.parse import urlencode

from blueprint import llm
from blueprint.config import Settings
from blueprint.emailer import is_email, lead_mail, visitor_mail
from blueprint.patterns import LOCKED, PATTERNS
from blueprint.prompts import blueprint_messages, followup_messages
from blueprint.requests import BookRequest, CopyRequest, GenerateRequest, StartRequest
from blueprint.rules import readiness, time_saved, timeline
from blueprint.schema import BlueprintDraft, FollowUpQuestions, VisitorInput
from blueprint.signing import blueprint_ok, book_code, make_ticket, sign_blueprint, story_fingerprint, ticket_ok
from blueprint.store import Store

log = logging.getLogger("blueprint")

FOLLOWUP_MAX_TOKENS = 1000
BLUEPRINT_MAX_TOKENS = 2500
CLEANUP_EVERY_S = 3600


class RefusalError(Exception):
    def __init__(self, status: int, code: str) -> None:
        super().__init__(code)
        self.status, self.code = status, code


def build_blueprint(draft: BlueprintDraft, v: VisitorInput, now: datetime) -> dict:
    """The AI's words + the numbers our code computes (unsigned)."""
    rd = readiness(data_location=v.data_location, sources_count=draft.sources_count, issues=list(draft.data_issues))
    tl = timeline(
        pattern=draft.pattern, readiness_score=rd.score, sources_count=draft.sources_count, team_size=v.team_size
    )
    ts = time_saved(pattern=draft.pattern, before_minutes_per_week=draft.minutes_per_week)
    p = PATTERNS[draft.pattern]
    return {
        "version": 1,
        "created": now.isoformat(timespec="seconds"),
        "pattern": {"id": p.id, "title": p.title, "promise": p.promise},
        "draft": draft.model_dump(),
        "readiness": {"score": rd.score, "reasons": list(rd.reasons)},
        "timeline": {
            "label": tl.label,
            "weeks_min": tl.weeks_min,
            "weeks_max": tl.weeks_max,
            "rounds": [{"label": x.label, "weeks": x.weeks} for x in tl.rounds],
        },
        "time_saved": None
        if ts is None
        else {"before_minutes": ts.before_minutes, "after_minutes": ts.after_minutes, "after_is_estimate": True},
        "locked": list(LOCKED),
    }


class Service:
    def __init__(
        self,
        settings: Settings,
        *,
        ask: Callable,
        clock: Callable[[], datetime],
        send_mail: Callable | None = None,
        render_pdf: Callable | None = None,
    ) -> None:
        self.s = settings
        self.send_mail = send_mail
        self.render_pdf = render_pdf
        self.store = Store(settings.db_path, salt=settings.salt, limits=settings.limits)
        self.ask = ask
        self.clock = clock
        self._last_cleanup = 0.0

    # -- the 3 doors ------------------------------------------------------------

    def followups(self, r: StartRequest, ip: str) -> dict:
        now = self.clock()
        self._bot_checks(r)
        if not self.store.take_followup(ip=ip, now=now):
            raise RefusalError(429, "slow_down")
        v = VisitorInput(story=r.story, data_location=r.data_location, team_size=r.team_size)
        out: FollowUpQuestions = self._call_ai(followup_messages(v), FollowUpQuestions, FOLLOWUP_MAX_TOKENS, now)
        self.store.count("started" if out.story_ok else "not_a_story", now=now)
        if not out.story_ok:
            return {"story_ok": False, "questions": [], "ticket": None}
        fp = story_fingerprint(str(r.visitor_id), r.story, r.data_location, r.team_size)
        return {
            "story_ok": True,
            "questions": [q.model_dump() for q in out.questions],
            "ticket": make_ticket(self.s.signing_key, fp, now=now.timestamp(), ttl_s=self.s.ticket_ttl_s),
        }

    def generate(self, r: GenerateRequest, ip: str) -> dict:
        now = self.clock()
        self._bot_checks(r)
        fp = story_fingerprint(str(r.visitor_id), r.story, r.data_location, r.team_size)
        if not ticket_ok(self.s.signing_key, r.ticket, fp, now=now.timestamp()):
            raise RefusalError(400, "start_again")
        verdict = self.store.can_generate(visitor=str(r.visitor_id), ip=ip, now=now)
        if verdict != "ok":
            self.store.count("refused", now=now)
            raise RefusalError(409, verdict)
        v = VisitorInput(story=r.story, data_location=r.data_location, team_size=r.team_size, followups=r.followups)
        draft: BlueprintDraft = self._call_ai(
            blueprint_messages(v), BlueprintDraft, BLUEPRINT_MAX_TOKENS, now, context=v.own_words()
        )
        bp = build_blueprint(draft, v, now)
        bp["signature"] = sign_blueprint(self.s.signing_key, bp)
        bp["code"] = book_code(bp["signature"])  # travels to Calendly (B5.3)
        self.store.record_blueprint(visitor=str(r.visitor_id), ip=ip, now=now)
        self.store.count("finished", now=now)
        self._maybe_cleanup(now)
        return bp

    def book(self, r: BookRequest) -> dict:
        now = self.clock()
        if not blueprint_ok(self.s.signing_key, r.blueprint):
            raise RefusalError(400, "start_again")
        code = self.store.save_booked(blueprint=r.blueprint, now=now, code=r.blueprint["code"])
        self.store.count("booked", now=now)
        query = urlencode({"utm_source": "lubobali.com", "utm_medium": "blueprint", "utm_content": code})
        return {"code": code, "calendly_url": f"{self.s.calendly_url}?{query}"}

    def copy(self, r: CopyRequest, ip: str) -> dict:
        """Email the PDF to the visitor and the lead to Lubo (B7)."""
        now = self.clock()
        bp, email = r.blueprint, r.email.strip()
        if not blueprint_ok(self.s.signing_key, bp):
            raise RefusalError(400, "start_again")
        if not is_email(email):
            raise RefusalError(400, "bad_email")
        verdict = self.store.can_copy(signature=bp["signature"], ip=ip, now=now)
        if verdict != "ok":
            raise RefusalError(409 if verdict == "copy_sent" else 429, verdict)
        try:
            pdf = self.render_pdf(bp, calendly_url=self.s.calendly_url)
            self.send_mail(
                visitor_mail(bp, to=email, pdf=pdf, sender=self.s.mail_from, calendly_url=self.s.calendly_url)
            )
        except Exception as e:  # PDF or mail server: the visitor can try again
            log.warning(json.dumps({"event": "copy", "result": "failed", "error": type(e).__name__}))
            raise RefusalError(502, "try_again") from e
        self.store.record_copy(signature=bp["signature"], ip=ip, now=now)
        self.store.count("copy_sent", now=now)
        try:  # the visitor has their PDF; a failed alert must not undo that
            self.send_mail(lead_mail(bp, visitor=email, pdf=pdf, sender=self.s.mail_from, to=self.s.leads_to))
        except Exception as e:
            log.error(json.dumps({"event": "lead_mail", "result": "failed", "error": type(e).__name__}))
        return {"sent": True}

    # -- helpers ------------------------------------------------------------------

    def _bot_checks(self, r: StartRequest) -> None:
        if r.website:
            raise RefusalError(400, "try_again")
        if r.elapsed_ms < self.s.min_fill_ms:
            raise RefusalError(400, "too_fast")

    def _worst_case_usd(self, messages: list[dict], max_tokens: int) -> float:
        tokens_in = sum(len(m["content"]) for m in messages) / 3 + 50
        one = tokens_in * self.s.price_in_per_m + max_tokens * self.s.price_out_per_m
        return 2 * one / 1_000_000  # a retry can double it

    def _call_ai(self, messages: list[dict], model: type, max_tokens: int, now: datetime, context: dict | None = None):
        event = model.__name__
        reservation = self.store.reserve(estimate_usd=self._worst_case_usd(messages, max_tokens), now=now)
        if reservation is None:
            log.warning(json.dumps({"event": event, "result": "budget_breaker"}))
            raise RefusalError(503, "busy")
        t0, cost = time.monotonic(), 0.0
        try:
            res = self.ask(messages, model, max_tokens=max_tokens, model_id=self.s.model_id, context=context)
            cost = res.cost_usd
            return res.value
        except llm.LLMError as e:
            log.warning(json.dumps({"event": event, "result": "llm_error", "error": str(e)[:200]}))
            raise RefusalError(502, "try_again") from e
        finally:
            self.store.settle(reservation, actual_usd=cost)
            log.info(json.dumps({"event": event, "ms": int((time.monotonic() - t0) * 1000), "cost": round(cost, 5)}))

    def _maybe_cleanup(self, now: datetime) -> None:
        if time.time() - self._last_cleanup > CLEANUP_EVERY_S:
            self.store.cleanup(now=now)
            self._last_cleanup = time.time()
