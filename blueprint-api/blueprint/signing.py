"""Tickets and blueprint signatures (HMAC-SHA256, server key) (B3).

- Ticket: proof that /followups saw THIS story (same visitor, words, data
  location, team size) and found it a real business problem, valid 1 hour.
  /generate only works with it, so a bot can't skip the check or swap the
  story in between.
- Signature: proof a blueprint came from us, so /book can't be fed a fake.
Pure functions; the key never leaves the server.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json


def _hmac(key: str, data: str) -> str:
    return hmac.new(key.encode(), data.encode(), hashlib.sha256).hexdigest()


def story_fingerprint(visitor_id: str, story: str, data_location: str, team_size: str) -> str:
    """Hash of everything the ticket vouches for.

    >>> len(story_fingerprint("v", "story", "database", "1-10"))
    64
    """
    return hashlib.sha256(f"{visitor_id}|{story}|{data_location}|{team_size}".encode()).hexdigest()


def make_ticket(key: str, fingerprint: str, *, now: float, ttl_s: int) -> str:
    payload = f"{fingerprint}|{int(now) + ttl_s}"
    b64 = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    return f"{b64}.{_hmac(key, payload)}"


def ticket_ok(key: str, ticket: str, fingerprint: str, *, now: float) -> bool:
    """Signed by us, for this exact story, not expired.

    >>> t = make_ticket("k", "abc", now=100, ttl_s=60)
    >>> ticket_ok("k", t, "abc", now=150), ticket_ok("k", t, "abd", now=150), ticket_ok("k", t, "abc", now=161)
    (True, False, False)
    """
    try:
        b64, sig = ticket.split(".", 1)
        payload = base64.urlsafe_b64decode(b64 + "=" * (-len(b64) % 4)).decode()
        got_fingerprint, exp = payload.rsplit("|", 1)
        expires = int(exp)
    except (ValueError, UnicodeDecodeError):
        return False
    return (
        hmac.compare_digest(sig, _hmac(key, payload))
        and hmac.compare_digest(got_fingerprint, fingerprint)
        and expires > now
    )


def sign_blueprint(key: str, blueprint: dict) -> str:
    """Signature over the blueprint (without its own signature field)."""
    body = {k: v for k, v in blueprint.items() if k != "signature"}
    return _hmac(key, json.dumps(body, sort_keys=True, separators=(",", ":"), ensure_ascii=False))


def blueprint_ok(key: str, blueprint: dict) -> bool:
    sig = blueprint.get("signature")
    return isinstance(sig, str) and hmac.compare_digest(sig, sign_blueprint(key, blueprint))
