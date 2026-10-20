"""Email me this blueprint as a PDF (Phase 3b B7).

The visitor gets the PDF; Lubo gets a lead email (their address + code +
the blueprint + the PDF). Only signed blueprints, 1 copy per blueprint,
a few per IP per day, a daily cap: nobody can use the tool to spam
strangers. The mail server is faked (we test our rules, not SMTP).
"""

import pytest
from fastapi.testclient import TestClient

from blueprint.api import Settings, create_app
from blueprint.emailer import is_email
from blueprint.store import Limits
from tests.test_api import FakeAI, blueprint_for


class FakeMail:
    def __init__(self, fail=False):
        self.sent, self.fail = [], fail

    def __call__(self, msg):
        if self.fail:
            raise OSError("smtp down")
        self.sent.append(msg)


def ticking_clock():
    """Each call 1 minute later: blueprints made in a row really differ."""
    from datetime import UTC, datetime, timedelta

    t = {"now": datetime(2026, 10, 20, 12, 0, tzinfo=UTC)}

    def clock():
        t["now"] += timedelta(minutes=1)
        return t["now"]

    return clock


def make(tmp_path, mail=None, limits=None):
    s = Settings(
        db_path=str(tmp_path / "bp.sqlite"),
        salt="s",
        signing_key="k",
        limits=limits or Limits(blueprints_per_ip_week=99),
    )
    mail = mail or FakeMail()
    pdf = lambda bp, calendly_url: b"%PDF-fake"  # noqa: E731 (real PDF tested in test_pdf.py)
    app = create_app(s, ask=FakeAI(), send_mail=mail, render_pdf=pdf, clock=ticking_clock())
    return TestClient(app), mail


def copy(client, bp, email="owner@example.com"):
    return client.post("/api/blueprint/copy", json={"blueprint": bp, "email": email})


def test_visitor_gets_the_pdf_and_lubo_gets_the_lead(tmp_path):
    client, mail = make(tmp_path)
    bp = blueprint_for(client)
    r = copy(client, bp)
    assert r.status_code == 200 and r.json() == {"sent": True}
    to_visitor, to_lubo = mail.sent
    assert to_visitor["To"] == "owner@example.com" and to_visitor["Reply-To"] == "data@lubobali.com"
    assert bp["draft"]["app_name"] in to_visitor["Subject"]
    assert to_lubo["To"] == "data@lubobali.com" and to_lubo["Reply-To"] == "owner@example.com"
    assert bp["code"] in to_lubo["Subject"]
    for m in (to_visitor, to_lubo):
        pdfs = [p for p in m.iter_attachments() if p.get_content_type() == "application/pdf"]
        assert len(pdfs) == 1 and pdfs[0].get_content() == b"%PDF-fake"


def test_lubos_email_has_the_whole_blueprint_as_text(tmp_path):
    client, mail = make(tmp_path)
    bp = blueprint_for(client)
    copy(client, bp)
    body = mail.sent[1].get_body(("plain",)).get_content()
    assert "owner@example.com" in body and "MY 3 QUESTIONS FOR THE CALL" in body


def test_only_one_copy_per_blueprint(tmp_path):
    client, mail = make(tmp_path)
    bp = blueprint_for(client)
    assert copy(client, bp).status_code == 200
    r = copy(client, bp, "someone-else@example.com")
    assert r.status_code == 409 and r.json()["code"] == "copy_sent"
    assert len(mail.sent) == 2


def test_a_fake_or_changed_blueprint_is_not_sent(tmp_path):
    client, mail = make(tmp_path)
    bp = blueprint_for(client)
    bp["draft"]["app_name"] = "Planted by a spammer"
    assert copy(client, bp).json()["code"] == "start_again"
    assert mail.sent == []


@pytest.mark.parametrize(
    "email",
    ["not-an-email", "a@b", "owner@example.com\r\nBcc: victim@example.com", "x" * 250 + "@example.com", ""],
)
def test_bad_or_injected_addresses_are_refused(tmp_path, email):
    client, mail = make(tmp_path)
    r = copy(client, blueprint_for(client), email)
    assert r.status_code == 400 and mail.sent == []


def test_per_ip_and_daily_caps(tmp_path):
    client, mail = make(tmp_path, limits=Limits(blueprints_per_ip_week=99, copies_per_ip_day=2, copies_per_day=99))
    bps = [blueprint_for(client) for _ in range(3)]
    assert copy(client, bps[0]).status_code == 200
    assert copy(client, bps[1]).status_code == 200
    r = copy(client, bps[2])
    assert r.status_code == 429 and r.json()["code"] == "slow_down"


def test_mail_server_down_is_a_friendly_error_and_can_be_retried(tmp_path):
    mail = FakeMail(fail=True)
    client, _ = make(tmp_path, mail=mail)
    bp = blueprint_for(client)
    r = copy(client, bp)
    assert r.status_code == 502 and r.json()["code"] == "try_again"
    mail.fail = False
    assert copy(client, bp).status_code == 200


def test_is_email():
    assert is_email("owner@example.com") and is_email("a.b+c@sub.example.co")
    assert not is_email("owner@example") and not is_email("own er@example.com") and not is_email("a@b.c\nx")
