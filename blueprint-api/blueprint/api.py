"""The 3 doors of the Blueprint tool (Phase 3b B3.2).

POST /api/blueprint/followups  story -> up to 3 questions + a signed ticket
POST /api/blueprint/generate   ticket + answers -> the blueprint (uses their one)
POST /api/blueprint/book       a signed blueprint -> kept 90 days + Calendly link
GET  /api/blueprint/health     {"ok": true}

Order of checks on every AI door (cheapest first, money last):
bot checks -> ticket -> one-per-visitor / IP -> budget reserve -> AI call ->
settle the real cost. Every refusal has a code + a plain message, and the
page always offers Book a call. The visitor's story is never logged or
stored (only a booked blueprint is kept, 90 days).

Run: uvicorn --factory blueprint.api:app_from_env
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Annotated
from urllib.parse import urlencode

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import UUID4, BaseModel, ConfigDict, Field, StringConstraints

from blueprint import llm
from blueprint.patterns import LOCKED, PATTERNS
from blueprint.prompts import blueprint_messages, followup_messages
from blueprint.rules import readiness, time_saved, timeline
from blueprint.schema import BlueprintDraft, DataLocation, FollowUp, FollowUpQuestions, TeamSize, VisitorInput
from blueprint.store import Limits, Store

log = logging.getLogger("blueprint")

CALENDLY = "https://calendly.com/data-lubobali/30min"
MAX_BODY_BYTES = 16_384
FOLLOWUP_MAX_TOKENS = 1000
BLUEPRINT_MAX_TOKENS = 2500

MESSAGES = {
    "bad_input": "Please check your story: 20 to 1,200 characters, in your own words.",
    "too_big": "That's too long. Please keep your story under 1,200 characters.",
    "try_again": "Something went wrong on our side. Please try again in a minute, or book a free call.",
    "too_fast": "That was very fast. Take a moment to describe your problem, then try again.",
    "start_again": "Please start again from your story.",
    "slow_down": "That's a lot of tries for today. Please come back tomorrow, or just book a free call.",
    "busy": "The blueprint tool is very busy right now. Book a free call and we'll sketch it together.",
    "already_have": "You already have your blueprint. The next step is to talk it through: book a free call.",
    "ip_week": "You already have your blueprint. The next step is to talk it through: book a free call.",
}


@dataclass(frozen=True)
class Settings:
    db_path: str
    salt: str
    signing_key: str
    limits: Limits = field(default_factory=Limits)
    min_fill_ms: int = 3000
    model_id: str | None = None
    # Worst-case price per million tokens (Opus 5.5 on OpenRouter, 2026-10).
    price_in_per_m: float = 4.0
    price_out_per_m: float = 20.0
    ticket_ttl_s: int = 3600
    calendly_url: str = CALENDLY
    trusted_proxies: tuple[str, ...] = ("127.0.0.1", "::1")

    @classmethod
    def from_env(cls) -> Settings:
        e = os.environ
        return cls(
            db_path=e.get("BLUEPRINT_DB", "/data/blueprint.sqlite"),
            salt=e["BLUEPRINT_SALT"],
            signing_key=e["BLUEPRINT_SIGNING_KEY"],
            limits=Limits(
                monthly_budget_usd=float(e.get("BLUEPRINT_MONTHLY_BUDGET_USD", 20)),
                daily_budget_usd=float(e.get("BLUEPRINT_DAILY_BUDGET_USD", 3)),
                blueprints_per_visitor=int(e.get("BLUEPRINT_PER_VISITOR", 1)),
                blueprints_per_ip_week=int(e.get("BLUEPRINT_PER_IP_WEEK", 1)),
                followups_per_ip_day=int(e.get("BLUEPRINT_FOLLOWUPS_PER_IP_DAY", 6)),
            ),
            model_id=e.get("BLUEPRINT_MODEL") or None,
            trusted_proxies=tuple(x for x in e.get("BLUEPRINT_TRUSTED_PROXIES", "127.0.0.1,::1").split(",") if x),
        )


class RefusalError(Exception):
    def __init__(self, status: int, code: str) -> None:
        super().__init__(code)
        self.status, self.code = status, code


# --- requests (strict: unknown fields rejected) --------------------------------


class _Req(BaseModel):
    model_config = ConfigDict(extra="forbid")


class StartRequest(_Req):
    visitor_id: UUID4
    story: Annotated[str, StringConstraints(strip_whitespace=True, min_length=20, max_length=1200)]
    data_location: DataLocation
    team_size: TeamSize
    website: str = Field(default="", max_length=200)  # honeypot: humans never see it
    elapsed_ms: int = Field(ge=0, le=86_400_000)  # time the form was open


class GenerateRequest(StartRequest):
    ticket: str = Field(max_length=600)
    followups: list[FollowUp] = Field(default_factory=list, max_length=3)


class BookRequest(_Req):
    blueprint: dict


# --- signing: tickets + blueprints --------------------------------------------


def _hmac(key: str, data: str) -> str:
    return hmac.new(key.encode(), data.encode(), hashlib.sha256).hexdigest()


def _canonical(obj: dict) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _story_fingerprint(r: StartRequest) -> str:
    raw = f"{r.visitor_id}|{r.story}|{r.data_location}|{r.team_size}"
    return hashlib.sha256(raw.encode()).hexdigest()


def make_ticket(s: Settings, r: StartRequest, now: float) -> str:
    payload = f"{_story_fingerprint(r)}|{int(now) + s.ticket_ttl_s}"
    b64 = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    return f"{b64}.{_hmac(s.signing_key, payload)}"


def ticket_ok(s: Settings, r: GenerateRequest, now: float) -> bool:
    try:
        b64, sig = r.ticket.split(".", 1)
        payload = base64.urlsafe_b64decode(b64 + "=" * (-len(b64) % 4)).decode()
        fingerprint, exp = payload.rsplit("|", 1)
    except (ValueError, UnicodeDecodeError):
        return False
    return (
        hmac.compare_digest(sig, _hmac(s.signing_key, payload))
        and hmac.compare_digest(fingerprint, _story_fingerprint(r))
        and int(exp) > now
    )


def sign_blueprint(s: Settings, bp: dict) -> str:
    return _hmac(s.signing_key, _canonical({k: v for k, v in bp.items() if k != "signature"}))


# --- the app ---------------------------------------------------------------


def create_app(
    settings: Settings,
    *,
    ask: Callable = llm.ask,
    clock: Callable[[], datetime] = lambda: datetime.now(UTC),
) -> FastAPI:
    store = Store(settings.db_path, salt=settings.salt, limits=settings.limits)
    app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
    last_cleanup = {"t": 0.0}

    @app.middleware("http")
    async def limit_body(request: Request, call_next):
        size = request.headers.get("content-length")
        if size and size.isdigit() and int(size) > MAX_BODY_BYTES:
            return _refuse(413, "too_big")
        return await call_next(request)

    @app.exception_handler(RequestValidationError)
    async def bad_input(_request: Request, _exc: RequestValidationError):
        return _refuse(400, "bad_input")

    @app.exception_handler(RefusalError)
    async def refused(_request: Request, exc: RefusalError):
        return _refuse(exc.status, exc.code)

    def ip_of(request: Request) -> str:
        host = request.client.host if request.client else ""
        if host in settings.trusted_proxies:
            return request.headers.get("x-real-ip", host)
        return host

    def bot_checks(r: StartRequest) -> None:
        if r.website:
            raise RefusalError(400, "try_again")
        if r.elapsed_ms < settings.min_fill_ms:
            raise RefusalError(400, "too_fast")

    def worst_case_usd(messages: list[dict], max_tokens: int) -> float:
        tokens_in = sum(len(m["content"]) for m in messages) / 3 + 50
        one = tokens_in * settings.price_in_per_m + max_tokens * settings.price_out_per_m
        return 2 * one / 1_000_000  # a retry can double it

    def call_ai(messages: list[dict], model: type, max_tokens: int, now: datetime, event: str):
        reservation = store.reserve(estimate_usd=worst_case_usd(messages, max_tokens), now=now)
        if reservation is None:
            log.warning(json.dumps({"event": event, "result": "budget_breaker"}))
            raise RefusalError(503, "busy")
        t0, cost = time.monotonic(), 0.0
        try:
            res = ask(messages, model, max_tokens=max_tokens, model_id=settings.model_id)
            cost = res.cost_usd
            return res.value
        except llm.LLMError as e:
            log.warning(json.dumps({"event": event, "result": "llm_error", "error": str(e)[:200]}))
            raise RefusalError(502, "try_again") from e
        finally:
            store.settle(reservation, actual_usd=cost)
            log.info(json.dumps({"event": event, "ms": int((time.monotonic() - t0) * 1000), "cost": round(cost, 5)}))

    @app.post("/api/blueprint/followups")
    def followups(r: StartRequest, request: Request):
        now = clock()
        bot_checks(r)
        if not store.take_followup(ip=ip_of(request), now=now):
            raise RefusalError(429, "slow_down")
        v = VisitorInput(story=r.story, data_location=r.data_location, team_size=r.team_size)
        out: FollowUpQuestions = call_ai(followup_messages(v), FollowUpQuestions, FOLLOWUP_MAX_TOKENS, now, "followups")
        store.count("started" if out.story_ok else "not_a_story", now=now)
        return {
            "story_ok": out.story_ok,
            "questions": [q.model_dump() for q in out.questions] if out.story_ok else [],
            "ticket": make_ticket(settings, r, now.timestamp()) if out.story_ok else None,
        }

    @app.post("/api/blueprint/generate")
    def generate(r: GenerateRequest, request: Request):
        now = clock()
        bot_checks(r)
        if not ticket_ok(settings, r, now.timestamp()):
            raise RefusalError(400, "start_again")
        ip, visitor = ip_of(request), str(r.visitor_id)
        verdict = store.can_generate(visitor=visitor, ip=ip, now=now)
        if verdict != "ok":
            store.count("refused", now=now)
            raise RefusalError(409, verdict)
        v = VisitorInput(story=r.story, data_location=r.data_location, team_size=r.team_size, followups=r.followups)
        draft: BlueprintDraft = call_ai(blueprint_messages(v), BlueprintDraft, BLUEPRINT_MAX_TOKENS, now, "generate")

        rd = readiness(data_location=v.data_location, sources_count=draft.sources_count, issues=list(draft.data_issues))
        tl = timeline(
            pattern=draft.pattern, readiness_score=rd.score, sources_count=draft.sources_count, team_size=v.team_size
        )
        ts = time_saved(pattern=draft.pattern, before_minutes_per_week=draft.minutes_per_week)
        p = PATTERNS[draft.pattern]
        bp = {
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
        bp["signature"] = sign_blueprint(settings, bp)
        store.record_blueprint(visitor=visitor, ip=ip, now=now)
        store.count("finished", now=now)
        if time.time() - last_cleanup["t"] > 3600:
            store.cleanup(now=now)
            last_cleanup["t"] = time.time()
        return bp

    @app.post("/api/blueprint/book")
    def book(r: BookRequest):
        now = clock()
        sig = r.blueprint.get("signature")
        if not isinstance(sig, str) or not hmac.compare_digest(sig, sign_blueprint(settings, r.blueprint)):
            raise RefusalError(400, "start_again")
        code = store.save_booked(blueprint=r.blueprint, now=now)
        store.count("booked", now=now)
        query = urlencode({"utm_source": "lubobali.com", "utm_medium": "blueprint", "utm_content": code})
        return {"code": code, "calendly_url": f"{settings.calendly_url}?{query}"}

    @app.get("/api/blueprint/health")
    def health():
        return {"ok": True}

    return app


def _refuse(status: int, code: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"code": code, "message": MESSAGES[code]})


def app_from_env() -> FastAPI:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    return create_app(Settings.from_env())
