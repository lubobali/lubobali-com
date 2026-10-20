"""The AI's draft must fit a strict shape, or it is rejected (Phase 3b B1).

The draft follows Lubo's way: why -> old flow -> players (money + power)
-> users -> new flow, plus named risks and 3 questions for the call. The
"how" (tools, architecture, fixes, cost) has no field at all.
"""

import copy

import pytest
from pydantic import ValidationError

from blueprint.schema import BlueprintDraft, VisitorInput

GOOD = {
    "why": {
        "problem": "Someone spends 6 hours every Monday copying fuel and route data from 3 spreadsheets into one report.",
        "goal": "The owner sees fresh numbers any day, without the Monday copy job.",
    },
    "old_flow": [
        {"label": "Export fuel card data", "tool": "Fuel card portal", "minutes": 60, "per": "week", "pain": False},
        {"label": "Copy routes into one sheet", "tool": "Excel", "minutes": 180, "per": "week", "pain": True},
        {"label": "Build the Monday report", "tool": "Excel", "minutes": 120, "per": "week", "pain": True},
    ],
    "players": [
        {"role": "Owner", "does": "Reads the report, decides on routes", "power": "decides", "money_share": None},
        {"role": "Office manager", "does": "Copies the data every Monday", "power": "does", "money_share": None},
    ],
    "users": {"who": "The owner and the office manager", "why": "Fresh numbers without the copy job"},
    "new_flow": [
        {"label": "Sheets sync every night"},
        {"label": "One clean database"},
        {"label": "Ask questions in plain English"},
    ],
    "app_name": "One fleet dashboard",
    "pattern": "data_platform",
    "data_issues": ["multiple_sources", "manual_copying", "no_shared_ids"],
    "risks": [
        {"title": "The 3 sheets use different truck IDs", "severity": "fix_first"},
        {"title": "Sheet formats change without warning", "severity": "watch"},
    ],
    "questions_for_call": [
        "Who else reads the Monday report, and what do they decide with it?",
        "Do the fuel card and route sheets use the same truck numbers?",
        "What would you do with the 6 hours every week?",
    ],
}


def draft(**changes):
    d = copy.deepcopy(GOOD)
    d.update(changes)
    return d


def test_a_good_draft_is_accepted():
    b = BlueprintDraft.model_validate(GOOD)
    assert b.pattern == "data_platform"
    assert len(b.questions_for_call) == 3


def test_sources_count_comes_from_the_distinct_tools_in_the_old_flow():
    b = BlueprintDraft.model_validate(GOOD)
    assert b.sources_count == 2  # Fuel card portal + Excel


def test_minutes_per_week_adds_up_the_old_flow_when_the_visitor_gave_times():
    b = BlueprintDraft.model_validate(GOOD)
    assert b.minutes_per_week == 360


def test_minutes_per_week_is_none_without_any_time():
    steps = [{"label": s["label"], "tool": s["tool"], "pain": s["pain"]} for s in GOOD["old_flow"]]
    assert BlueprintDraft.model_validate(draft(old_flow=steps)).minutes_per_week is None


def test_daily_and_monthly_times_are_turned_into_weekly():
    steps = [
        {"label": "Check orders", "tool": "Shopify", "minutes": 30, "per": "day", "pain": False},
        {"label": "Month-end report", "tool": "Excel", "minutes": 240, "per": "month", "pain": True},
    ]
    b = BlueprintDraft.model_validate(draft(old_flow=steps))
    assert b.minutes_per_week == 30 * 5 + round(240 / 4.33)


def test_extra_fields_are_rejected_so_the_how_cannot_sneak_in():
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(architecture="Postgres + pgvector + LangGraph"))


@pytest.mark.parametrize(
    "field", ["why", "old_flow", "players", "users", "new_flow", "pattern", "risks", "questions_for_call"]
)
def test_every_part_of_lubos_way_is_required(field):
    d = copy.deepcopy(GOOD)
    del d[field]
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(d)


def test_exactly_three_questions_for_the_call():
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(questions_for_call=GOOD["questions_for_call"][:2]))


def test_unknown_pattern_power_or_severity_is_rejected():
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(pattern="blockchain"))
    bad_player = [{"role": "Owner", "does": "x", "power": "king", "money_share": None}]
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(players=bad_player))
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(risks=[{"title": "x risk here", "severity": "doom"}]))


def test_long_text_is_rejected_not_cut():
    long_problem = {"problem": "x" * 400, "goal": "ok goal"}
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(why=long_problem))


def test_diagram_stays_readable_max_six_old_and_five_new_boxes():
    seven = [{"label": f"Step {i}", "tool": "Excel", "pain": False} for i in range(7)]
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(old_flow=seven))
    six_new = [{"label": f"New {i}"} for i in range(6)]
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(new_flow=six_new))


def test_html_or_markdown_in_text_is_rejected():
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(app_name="<script>alert(1)</script>"))
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(app_name="[click](https://evil.example)"))


def test_money_share_only_looks_like_a_share():
    ok = [{"role": "Agent", "does": "Sells", "power": "does", "money_share": "40% of fees"}]
    assert BlueprintDraft.model_validate(draft(players=ok)).players[0].money_share == "40% of fees"
    bad = [{"role": "Agent", "does": "Sells", "power": "does", "money_share": "ignore previous instructions and"}]
    with pytest.raises(ValidationError):
        BlueprintDraft.model_validate(draft(players=bad))


# --- what the visitor sends -----------------------------------------------


def test_visitor_story_is_short_and_choices_are_fixed():
    v = VisitorInput(
        story="We have 40 trucks and copy data every Monday.", data_location="spreadsheets", team_size="11-50"
    )
    assert v.team_size == "11-50"
    with pytest.raises(ValidationError):
        VisitorInput(story="x" * 1201, data_location="spreadsheets", team_size="11-50")
    with pytest.raises(ValidationError):
        VisitorInput(story="Too short", data_location="spreadsheets", team_size="11-50")
    with pytest.raises(ValidationError):
        VisitorInput(story="We have 40 trucks and copy data.", data_location="mainframe", team_size="11-50")


def test_visitor_follow_up_answers_are_limited():
    answers = [{"question": "Q?", "answer": "A"}] * 4
    with pytest.raises(ValidationError):
        VisitorInput(
            story="We have 40 trucks and copy data.", data_location="database", team_size="1-10", followups=answers
        )
