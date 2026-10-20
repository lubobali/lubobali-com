"""Memory, limits and the budget breaker (Phase 3b B3.1).

One SQLite file (no new database server, nothing shared with LuBot):
- visitors:  hashed visitor IDs that already got their blueprint (12 months)
- ip_events: hashed IPs + what they did (blueprint / follow-up), short window
- spend:     money reserved before each AI call, settled after (the breaker)
- booked:    blueprints of visitors who clicked Book a call (90 days)
- funnel:    daily counts only (started / finished / booked / ...)
No story text is stored, except a booked blueprint. IDs and IPs are
hashed with a server-only salt, never stored plain.

Every limit is a setting (Limits), not code (Lubo: raise them when the
tool brings clients).
"""

from __future__ import annotations

import hashlib
import json
import secrets
import sqlite3
import threading
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path

VISITOR_DAYS = 365
BOOKED_DAYS = 90
IP_WINDOW_DAYS = 7
FUNNEL_EVENTS = frozenset({"started", "not_a_story", "finished", "refused", "booked", "copy_sent"})
_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I

_SCHEMA = """
create table if not exists visitors (hash text primary key, created text not null);
create table if not exists ip_events (hash text not null, kind text not null, ts text not null);
create index if not exists ip_events_hash on ip_events (hash, kind, ts);
create table if not exists spend (
    id integer primary key, day text not null, month text not null,
    amount real not null, settled integer not null default 0
);
create table if not exists booked (code text primary key, blueprint text not null, created text not null,
    sig text unique);
create table if not exists funnel (day text not null, event text not null, n integer not null,
    primary key (day, event));
"""


@dataclass(frozen=True)
class Limits:
    monthly_budget_usd: float = 20.0
    daily_budget_usd: float = 3.0
    blueprints_per_visitor: int = 1
    blueprints_per_ip_week: int = 1
    followups_per_ip_day: int = 6


@dataclass(frozen=True)
class Reservation:
    id: int


def _iso(t: datetime) -> str:
    return t.isoformat(timespec="seconds")


