"""When the AI can't be used, visitors get "busy" and Lubo gets ONE email a day (B9.3).

2026-10-20 the shared OpenRouter balance ran dry (HTTP 402) and visitors
saw "something went wrong, try again", which no retry could fix. Now:
no credit (402), key refused (401/403, e.g. after a rotation) and the
budget breaker all answer "busy, book a call", and Lubo gets one alert
per reason per day (a flood of visitors can't flood his inbox).
"""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from blueprint.api import Settings, create_app
from blueprint.emailer import smtp_sender
from blueprint.llm import LLMError
from blueprint.store import Limits
from tests.test_api import FakeAI, followups, visitor
from tests.test_copy import FakeMail


class BrokenAI(FakeAI):
    def __init__(self, status):
        super().__init__()
        self.status = status

    def __call__(self, messages, model, **kw):
        self.calls.append(model.__name__)
        raise LLMError(f"model call failed: HTTP {self.status}", status=self.status)


def make(tmp_path, ai, mail=None, limits=None):
    t = {"now": datetime(2026, 10, 20, 12, 0, tzinfo=UTC)}
    s = Settings(db_path=str(tmp_path / "bp.sqlite"), salt="s", signing_key="k", limits=limits or Limits())
    mail = mail or FakeMail()
    app = create_app(s, ask=ai, send_mail=mail, render_pdf=lambda bp, calendly_url: b"", clock=lambda: t["now"])
    return TestClient(app), mail, t


@pytest.mark.parametrize(
    ("status", "words"), [(402, "out of money"), (401, "key doesn't work"), (403, "key doesn't work")]
)
def test_no_credit_or_a_refused_key_means_busy_and_one_alert(tmp_path, status, words):
    client, mail, _ = make(tmp_path, BrokenAI(status))
    r = followups(client, visitor())
    assert r.status_code == 503 and r.json()["code"] == "busy"
    (alert,) = mail.sent
    assert alert["To"] == "data@lubobali.com" and words in alert["Subject"].lower()
    assert "Fix:" in alert.get_content() and "once a day" in alert.get_content()


def test_only_one_alert_a_day_then_again_tomorrow(tmp_path):
    client, mail, t = make(tmp_path, BrokenAI(402))
    for _ in range(3):
        assert followups(client, visitor()).json()["code"] == "busy"
    assert len(mail.sent) == 1
    t["now"] += timedelta(days=1)
    followups(client, visitor())
    assert len(mail.sent) == 2


def test_the_budget_breaker_also_alerts_once(tmp_path):
    client, mail, _ = make(tmp_path, FakeAI(), limits=Limits(daily_budget_usd=0.0))
    for _ in range(2):
        assert followups(client, visitor()).json()["code"] == "busy"
    (alert,) = mail.sent
    assert "spending limit" in alert["Subject"].lower()


@pytest.mark.parametrize("status", [500, 429, None])
def test_other_failures_stay_try_again_with_no_alert(tmp_path, status):
    client, mail, _ = make(tmp_path, BrokenAI(status))
    r = followups(client, visitor())
    assert r.status_code == 502 and r.json()["code"] == "try_again" and mail.sent == []


def test_a_failed_alert_never_breaks_the_busy_answer(tmp_path):
    client, _, _ = make(tmp_path, BrokenAI(402), mail=FakeMail(fail=True))
    assert followups(client, visitor()).json()["code"] == "busy"


def test_no_smtp_login_fails_at_once_without_the_network():
    send = smtp_sender(host="mail.invalid", port=587, user="", password="")
    with pytest.raises(OSError, match="not set up"):
        send(object())
