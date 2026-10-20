"""Limits, budget breaker and memory (Phase 3b B3.1).

Everything that protects Lubo's money and the "one blueprint per visitor"
rule lives here, in code, not in the prompt (OWASP LLM10). SQLite, one
file, no story text unless the visitor books.
"""

import sqlite3
from datetime import UTC, datetime, timedelta

import pytest

from blueprint.store import Limits, Store

NOW = datetime(2026, 10, 20, 15, 0, tzinfo=UTC)
LIM = Limits(
    monthly_budget_usd=20.0,
    daily_budget_usd=3.0,
    blueprints_per_visitor=1,
    blueprints_per_ip_week=1,
    followups_per_ip_day=6,
)


@pytest.fixture
def store(tmp_path):
    return Store(tmp_path / "bp.sqlite", salt="test-salt", limits=LIM)


# --- one blueprint per visitor / per IP ------------------------------------


def test_a_new_visitor_may_get_a_blueprint(store):
    assert store.can_generate(visitor="v1", ip="1.2.3.4", now=NOW) == "ok"


def test_a_visitor_who_got_one_cannot_get_another(store):
    store.record_blueprint(visitor="v1", ip="1.2.3.4", now=NOW)
    assert store.can_generate(visitor="v1", ip="9.9.9.9", now=NOW + timedelta(days=200)) == "already_have"


def test_same_ip_new_browser_waits_a_week(store):
    store.record_blueprint(visitor="v1", ip="1.2.3.4", now=NOW)
    assert store.can_generate(visitor="v2", ip="1.2.3.4", now=NOW + timedelta(days=3)) == "ip_week"
    assert store.can_generate(visitor="v2", ip="1.2.3.4", now=NOW + timedelta(days=8)) == "ok"


def test_visitor_memory_ends_after_12_months(store):
    store.record_blueprint(visitor="v1", ip="1.2.3.4", now=NOW)
    store.cleanup(now=NOW + timedelta(days=366))
    assert store.can_generate(visitor="v1", ip="5.5.5.5", now=NOW + timedelta(days=366)) == "ok"


def test_ids_and_ips_are_stored_hashed_never_plain(store, tmp_path):
    store.record_blueprint(visitor="visitor-abc", ip="203.0.113.7", now=NOW)
    raw = (tmp_path / "bp.sqlite").read_bytes()
    assert b"visitor-abc" not in raw and b"203.0.113.7" not in raw


# --- follow-up calls cost money too ------------------------------------------


def test_followups_per_ip_per_day(store):
    for _ in range(LIM.followups_per_ip_day):
        assert store.take_followup(ip="1.2.3.4", now=NOW) is True
    assert store.take_followup(ip="1.2.3.4", now=NOW) is False
    assert store.take_followup(ip="1.2.3.4", now=NOW + timedelta(days=1)) is True


# --- budget breaker ----------------------------------------------------------


def test_budget_is_reserved_before_the_call_and_settled_after(store):
    r = store.reserve(estimate_usd=0.10, now=NOW)
    assert r is not None
    assert store.spent_today(now=NOW) == pytest.approx(0.10)
    store.settle(r, actual_usd=0.04)
    assert store.spent_today(now=NOW) == pytest.approx(0.04)


def test_breaker_trips_before_passing_the_daily_cap(store):
    r = store.reserve(estimate_usd=2.95, now=NOW)
    store.settle(r, actual_usd=2.95)
    assert store.reserve(estimate_usd=0.10, now=NOW) is None
    assert store.reserve(estimate_usd=0.10, now=NOW + timedelta(days=1)) is not None


def test_breaker_trips_before_passing_the_monthly_cap(store):
    for d in range(1, 7):  # 6 earlier days this month x $2.90 = $17.40
        r = store.reserve(estimate_usd=2.90, now=NOW - timedelta(days=d))
        store.settle(r, actual_usd=2.90)
    assert store.spent_month(now=NOW) == pytest.approx(17.40)
    assert store.reserve(estimate_usd=2.90, now=NOW) is None  # would be $20.30
    r = store.reserve(estimate_usd=2.50, now=NOW)  # $19.90 still fits
    assert r is not None
    store.settle(r, actual_usd=2.50)
    assert store.reserve(estimate_usd=0.20, now=NOW) is None  # would be $20.10


def test_failed_call_releases_its_reservation(store):
    r = store.reserve(estimate_usd=1.0, now=NOW)
    store.settle(r, actual_usd=0.0)
    assert store.spent_today(now=NOW) == 0.0


def test_month_resets_on_the_first(store):
    r = store.reserve(estimate_usd=2.9, now=datetime(2026, 10, 31, 23, 0, tzinfo=UTC))
    store.settle(r, actual_usd=2.9)
    assert store.spent_month(now=datetime(2026, 11, 1, 1, 0, tzinfo=UTC)) == 0.0


# --- booked blueprints (90 days) + funnel -----------------------------------


def test_booked_blueprint_is_kept_90_days_then_deleted(store):
    code = store.save_booked(blueprint={"why": {"problem": "x"}}, now=NOW)
    assert len(code) == 6 and code.isalnum() and code.isupper()
    assert store.get_booked(code, now=NOW + timedelta(days=89)) == {"why": {"problem": "x"}}
    store.cleanup(now=NOW + timedelta(days=91))
    assert store.get_booked(code, now=NOW + timedelta(days=91)) is None


def test_funnel_counts_only_numbers(store):
    store.count("started", now=NOW)
    store.count("started", now=NOW)
    store.count("finished", now=NOW)
    assert store.funnel(day=NOW.date()) == {"started": 2, "finished": 1}
    with pytest.raises(ValueError):
        store.count("email:someone@x.com", now=NOW)


def test_database_file_is_plain_sqlite(tmp_path, store):
    store.count("started", now=NOW)
    with sqlite3.connect(tmp_path / "bp.sqlite") as c:
        tables = {r[0] for r in c.execute("select name from sqlite_master where type='table'")}
    assert {"visitors", "ip_events", "spend", "booked", "funnel"} <= tables


def test_twenty_requests_at_the_same_moment_never_pass_the_cap(store):
    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor(max_workers=20) as pool:
        results = list(pool.map(lambda _: store.reserve(estimate_usd=0.20, now=NOW), range(20)))
    assert sum(r is not None for r in results) == 15  # $3.00 / $0.20
    assert store.spent_today(now=NOW) == pytest.approx(3.0)


def test_booked_blueprint_can_be_saved_under_a_given_code(store):
    code = store.save_booked(blueprint={"signature": "s1", "x": 1}, now=NOW, code="K7M2QX")
    assert code == "K7M2QX"
    assert store.get_booked("K7M2QX", now=NOW) == {"signature": "s1", "x": 1}
    assert store.save_booked(blueprint={"signature": "s1", "x": 1}, now=NOW, code="K7M2QX") == "K7M2QX"