class Store:
    def __init__(self, path: str | Path, *, salt: str, limits: Limits) -> None:
        if not salt:
            raise ValueError("salt is required (server secret)")
        self.path = str(path)
        self.salt = salt
        self.limits = limits
        self._lock = threading.Lock()
        # Schema once, outside _tx (executescript commits on its own).
        c = sqlite3.connect(self.path)
        try:
            c.execute("pragma journal_mode=wal")
            c.executescript(_SCHEMA)
        finally:
            c.close()

    # -- plumbing -----------------------------------------------------------

    @contextmanager
    def _tx(self):
        """One write at a time, in one transaction (BEGIN IMMEDIATE)."""
        with self._lock:
            c = sqlite3.connect(self.path, timeout=10, isolation_level=None)
            try:
                c.execute("begin immediate")
                yield c
                c.execute("commit")
            except BaseException:
                c.execute("rollback")
                raise
            finally:
                c.close()

    def _hash(self, value: str) -> str:
        return hashlib.sha256(f"{self.salt}:{value}".encode()).hexdigest()

    # -- one blueprint per visitor / per IP -----------------------------------

    def can_generate(self, *, visitor: str, ip: str, now: datetime) -> str:
        """'ok', 'already_have' (this visitor) or 'ip_week' (this IP)."""
        since = _iso(now - timedelta(days=IP_WINDOW_DAYS))
        with self._tx() as c:
            got = c.execute("select 1 from visitors where hash = ?", (self._hash(visitor),)).fetchone()
            if got and self.limits.blueprints_per_visitor <= 1:
                return "already_have"
            n = c.execute(
                "select count(*) from ip_events where hash = ? and kind = 'blueprint' and ts > ?",
                (self._hash(ip), since),
            ).fetchone()[0]
        return "ip_week" if n >= self.limits.blueprints_per_ip_week else "ok"

    def record_blueprint(self, *, visitor: str, ip: str, now: datetime) -> None:
        with self._tx() as c:
            c.execute("insert or ignore into visitors (hash, created) values (?, ?)", (self._hash(visitor), _iso(now)))
            c.execute("insert into ip_events (hash, kind, ts) values (?, 'blueprint', ?)", (self._hash(ip), _iso(now)))

    def take_followup(self, *, ip: str, now: datetime) -> bool:
        """Count a follow-up call for this IP today; False when over the limit."""
        day_start = _iso(datetime.combine(now.date(), datetime.min.time(), tzinfo=now.tzinfo))
        h = self._hash(ip)
        with self._tx() as c:
            n = c.execute(
                "select count(*) from ip_events where hash = ? and kind = 'followup' and ts >= ?", (h, day_start)
            ).fetchone()[0]
            if n >= self.limits.followups_per_ip_day:
                return False
            c.execute("insert into ip_events (hash, kind, ts) values (?, 'followup', ?)", (h, _iso(now)))
        return True

    # -- budget breaker -------------------------------------------------------

    def reserve(self, *, estimate_usd: float, now: datetime) -> Reservation | None:
        """Reserve the worst-case cost BEFORE the AI call. None = the call
        would pass today's or this month's cap: don't make it."""
        day, month = now.date().isoformat(), now.strftime("%Y-%m")
        with self._tx() as c:
            spent_day = c.execute("select coalesce(sum(amount), 0) from spend where day = ?", (day,)).fetchone()[0]
            spent_month = c.execute("select coalesce(sum(amount), 0) from spend where month = ?", (month,)).fetchone()[
                0
            ]
            if spent_day + estimate_usd > self.limits.daily_budget_usd + 1e-9:
                return None
            if spent_month + estimate_usd > self.limits.monthly_budget_usd + 1e-9:
                return None
            cur = c.execute(
                "insert into spend (day, month, amount, settled) values (?, ?, ?, 0)", (day, month, estimate_usd)
            )
            return Reservation(id=int(cur.lastrowid))

    def settle(self, reservation: Reservation, *, actual_usd: float) -> None:
        """Replace the reservation with what the call really cost (0 if it failed)."""
        with self._tx() as c:
            c.execute("update spend set amount = ?, settled = 1 where id = ?", (max(0.0, actual_usd), reservation.id))

    def spent_today(self, *, now: datetime) -> float:
        with self._tx() as c:
            return c.execute(
                "select coalesce(sum(amount), 0) from spend where day = ?", (now.date().isoformat(),)
            ).fetchone()[0]

    def spent_month(self, *, now: datetime) -> float:
        with self._tx() as c:
            return c.execute(
                "select coalesce(sum(amount), 0) from spend where month = ?", (now.strftime("%Y-%m"),)
            ).fetchone()[0]

    # -- booked blueprints + funnel -------------------------------------------

    def save_booked(self, *, blueprint: dict, now: datetime) -> str:
        """Keep a booked visitor's blueprint 90 days; return its short code."""
        body = json.dumps(blueprint, ensure_ascii=False, separators=(",", ":"))
        sig = blueprint.get("signature")
        with self._tx() as c:
            # Same signed blueprint booked again = same code (no booking spam).
            if isinstance(sig, str):
                row = c.execute("select code from booked where sig = ?", (sig,)).fetchone()
                if row:
                    return row[0]
            while True:
                code = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(6))
                if not c.execute("select 1 from booked where code = ?", (code,)).fetchone():
                    break
            c.execute(
                "insert into booked (code, blueprint, created, sig) values (?, ?, ?, ?)",
                (code, body, _iso(now), sig if isinstance(sig, str) else None),
            )
        return code

    def get_booked(self, code: str, *, now: datetime) -> dict | None:
        since = _iso(now - timedelta(days=BOOKED_DAYS))
        with self._tx() as c:
            row = c.execute("select blueprint from booked where code = ? and created > ?", (code, since)).fetchone()
        return json.loads(row[0]) if row else None

    def count(self, event: str, *, now: datetime) -> None:
        if event not in FUNNEL_EVENTS:
            raise ValueError(f"unknown funnel event: {event}")
        with self._tx() as c:
            c.execute(
                "insert into funnel (day, event, n) values (?, ?, 1) on conflict (day, event) do update set n = n + 1",
                (now.date().isoformat(), event),
            )

    def funnel(self, *, day: date) -> dict[str, int]:
        with self._tx() as c:
            rows = c.execute("select event, n from funnel where day = ?", (day.isoformat(),)).fetchall()
        return dict(rows)

    # -- retention ------------------------------------------------------------

    def cleanup(self, *, now: datetime) -> None:
        """Delete what we promised to delete (run daily)."""
        with self._tx() as c:
            c.execute("delete from visitors where created <= ?", (_iso(now - timedelta(days=VISITOR_DAYS)),))
            c.execute("delete from ip_events where ts <= ?", (_iso(now - timedelta(days=IP_WINDOW_DAYS + 1)),))
            c.execute("delete from booked where created <= ?", (_iso(now - timedelta(days=BOOKED_DAYS)),))
