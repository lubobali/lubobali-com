"""Print a booked blueprint by its code, for Lubo before the call (B5.3).

Runs inside the container (scripts/blueprint-show.sh):
    python -m blueprint.show K7M2QX     one blueprint, readable
    python -m blueprint.show --list     codes booked in the last 90 days
Server only: there is no public page for booked blueprints.
"""

from __future__ import annotations

import sqlite3
import sys
from datetime import UTC, datetime

from blueprint.config import Settings
from blueprint.store import Store


def render(bp: dict) -> str:
    """The blueprint as plain text, in Lubo's way order."""
    d = bp["draft"]
    lines = [
        f"{d['app_name']}  ·  {bp['pattern']['title']}  ·  code {bp.get('code', '-')}  ·  {bp['created']}",
        "",
        f"WHY   {d['why']['problem']}",
        f"GOAL  {d['why']['goal']}",
        "",
        "TODAY",
    ]
    for s in d["old_flow"]:
        time = f" · {s['minutes']} min a {s['per']}" if s.get("minutes") else ""
        lines.append(f"  - {s['label']} [{s['tool']}{time}]{'  <- PAIN' if s['pain'] else ''}")
    lines += ["", "PLAYERS"]
    for p in d["players"]:
        share = f", {p['money_share']}" if p.get("money_share") else ""
        lines.append(f"  - {p['role']} ({p['power']}{share}): {p['does']}")
    lines += ["", f"USERS {d['users']['who']}: {d['users']['why']}", "", "WITH AI"]
    lines += [f"  - {s['label']}" for s in d["new_flow"]]
    t = bp.get("time_saved")
    lines += [
        "",
        f"READINESS {bp['readiness']['score']}/100: " + "; ".join(bp["readiness"]["reasons"]),
        f"TIMELINE  {bp['timeline']['label']}: " + " -> ".join(r["label"] for r in bp["timeline"]["rounds"]),
        f"TIME      {t['before_minutes']} -> ~{t['after_minutes']} min/week (estimate)"
        if t
        else "TIME      (no number given)",
        "",
        "RISKS",
    ]
    lines += [f"  - [{r['severity']}] {r['title']}" for r in d["risks"]]
    lines += ["", "MY 3 QUESTIONS FOR THE CALL"]
    lines += [f"  {i}. {q}" for i, q in enumerate(d["questions_for_call"], 1)]
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    s = Settings.from_env()
    now = datetime.now(UTC)
    if argv[:1] == ["--list"]:
        with sqlite3.connect(s.db_path) as c:
            rows = c.execute("select code, created from booked order by created desc limit 50").fetchall()
        print("\n".join(f"{code}  {created}" for code, created in rows) or "no booked blueprints")
        return 0
    if len(argv) != 1:
        print(__doc__)
        return 2
    store = Store(s.db_path, salt=s.salt, limits=s.limits)
    bp = store.get_booked(argv[0].strip().upper(), now=now)
    if bp is None:
        print(f"no booked blueprint with code {argv[0]} (or older than 90 days)")
        return 1
    print(render(bp))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
