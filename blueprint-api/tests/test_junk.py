"""Free filter for obvious junk before the paid AI (B9.4).

Conservative on purpose: blocking a real visitor is far worse than
paying half a cent for junk. Every real story we have must pass.
"""

import json
from pathlib import Path

import pytest

from blueprint.junk import is_junk

EVALS = Path(__file__).parent.parent / "evals"


@pytest.mark.parametrize(
    "story",
    [
        "asdf asdf asdf asdf asdf asdf",
        "sdfg hjkl qwrt zxcv bnm fghj klzx",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "123 456 789 000 !!!! ???? ....",
        "test test test test test test test",
        "hello hello world world hello world",
    ],
)
def test_obvious_junk_is_caught(story):
    assert is_junk(story)


@pytest.mark.parametrize("file", ["stories.json", "attacks.json"])
def test_every_story_we_test_with_passes(file):
    for s in json.loads((EVALS / file).read_text()):
        assert not is_junk(s["story"]), s["id"]


@pytest.mark.parametrize(
    "story",
    [
        "We copy invoices by hand. Too slow.",
        "my shop sell shoes, i count stock in excel every day, take 3 hour",
        "Нашата фирма въвежда фактури на ръка всеки ден, отнема 3 часа.",
        "We lose $20k a month, 30% of claims denied, 2 hrs/day retyping.",
        "CRM -> Excel -> QuickBooks, every Friday, 4h. HR + ops + CFO.",
        "Our 3PL WMS and TMS don't sync; SKU counts drift by Friday.",
    ],
)
def test_real_but_unusual_stories_pass(story):
    assert not is_junk(story)
