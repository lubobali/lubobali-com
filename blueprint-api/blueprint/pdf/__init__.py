"""The blueprint as a dark navy PDF (Phase 3b B7).

render_html(bp) builds a print page from a signed blueprint (every text
escaped: it came from the AI); render_pdf(bp) turns it into PDF bytes
with WeasyPrint. Same content and order as the card on the site: why ->
today vs with AI -> players -> the 3 numbers -> risks + questions -> the
locked "how" + Book a call with the visitor's code.
"""

from __future__ import annotations

from html import escape as e
from pathlib import Path
from urllib.parse import urlencode

from blueprint.rules import readiness_label

HERE = Path(__file__).parent
POWER = {
    "decides": "decides",
    "approves": "approves",
    "does": "does the work",
    "uses": "uses it",
    "informed": "kept in the loop",
}


def _duration(minutes: int) -> str:
    """360 -> "6 h", 90 -> "1.5 h", 35 -> "35 min" (same as the site).

    >>> _duration(360), _duration(90), _duration(35)
    ('6 h', '1.5 h', '35 min')
    """
    if minutes < 60:
        return f"{minutes} min"
    hours = round(minutes / 60 * 2) / 2
    return f"{hours:.0f} h" if hours == int(hours) else f"{hours:.1f} h"


def _initials(role: str) -> str:
    words = [w for w in "".join(c if c.isalpha() else " " for c in role).split() if w]
    return "".join(w[0].upper() for w in words[:2])


def _flow(bp: dict) -> str:
    d, t = bp["draft"], bp.get("time_saved")
    old = "".join(
        f'<div class="step{" pain" if s["pain"] else ""}">'
        + ('<span class="pain-tag">PAIN POINT</span>' if s["pain"] else "")
        + f'<div class="step-label">{e(s["label"])}</div>'
        + f'<div class="step-meta">{e(s["tool"])}'
        + (f" · {_duration(s['minutes'])} a {e(s['per'])}" if s.get("minutes") and s.get("per") else "")
        + "</div></div>"
        for s in d["old_flow"]
    )
    new = "".join(f'<div class="step"><div class="step-label">{e(s["label"])}</div></div>' for s in d["new_flow"])
    before = f'<span class="chip">{_duration(t["before_minutes"])} a week</span>' if t else ""
    after = f'<span class="chip">~{_duration(t["after_minutes"])} a week (estimate)</span>' if t else ""
    return (
        '<div class="block"><table class="flow"><tr>'
        f'<td><div class="panel"><div class="panel-head">{before}<span class="title">Today</span></div>{old}</div></td>'
        '<td class="arrow">→</td>'
        f'<td><div class="panel new"><div class="panel-head">{after}<span class="title">With your AI</span></div>'
        f'<div class="app">{e(d["app_name"])}</div>{new}</div></td>'
        "</tr></table></div>"
    )


def _players(bp: dict) -> str:
    rows = "".join(
        f'<tr><td class="avatar"><span>{e(_initials(p["role"]))}</span></td><td class="who">'
        f'<div class="role">{e(p["role"])}</div>'
        f'<div class="power">{POWER.get(p["power"], e(p["power"]))}'
        + (f" · {e(p['money_share'])}" if p.get("money_share") else "")
        + f'</div><div class="does">{e(p["does"])}</div></td></tr>'
        for p in bp["draft"]["players"]
    )
    return f'<div class="block"><span class="label">Who\'s involved</span><table class="players">{rows}</table></div>'


