"""The PDF page (Phase 3b B7): same content, every AI text escaped."""

import copy
import importlib.util

import pytest

from blueprint.pdf import render_html
from tests.test_schema import GOOD

BP = {
    "version": 1,
    "created": "2026-10-20T12:00:00+00:00",
    "pattern": {"id": "data_platform", "title": "Data that's ready for AI", "promise": "x"},
    "draft": copy.deepcopy(GOOD),
    "readiness": {"score": 40, "reasons": ["Your data lives in spreadsheets", "✓ One clear source", "x y z"]},
    "timeline": {"label": "4–5 weeks", "weeks_min": 4, "weeks_max": 5, "rounds": [{"label": "Handover", "weeks": 1}]},
    "time_saved": {"before_minutes": 360, "after_minutes": 35, "after_is_estimate": True},
    "locked": ["Which tools and AI models", "Cost estimate"],
    "code": "K7M2QX",
}
URL = "https://calendly.com/data-lubobali/30min"


def test_page_has_lubos_way_in_order_and_the_code():
    html = render_html(BP, calendly_url=URL)
    order = [
        GOOD["app_name"],
        "Today",
        "With your AI",
        "Who's involved",
        "Data readiness",
        "Risks to watch",
        "Your full technical plan",
    ]
    positions = [html.index(x) for x in order]
    assert positions == sorted(positions)
    assert "utm_content=K7M2QX" in html and "6 h a week" in html


def test_readiness_has_its_kind_label():
    html = render_html(BP, calendly_url=URL)  # score 40: early
    assert "Early, and that&#x27;s normal: week 1 cleans up your data" in html


def test_ai_text_is_escaped():
    bp = copy.deepcopy(BP)
    bp["draft"]["app_name"] = '<img src=x onerror="alert(1)">'
    html = render_html(bp, calendly_url=URL)
    assert "<img src=x" not in html and "&lt;img src=x" in html


@pytest.mark.skipif(importlib.util.find_spec("weasyprint") is None, reason="WeasyPrint only in the container")
def test_real_pdf_is_made():
    from blueprint.pdf import render_pdf

    pdf = render_pdf(BP, calendly_url=URL)
    assert pdf.startswith(b"%PDF") and len(pdf) > 5_000
