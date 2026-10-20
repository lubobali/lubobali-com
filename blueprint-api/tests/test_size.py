"""No monster files (Lubo, LuBot's rule; stricter here because it is new).

Every module stays under 400 lines. If one grows past it: split it into
a focused module, don't raise the cap. Function size is capped by ruff
(C901 / PLR09 in pyproject.toml).
"""

from pathlib import Path

import pytest

MAX_LINES = 400
ROOT = Path(__file__).resolve().parent.parent
FILES = sorted(p for d in ("blueprint", "tests", "evals") for p in (ROOT / d).glob("*.py"))


@pytest.mark.parametrize("path", FILES, ids=lambda p: f"{p.parent.name}/{p.name}")
def test_module_stays_small(path):
    lines = len(path.read_text().splitlines())
    assert lines <= MAX_LINES, f"{path.name} is {lines} lines (cap {MAX_LINES}): split it into a focused module"
