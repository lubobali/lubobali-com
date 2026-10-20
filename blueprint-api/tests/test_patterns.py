"""The 4 kinds of projects Lubo really builds (Phase 3b B1).

The AI picks one and tailors it; it never invents a fifth. Each pattern
has the "what" (free) and the list of what stays locked for the call.
"""

from blueprint.patterns import LOCKED, PATTERNS
from blueprint.schema import PATTERN_IDS


def test_four_patterns_match_the_home_page_cards():
    assert set(PATTERNS) == set(PATTERN_IDS) == {"agents", "data_platform", "trusted_answers", "cost_control"}


def test_each_pattern_has_a_title_and_a_plain_promise():
    for p in PATTERNS.values():
        assert 5 < len(p.title) <= 40
        assert 20 < len(p.promise) <= 160


def test_each_pattern_has_rounds_that_build_toward_handover():
    for p in PATTERNS.values():
        assert 1 <= len(p.rounds) <= 3
        assert "Handover" not in p.rounds  # added by the timeline rule


def test_the_locked_how_is_the_same_promise_everywhere():
    assert LOCKED == (
        "Which tools and AI models",
        "How it is built (architecture)",
        "How I solve each risk",
        "Cost estimate",
    )
