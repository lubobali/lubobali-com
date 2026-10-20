"""The shape of a blueprint (Phase 3b B1).

Two shapes:
- ``VisitorInput``: what the visitor sends (story + 2 taps + follow-ups).
- ``BlueprintDraft``: what the AI must return, in Lubo's way: why -> old
  flow -> players (money + power) -> users -> new flow, plus named risks
  and 3 questions for the call. Strict: unknown fields are rejected, so
  the "how" (tools, architecture, fixes, cost) has nowhere to go; text
  is plain (no HTML, no links, no markdown) and never cut, only rejected.
Numbers the visitor reads (score, timeline, time saved) are NOT here:
code computes them (rules.py).
"""

from __future__ import annotations

import re
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StringConstraints, ValidationInfo, model_validator

DataLocation = Literal["spreadsheets", "database", "crm_or_saas", "documents", "not_sure"]
TeamSize = Literal["1-10", "11-50", "51-200", "200+"]
Power = Literal["decides", "approves", "does", "uses", "informed"]
Severity = Literal["watch", "fix_first"]
Per = Literal["day", "week", "month"]
Issue = Literal[
    "multiple_sources",
    "manual_copying",
    "no_shared_ids",
    "unstructured_docs",
    "unknown_quality",
    "sensitive_data",
]
PATTERN_IDS = ("agents", "data_platform", "trusted_answers", "cost_control")
PatternId = Literal["agents", "data_platform", "trusted_answers", "cost_control"]

# Markup, links or code in the AI's text = rejected (the page renders text
# only, but a strange answer is a sign the model was tricked).
_NOT_PLAIN = re.compile(r"[<>`]|\]\(|https?://|www\.", re.IGNORECASE)


def _plain(text: str) -> str:
    """Reject markup and links.

    >>> _plain("One fleet dashboard")
    'One fleet dashboard'
    >>> _plain("<b>x</b>")
    Traceback (most recent call last):
    ...
    ValueError: plain text only (no HTML, links or markdown)
    """
    if _NOT_PLAIN.search(text):
        raise ValueError("plain text only (no HTML, links or markdown)")
    return text


# A bare domain ("evil-site.com", B9.2b): an injection's favourite payload.
# Only the visitor's own app names (OldStep.tool, e.g. "Monday.com") may have one.
_DOMAIN = re.compile(r"\b[a-z0-9-]+\.(?:com|net|org|io|ai|co|app|dev|xyz|ru|biz|info|us|uk|de)\b", re.IGNORECASE)


def _no_links(text: str) -> str:
    """
    >>> _no_links("Go to evil-site.com")
    Traceback (most recent call last):
    ...
    ValueError: no links or web addresses
    """
    if _DOMAIN.search(text):
        raise ValueError("no links or web addresses")
    return text


def Text(min_len: int, max_len: int, *, own_app: bool = False):  # noqa: N802 (reads like a type)
    """Plain text with a length range; too long is an error, never cut."""
    checks = (AfterValidator(_plain),) if own_app else (AfterValidator(_plain), AfterValidator(_no_links))
    return Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=min_len, max_length=max_len),
        *checks,
    ]


# Money and percentages (B9.2b): the AI may only repeat the visitor's own,
# never invent a price or a promise ("Lubo guarantees $5", "90% discount").
_AMOUNT = re.compile(r"[$€£]\s?\d[\d,.]*\s?[kKmM]?|\d[\d,.]*\s?%")


def amounts_not_said(texts: list[str], visitor_words: str) -> list[str]:
    """Amounts in the AI's texts that are not in the visitor's own words.

    >>> amounts_not_said(["They lose $20k a month, 30 % denied"], "we lose $20k, 30% denied")
    []
    >>> amounts_not_said(["It costs only $5"], "we copy invoices by hand")
    ['$5']
    """
    said = re.sub(r"\s", "", visitor_words).lower()
    found = [m.group(0) for t in texts for m in _AMOUNT.finditer(t)]
    return sorted({a for a in found if re.sub(r"\s", "", a).lower() not in said})


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


# --- what the visitor sends -------------------------------------------------


class FollowUp(_Strict):
    question: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
    answer: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=300)]


class VisitorInput(_Strict):
    # The visitor's own words: any text, only the length is checked. It is
    # sent to the model as data, never as instructions.
    story: Annotated[str, StringConstraints(strip_whitespace=True, min_length=20, max_length=1200)]
    data_location: DataLocation
    team_size: TeamSize
    followups: list[FollowUp] = Field(default_factory=list, max_length=3)

    def own_words(self) -> dict[str, str]:
        """Validation context for the blueprint: amounts the AI may repeat (B9.2b)."""
        return {"visitor_words": " ".join([self.story, *(f.answer for f in self.followups)])}


# --- what the AI must return -------------------------------------------------

Step = Literal["why", "old_flow", "players", "users", "time", "new_flow"]


