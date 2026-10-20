"""Readiness score, timeline and time-saved rules (Phase 3b B1).

The AI never produces these numbers: code computes them from what the
visitor said (Lubo's "the AI writes, the code checks").
"""

import pytest

from blueprint.rules import WEEKS_PER_ROUND, readiness, readiness_label, time_saved, timeline

# --- readiness -------------------------------------------------------------


def test_clean_database_single_source_scores_high():
    r = readiness(data_location="database", sources_count=1, issues=[])
    assert r.score >= 75
    assert len(r.reasons) == 3


def test_spreadsheets_from_three_apps_without_shared_ids_scores_low():
    r = readiness(
        data_location="spreadsheets",
        sources_count=3,
        issues=["manual_copying", "no_shared_ids"],
    )
    assert r.score < 50


@pytest.mark.parametrize(
    "better, worse",
    [
        ("database", "spreadsheets"),
        ("spreadsheets", "documents"),
        ("documents", "not_sure"),
    ],
)
def test_where_the_data_lives_orders_the_score(better, worse):
    a = readiness(data_location=better, sources_count=1, issues=[])
    b = readiness(data_location=worse, sources_count=1, issues=[])
    assert a.score > b.score


def test_more_sources_never_raise_the_score():
    scores = [readiness(data_location="crm_or_saas", sources_count=n, issues=[]).score for n in range(1, 9)]
    assert scores == sorted(scores, reverse=True)


def test_score_stays_between_5_and_95_even_in_extremes():
    worst = readiness(
        data_location="not_sure",
        sources_count=10,
        issues=[
            "multiple_sources",
            "manual_copying",
            "no_shared_ids",
            "unstructured_docs",
            "unknown_quality",
            "sensitive_data",
        ],
    )
    best = readiness(data_location="database", sources_count=1, issues=[])
    assert 5 <= worst.score <= 95 and 5 <= best.score <= 95


def test_reasons_are_plain_words_and_name_the_biggest_problem_first():
    r = readiness(data_location="spreadsheets", sources_count=4, issues=["no_shared_ids"])
    assert all(isinstance(x, str) and 5 < len(x) <= 60 for x in r.reasons)
    assert "spreadsheet" in r.reasons[0].lower() or "app" in r.reasons[0].lower()


def test_a_ready_database_gets_a_positive_reason():
    r = readiness(data_location="database", sources_count=1, issues=[])
    assert any("✓" in x for x in r.reasons)


def test_unknown_issue_is_rejected():
    with pytest.raises(ValueError):
        readiness(data_location="database", sources_count=1, issues=["made_up"])


# --- timeline --------------------------------------------------------------


def test_timeline_is_in_one_week_rounds_and_ends_with_handover():
    t = timeline(pattern="data_platform", readiness_score=80, sources_count=1, team_size="1-10")
    assert t.rounds[-1].label == "Handover"
    assert WEEKS_PER_ROUND == 1  # built with Claude Code (Lubo)
    assert all(r.weeks == WEEKS_PER_ROUND for r in t.rounds)
    assert t.weeks_min == len(t.rounds)
    assert t.weeks_max == t.weeks_min + 1


def test_messy_data_adds_a_round_first():
    clean = timeline(pattern="agents", readiness_score=80, sources_count=1, team_size="1-10")
    messy = timeline(pattern="agents", readiness_score=40, sources_count=1, team_size="1-10")
    assert len(messy.rounds) == len(clean.rounds) + 1
    assert messy.rounds[0].label == "Clean up and connect your data"


def test_many_sources_and_big_teams_take_longer():
    small = timeline(pattern="trusted_answers", readiness_score=70, sources_count=1, team_size="1-10")
    big = timeline(pattern="trusted_answers", readiness_score=70, sources_count=5, team_size="51-200")
    assert big.weeks_min > small.weeks_min


def test_timeline_never_goes_past_six_rounds():
    t = timeline(pattern="data_platform", readiness_score=5, sources_count=10, team_size="200+")
    assert len(t.rounds) <= 6


def test_label_reads_like_a_person_wrote_it():
    t = timeline(pattern="cost_control", readiness_score=90, sources_count=1, team_size="1-10")
    assert t.label == f"{t.weeks_min}–{t.weeks_max} weeks"


# --- time saved ------------------------------------------------------------


def test_time_saved_needs_the_visitors_own_number():
    assert time_saved(pattern="agents", before_minutes_per_week=None) is None
    assert time_saved(pattern="agents", before_minutes_per_week=0) is None


def test_time_saved_keeps_their_number_and_marks_ours_as_an_estimate():
    s = time_saved(pattern="data_platform", before_minutes_per_week=360)
    assert s is not None
    assert s.before_minutes == 360
    assert 0 < s.after_minutes < 360
    assert s.after_is_estimate is True


def test_time_saved_never_claims_zero_minutes():
    s = time_saved(pattern="agents", before_minutes_per_week=20)
    assert s is not None and s.after_minutes >= 10


# --- readiness label (B7, Lubo: "13/100" alone reads like a failing grade) ---


@pytest.mark.parametrize(
    ("score", "word"),
    [(5, "Early"), (49, "Early"), (50, "Good start"), (74, "Good start"), (75, "Ready"), (95, "Ready")],
)
def test_readiness_label_is_kind_and_matches_the_score(score, word):
    assert readiness_label(score).startswith(word)


def test_early_label_promises_exactly_what_the_timeline_does():
    """Below the line the label says week 1 is cleanup; the timeline must agree."""
    for score in (13, 49, 50):
        t = timeline(pattern="agents", readiness_score=score, sources_count=1, team_size="1-10")
        cleanup_first = t.rounds[0].label == "Clean up and connect your data"
        assert cleanup_first == ("week 1" in readiness_label(score))
