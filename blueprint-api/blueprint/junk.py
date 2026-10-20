"""Free filter for obvious junk, before the paid AI (Phase 3b B9.4).

"asdf asdf asdf" cost half a cent: the AI had to read it to say "not a
story". These rules catch only the obvious, on purpose: blocking a real
visitor (short, broken English, any language) is far worse than paying
half a cent. Junk gets the same "not a story" answer the AI gives.
"""

from __future__ import annotations

import re

_WORD = re.compile(r"[^\W\d_]+")  # letters of any language
_LATIN = re.compile(r"[A-Za-z]+")
_VOWEL = re.compile(r"[aeiouy]", re.IGNORECASE)
_REPEAT = re.compile(r"(.)\1{5,}")  # the same character 6+ times

MIN_DISTINCT_WORDS = 4
MIN_LETTER_SHARE = 0.5
MAX_NO_VOWEL_SHARE = 0.5


def is_junk(story: str) -> bool:
    """True only for text that cannot be a business story.

    >>> is_junk("asdf asdf asdf asdf asdf"), is_junk("We copy invoices by hand. Too slow.")
    (True, False)
    """
    words = [w.lower() for w in _WORD.findall(story)]
    if len(set(words)) < MIN_DISTINCT_WORDS or _REPEAT.search(story):
        return True
    chars = [c for c in story if not c.isspace()]
    if sum(c.isalpha() for c in chars) < MIN_LETTER_SHARE * len(chars):
        return True
    # Keyboard mashing: most Latin words have no vowel. Other scripts skip this.
    latin = [w for w in _LATIN.findall(story) if len(w) >= 2]
    no_vowel = sum(1 for w in latin if not _VOWEL.search(w))
    return bool(latin) and no_vowel > MAX_NO_VOWEL_SHARE * len(latin)