class FollowUpQuestion(_Strict):
    # Which of Lubo's 6 steps the story is missing.
    step: Step
    question: Text(8, 140)
    # Tap answers (the visitor can also type their own).
    options: list[Text(1, 30)] = Field(default_factory=list, max_length=4)


class FollowUpQuestions(_Strict):
    # False = not a real business problem (gibberish, a test, a trick): the
    # page asks them to describe it again; it does NOT use their blueprint.
    story_ok: bool = True
    # 0-3: none when the story already covers all 6 steps.
    questions: list[FollowUpQuestion] = Field(default_factory=list, max_length=3)

    @model_validator(mode="before")
    @classmethod
    def _keep_the_first_three(cls, data: object) -> object:
        if isinstance(data, dict) and isinstance(data.get("questions"), list) and len(data["questions"]) > 3:
            return {**data, "questions": data["questions"][:3]}
        return data


class Why(_Strict):
    problem: Text(10, 220)
    goal: Text(5, 160)


class OldStep(_Strict):
    label: Text(2, 40)
    tool: Text(2, 30, own_app=True)
    # Only when the visitor said how long it takes; both or neither.
    minutes: int | None = Field(default=None, ge=1, le=10_000)
    per: Per | None = None
    pain: bool = False

    @model_validator(mode="before")
    @classmethod
    def _half_time_is_dropped(cls, data: object) -> object:
        # "per month" without minutes (or the other way) = no time at all:
        # we drop it, never guess the missing half (seen in B2 evals).
        if isinstance(data, dict) and (data.get("minutes") is None) != (data.get("per") is None):
            return {**data, "minutes": None, "per": None}
        return data


# "40%", "40% of fees", "12.5% split": a share, nothing else.
_SHARE = r"^\d{1,3}(\.\d+)?\s?%(\s?[A-Za-z][A-Za-z ,]{0,20})?$"


class Player(_Strict):
    role: Text(2, 30)
    does: Text(2, 60)
    power: Power
    money_share: Annotated[str, StringConstraints(strip_whitespace=True, max_length=30, pattern=_SHARE)] | None = None


class Users(_Strict):
    who: Text(3, 80)
    why: Text(3, 140)


class NewStep(_Strict):
    label: Text(2, 40)


class Risk(_Strict):
    title: Text(5, 70)
    severity: Severity


# Weekly minutes from a step's time: 5 work days a week, 4.33 weeks a month.
_PER_WEEK = {"day": 5.0, "week": 1.0, "month": 1 / 4.33}


class BlueprintDraft(_Strict):
    why: Why
    old_flow: list[OldStep] = Field(min_length=2, max_length=6)
    players: list[Player] = Field(min_length=1, max_length=6)
    users: Users
    new_flow: list[NewStep] = Field(min_length=2, max_length=5)
    app_name: Text(3, 40)
    pattern: PatternId
    data_issues: list[Issue] = Field(default_factory=list, max_length=6)
    risks: list[Risk] = Field(min_length=1, max_length=3)
    questions_for_call: list[Text(10, 160)] = Field(min_length=3, max_length=3)

    @model_validator(mode="before")
    @classmethod
    def _keep_the_first_three(cls, data: object) -> object:
        # Models sometimes give a 4th risk or question (B2 evals). The
        # prompt asks for the most important first, so keep the first 3.
        # Only whole items are dropped; text is never cut.
        if isinstance(data, dict):
            data = dict(data)
            for key in ("risks", "questions_for_call"):
                if isinstance(data.get(key), list) and len(data[key]) > 3:
                    data[key] = data[key][:3]
        return data

    @model_validator(mode="after")
    def _only_the_visitors_amounts(self, info: ValidationInfo) -> BlueprintDraft:
        # No context = nothing the visitor said = every amount refused (fail safe).
        words = (info.context or {}).get("visitor_words", "")
        bad = amounts_not_said(self.ai_texts(), words)
        if bad:
            raise ValueError(
                f"amounts the visitor never said: {bad}. Only repeat the visitor's own amounts, "
                "exactly as they wrote them, or leave them out."
            )
        return self

    def ai_texts(self) -> list[str]:
        """Every free text the AI wrote, except the visitor's own app names."""
        out = [self.why.problem, self.why.goal, self.users.who, self.users.why, self.app_name]
        out += [s.label for s in self.old_flow] + [s.label for s in self.new_flow]
        out += [f"{p.role} {p.does}" for p in self.players] + [r.title for r in self.risks]
        return out + list(self.questions_for_call)

    @property
    def sources_count(self) -> int:
        """How many different apps/places the old flow uses."""
        return max(1, len({s.tool.casefold() for s in self.old_flow}))

    @property
    def minutes_per_week(self) -> int | None:
        """The old flow's time per week, only from times the visitor gave."""
        timed = [s for s in self.old_flow if s.minutes is not None and s.per is not None]
        if not timed:
            return None
        return sum(round(s.minutes * _PER_WEEK[s.per]) for s in timed)