def _stats(bp: dict) -> str:
    r, tl, t = bp["readiness"], bp["timeline"], bp.get("time_saved")
    reasons = "".join(
        f'<li class="good">{e(x[1:].strip())}</li>' if x.startswith("✓") else f"<li>{e(x)}</li>" for x in r["reasons"]
    )
    rounds = "".join(
        f'<li><span class="week">WEEK {i}</span>{e(x["label"])}</li>' for i, x in enumerate(tl["rounds"], 1)
    )
    time = ""
    if t:
        after = max(4, round(t["after_minutes"] / t["before_minutes"] * 100))
        time = (
            '<td><span class="label">Time each week</span>'
            f'<div class="bar-name">Today · {_duration(t["before_minutes"])}</div><div class="bar" style="width:100%"></div>'
            f'<div class="bar-name">With your AI · ~{_duration(t["after_minutes"])}</div>'
            f'<div class="bar after" style="width:{after}%"></div>'
            '<p class="note">From your own numbers. "With your AI" is an estimate.</p></td>'
        )
    return (
        '<div class="block"><table class="stats"><tr>'
        f'<td><span class="label">Data readiness</span><div class="big">{r["score"]}<small>/100</small></div>'
        f'<div class="meter"><span style="width:{r["score"]}%"></span></div>'
        f'<p class="ready-label">{e(readiness_label(r["score"]))}</p><ul class="reasons">{reasons}</ul></td>'
        f'<td><span class="label">Timeline</span><div class="big">{e(tl["label"])}</div><ol class="rounds">{rounds}</ol></td>'
        f"{time}</tr></table></div>"
    )


def _risks_and_questions(bp: dict) -> str:
    d = bp["draft"]
    risks = "".join(
        f'<div class="risk"><span class="tag{" fix" if x["severity"] == "fix_first" else ""}">'
        f"{'Fix first' if x['severity'] == 'fix_first' else 'Watch'}</span>{e(x['title'])}</div>"
        for x in d["risks"]
    )
    qs = "".join(f'<li><span class="n">{i}.</span>{e(q)}</li>' for i, q in enumerate(d["questions_for_call"], 1))
    return (
        '<div class="block"><table class="two"><tr>'
        f'<td><span class="label">Risks to watch</span><div style="margin-top:6pt">{risks}</div></td>'
        f'<td><span class="label">3 questions I\'d ask you on our call</span><ol class="questions" style="margin-top:6pt">{qs}</ol></td>'
        "</tr></table></div>"
    )


def _locked(bp: dict, calendly_url: str) -> str:
    code = bp.get("code", "")
    url = f"{calendly_url}?{urlencode({'utm_source': 'lubobali.com', 'utm_medium': 'blueprint-pdf', 'utm_content': code})}"
    items = "".join(f"<li>{e(x)}</li>" for x in bp["locked"])
    return (
        '<div class="locked"><h2>Your full technical plan</h2>'
        f"<ul>{items}</ul>"
        '<p style="margin-top:8pt;color:#cdd9ec">We go through it together on a free 30-min call.</p>'
        f'<a class="cta" href="{e(url)}">Book a free 30-min call</a>'
        f'<p class="code">Your blueprint code: <b>{e(code)}</b> · Lubo Bali · data@lubobali.com</p></div>'
    )


def render_html(bp: dict, *, calendly_url: str) -> str:
    d = bp["draft"]
    head = (
        f'<p class="eyebrow">AI blueprint<span class="pattern">{e(bp["pattern"]["title"])}</span></p>'
        f'<h1>{e(d["app_name"])}</h1><p class="why">{e(d["why"]["problem"])}</p>'
        f'<p class="goal"><span class="label">Goal</span>{e(d["why"]["goal"])}</p>'
    )
    body = head + _flow(bp) + _players(bp) + _stats(bp) + _risks_and_questions(bp) + _locked(bp, calendly_url)
    title = f"AI blueprint: {e(d['app_name'])}"
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{title}</title><link rel="stylesheet" href="blueprint.css"></head><body>{body}</body></html>'


def render_pdf(bp: dict, *, calendly_url: str) -> bytes:
    from weasyprint import HTML  # heavy import, only when a PDF is made

    return HTML(string=render_html(bp, calendly_url=calendly_url), base_url=str(HERE)).write_pdf()
