"""The two emails of "Email me this blueprint as a PDF" (Phase 3b B7).

1. To the visitor: a short personal note from Lubo + the PDF. Reply-To
   = Lubo, so a reply reaches him.
2. To Lubo (the lead alert): their address + code + the whole blueprint
   as text + the same PDF. Reply-To = the visitor.
Sent through data@lubobali.com on Namecheap Private Email (SPF + DKIM
already set for lubobali.com). Addresses are checked strictly, so no
header injection ("\\r\\nBcc: ...") can ride along.
"""

from __future__ import annotations

import re
import smtplib
from collections.abc import Callable
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from urllib.parse import urlencode

from blueprint.show import render

# One practical shape (not the full RFC): local@domain.tld, no spaces or
# control characters, 254 chars max.
_EMAIL = re.compile(r"^[A-Za-z0-9._%+'-]{1,64}@(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,24}$")


def is_email(value: str) -> bool:
    """
    >>> is_email("owner@example.com"), is_email("owner@example"), is_email("a@b.co\\nBcc: x@y.z")
    (True, False, False)
    """
    return len(value) <= 254 and bool(_EMAIL.fullmatch(value))


def _attach_pdf(msg: EmailMessage, pdf: bytes, bp: dict) -> None:
    name = f"AI-blueprint-{bp.get('code', 'example')}.pdf"
    msg.add_attachment(pdf, maintype="application", subtype="pdf", filename=name)


def visitor_mail(bp: dict, *, to: str, pdf: bytes, sender: str, calendly_url: str) -> EmailMessage:
    d = bp["draft"]
    code = bp.get("code", "")
    link = f"{calendly_url}?{urlencode({'utm_source': 'lubobali.com', 'utm_medium': 'blueprint-email', 'utm_content': code})}"
    msg = EmailMessage()
    msg["Subject"] = f"Your AI blueprint: {d['app_name']}"
    msg["From"] = formataddr(("Lubo Bali", sender))
    msg["To"] = to
    msg["Reply-To"] = sender
    msg["Message-ID"] = make_msgid(domain=sender.split("@")[1])
    msg.set_content(
        f"Hi,\n\n"
        f'Here is your AI blueprint, "{d["app_name"]}", as a PDF.\n\n'
        f"It shows how your work runs today, what it looks like with AI, who is involved, the risks and a "
        f"timeline. The technical plan (tools, architecture, how I'd solve each risk, cost) is what we go "
        f"through together on a free 30-min call:\n{link}\n\n"
        f"Your blueprint code is {code}. Just reply to this email if you have a question.\n\n"
        f"Lubo Bali\nSenior AI & Data Platform Engineer\nlubobali.com\n"
    )
    _attach_pdf(msg, pdf, bp)
    return msg


def lead_mail(bp: dict, *, visitor: str, pdf: bytes, sender: str, to: str) -> EmailMessage:
    d = bp["draft"]
    msg = EmailMessage()
    msg["Subject"] = f"New blueprint lead: {d['app_name']} ({bp.get('code', '-')})"
    msg["From"] = formataddr(("lubobali.com blueprint", sender))
    msg["To"] = to
    msg["Reply-To"] = visitor
    msg["Message-ID"] = make_msgid(domain=sender.split("@")[1])
    msg.set_content(
        f"Someone asked for their blueprint as a PDF.\n\nEmail: {visitor}\nCode:  {bp.get('code', '-')}\n\n"
        f"Reply to this email to write to them directly.\n\n{'-' * 60}\n{render(bp)}\n"
    )
    _attach_pdf(msg, pdf, bp)
    return msg


def smtp_sender(*, host: str, port: int, user: str, password: str) -> Callable[[EmailMessage], None]:
    """One SMTP connection per email (a handful a day): STARTTLS, login, send."""

    def send(msg: EmailMessage) -> None:
        with smtplib.SMTP(host, port, timeout=20) as s:
            s.starttls()
            s.login(user, password)
            s.send_message(msg)

    return send
