"""Numbers the visitor reads, computed by code (Phase 3b B1).

The AI never writes a number on the blueprint (Lubo's "the AI writes,
the code checks"): the readiness score, the timeline and the time saved
come from these rules, from what the visitor said. Simple, explainable,
same answer every time. Tune the weights here, not in the prompt.
"""

from __future__ import annotations

from dataclasses import dataclass

from blueprint.patterns import PATTERNS

# --- readiness ---------------------------------------------------------------

_BASE = 80
# How far each place is from "ready for AI" (points off).
_LOCATION = {
    "database": (0, "✓ Your data is already in a database"),
    "crm_or_saas": (10, "Your data sits inside other apps"),
    "spreadsheets": (20, "Your data lives in spreadsheets"),
    "documents": (30, "Key facts sit in documents and PDFs"),
    "not_sure": (35, "Nobody is sure where all the data is"),
}
_PER_EXTRA_SOURCE, _MAX_SOURCES_PENALTY = 6, 30
_ISSUES = {
    "no_shared_ids": (10, "The apps don't share the same IDs"),
    "unstructured_docs": (8, "Important facts are in free text"),
    "unknown_quality": (8, "Nobody knows how clean the data is"),
    "manual_copying": (5, "People copy data by hand"),
    "multiple_sources": (5, "The same data is kept in several places"),
    "sensitive_data": (4, "Some data is sensitive and needs care"),
}
_MIN_SCORE, _MAX_SCORE = 5, 95


# Below this, the timeline starts with a cleanup week and the label says so.
CLEANUP_BELOW = 50
_READY_FROM = 75


@dataclass(frozen=True)
class Readiness:
    score: int
    reasons: tuple[str, str, str]


def readiness_label(score: int) -> str:
    """A kind word next to the number (B7, Lubo: "13/100" alone reads like
    a failing grade). Display only: same for old blueprints and examples.
    Mirrored in src/components/blueprint/format.ts (readinessLabel).

    >>> readiness_label(13)
    "Early, and that's normal: week 1 cleans up your data"
    >>> readiness_label(80)
    'Ready: your data is in good shape'
    """
    if score < CLEANUP_BELOW:
        return "Early, and that's normal: week 1 cleans up your data"
    if score < _READY_FROM:
        return "Good start: a few small fixes along the way"
    return "Ready: your data is in good shape"


def readiness(*, data_location: str, sources_count: int, issues: list[str]) -> Readiness:
    """Data readiness 5-95 and the 3 plain reasons behind it.

    >>> readiness(data_location="database", sources_count=1, issues=[]).score
    80
    >>> readiness(data_location="spreadsheets", sources_count=3, issues=["no_shared_ids"]).score
    38
    """
    unknown = set(issues) - set(_ISSUES)
    if unknown:
        raise ValueError(f"unknown data issue(s): {sorted(unknown)}")
    if data_location not in _LOCATION:
        raise ValueError(f"unknown data location: {data_location}")

    minus: list[tuple[int, str]] = []
    loc_points, loc_text = _LOCATION[data_location]
    if loc_points:
        minus.append((loc_points, loc_text))
    if sources_count > 1:
        points = min(_PER_EXTRA_SOURCE * (sources_count - 1), _MAX_SOURCES_PENALTY)
        minus.append((points, f"{sources_count} different apps hold the data"))
    minus += [_ISSUES[i] for i in dict.fromkeys(issues)]

    score = _BASE - sum(p for p, _ in minus)
    score = max(_MIN_SCORE, min(_MAX_SCORE, score))

    # Biggest problems first; fill up with what is already good.
    plus = []
    if data_location == "database":
        plus.append(loc_text)
    if sources_count <= 1:
        plus.append("✓ One clear source")
    if "manual_copying" not in issues:
        plus.append("✓ No copying by hand")
    plus.append("✓ A clear goal to build toward")
    reasons = [t for _, t in sorted(minus, key=lambda x: -x[0])] + plus
    return Readiness(score=score, reasons=(reasons[0], reasons[1], reasons[2]))


# --- timeline ----------------------------------------------------------------

_CLEANUP = "Clean up and connect your data"
_MANY_APPS = "Connect the remaining apps"
_ROLLOUT = "Roll out to the whole team"
_HANDOVER = "Handover"
_MAX_ROUNDS = 6
# 1 week per round (Lubo, 2026-10-20: "we use Claude Code for coding, the
# time is sped up"). Updates + invoices stay every 2 weeks (process.ts):
# that is billing rhythm, not build speed.
WEEKS_PER_ROUND = 1


@dataclass(frozen=True)
class Round:
    label: str
    weeks: int


@dataclass(frozen=True)
class Timeline:
    rounds: tuple[Round, ...]
    weeks_min: int
    weeks_max: int
    label: str


def timeline(*, pattern: str, readiness_score: int, sources_count: int, team_size: str) -> Timeline:
    """1-week rounds from the size of the job, ending with the handover.

    >>> timeline(pattern="agents", readiness_score=80, sources_count=1, team_size="1-10").label
    '3–4 weeks'
    """
    if pattern not in PATTERNS:
        raise ValueError(f"unknown pattern: {pattern}")
    labels: list[str] = []
    if readiness_score < CLEANUP_BELOW:
        labels.append(_CLEANUP)
    labels += PATTERNS[pattern].rounds
    if sources_count >= 4:
        labels.append(_MANY_APPS)
    if team_size in ("51-200", "200+"):
        labels.append(_ROLLOUT)
    labels = labels[: _MAX_ROUNDS - 1] + [_HANDOVER]

    rounds = tuple(Round(label=x, weeks=WEEKS_PER_ROUND) for x in labels)
    weeks_min = WEEKS_PER_ROUND * len(rounds)
    weeks_max = weeks_min + 1
    return Timeline(rounds=rounds, weeks_min=weeks_min, weeks_max=weeks_max, label=f"{weeks_min}–{weeks_max} weeks")


# --- time saved ------------------------------------------------------------

# Share of today's time that is left after the project (an estimate, and
# shown as one). Data platforms remove the copying almost entirely; cost
# control is about money, so less time is saved.
_LEFT_AFTER = {"data_platform": 0.10, "agents": 0.15, "trusted_answers": 0.20, "cost_control": 0.50}
_MIN_AFTER = 10


@dataclass(frozen=True)
class TimeSaved:
    before_minutes: int
    after_minutes: int
    after_is_estimate: bool = True


def time_saved(*, pattern: str, before_minutes_per_week: int | None) -> TimeSaved | None:
    """Before -> after minutes a week, only from the visitor's own number.

    >>> time_saved(pattern="data_platform", before_minutes_per_week=360)
    TimeSaved(before_minutes=360, after_minutes=35, after_is_estimate=True)
    >>> time_saved(pattern="agents", before_minutes_per_week=None) is None
    True
    """
    if pattern not in _LEFT_AFTER:
        raise ValueError(f"unknown pattern: {pattern}")
    if not before_minutes_per_week or before_minutes_per_week <= 0:
        return None
    after = max(_MIN_AFTER, 5 * round(before_minutes_per_week * _LEFT_AFTER[pattern] / 5))
    if after >= before_minutes_per_week:
        return None
    return TimeSaved(before_minutes=before_minutes_per_week, after_minutes=after)
