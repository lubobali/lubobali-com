"""Eval: run the real model on the test stories and check the answers (B2).

    python -m evals.run [model_id] > report.txt

Needs OPENROUTER_API_KEY (server only). For each story: follow-up call
(story_ok + questions), then the blueprint call (real businesses only),
then our checks: valid shape, no "how" leaking (tool / model / vendor /
price words), no invented numbers, and the computed score + timeline.
Spends real money (a few cents per story); run by hand, not in CI.
"""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

from blueprint.llm import LLMError, ask
from blueprint.prompts import blueprint_messages, followup_messages
from blueprint.rules import readiness, time_saved, timeline
from blueprint.schema import BlueprintDraft, FollowUpQuestions, VisitorInput

# Words that would give away the "how" (checked outside old_flow.tool,
# where naming the visitor's own apps is fine).
HOW_WORDS = re.compile(
    r"\b(postgres(ql)?|mysql|mongo(db)?|snowflake|databricks|bigquery|supabase|neon|pgvector|vector|embedding|"
    r"rag|langchain|langgraph|llamaindex|openai|gpt|chatgpt|claude|anthropic|gemini|llama|nvidia|mcp|"
    r"python|fastapi|django|react|next\.?js|node|aws|azure|gcp|s3|lambda|kubernetes|docker|airflow|dbt|"
    r"kafka|spark|api|etl|webhook|zapier|make\.com|n8n|cost estimate|\$\s?\d)",
    re.IGNORECASE,
)


def texts_outside_old_tools(b: BlueprintDraft) -> list[str]:
    out = [b.why.problem, b.why.goal, b.users.who, b.users.why, b.app_name]
    out += [s.label for s in b.old_flow]
    out += [p.role + " " + p.does for p in b.players]
    out += [s.label for s in b.new_flow]
    out += [r.title for r in b.risks]
    out += list(b.questions_for_call)
    return out


def check(story: dict, v: VisitorInput, b: BlueprintDraft) -> list[str]:
    problems = []
    leaks = sorted({m.group(0).lower() for t in texts_outside_old_tools(b) for m in HOW_WORDS.finditer(t)})
    # Words the visitor wrote themselves are not a leak (e.g. "Postgres", "Shopify").
    own = v.story.lower()
    leaks = [w for w in leaks if w not in own]
    if leaks:
        problems.append(f"HOW LEAK: {leaks}")
    said_time = re.search(
        r"\b\d+\s*(minutes?|min|hours?|h|days?)\b", v.story + " ".join(f.answer for f in v.followups), re.I
    )
    if not said_time and b.minutes_per_week is not None:
        problems.append("INVENTED TIME (visitor gave none)")
    said_share = "%" in v.story or any("%" in f.answer for f in v.followups)
    if not said_share and any(p.money_share for p in b.players):
        problems.append("INVENTED MONEY SHARE")
    return problems


def main() -> None:
    model_id = sys.argv[1] if len(sys.argv) > 1 else None
    stories = json.loads((Path(__file__).parent / "stories.json").read_text())
    total_cost = 0.0
    failures = 0
    for s in stories:
        v = VisitorInput(**{k: s[k] for k in ("story", "data_location", "team_size", "followups")})
        print("=" * 78)
        print(f"[{s['id']}] {s['story'][:150]}")
        t0 = time.time()
        try:
            f = ask(followup_messages(v), FollowUpQuestions, max_tokens=1000, model_id=model_id)
        except LLMError as e:
            print(f"  FOLLOW-UP CALL FAILED: {e}")
            failures += 1
            continue
        total_cost += f.cost_usd
        ok = f.value.story_ok
        flag = "" if ok == s["expect_story_ok"] else "   <-- UNEXPECTED"
        print(f"  story_ok={ok}{flag}  ({time.time() - t0:.1f}s, ${f.cost_usd:.4f})")
        for q in f.value.questions:
            print(f"  ? [{q.step}] {q.question}  {q.options}")
        if ok != s["expect_story_ok"]:
            failures += 1
        if not ok:
            continue
        t0 = time.time()
        try:
            r = ask(blueprint_messages(v), BlueprintDraft, max_tokens=2500, model_id=model_id)
        except LLMError as e:
            print(f"  BLUEPRINT CALL FAILED: {e}")
            failures += 1
            continue
        total_cost += r.cost_usd
        b = r.value
        rd = readiness(data_location=v.data_location, sources_count=b.sources_count, issues=list(b.data_issues))
        tl = timeline(pattern=b.pattern, readiness_score=rd.score, sources_count=b.sources_count, team_size=v.team_size)
        ts = time_saved(pattern=b.pattern, before_minutes_per_week=b.minutes_per_week)
        print(f"  BLUEPRINT ({time.time() - t0:.1f}s, ${r.cost_usd:.4f}, tries {r.tries}) pattern={b.pattern}")
        print(f"  Why: {b.why.problem}\n       Goal: {b.why.goal}")
        print(
            "  Old:  "
            + " -> ".join(
                f"{x.label} [{x.tool}{', ' + str(x.minutes) + '/' + x.per if x.minutes else ''}{', PAIN' if x.pain else ''}]"
                for x in b.old_flow
            )
        )
        print(
            "  Players: "
            + " | ".join(
                f"{p.role} ({p.power}{', ' + p.money_share if p.money_share else ''}): {p.does}" for p in b.players
            )
        )
        print(f"  Users: {b.users.who} - {b.users.why}")
        print(f"  New ({b.app_name}): " + " -> ".join(x.label for x in b.new_flow))
        print("  Risks: " + " | ".join(f"{x.title} ({x.severity})" for x in b.risks))
        for q in b.questions_for_call:
            print(f"  Call Q: {q}")
        print(
            f"  = Readiness {rd.score}/100 ({'; '.join(rd.reasons)}) · {tl.label} · "
            + (f"{ts.before_minutes} -> ~{ts.after_minutes} min/week" if ts else "no time shown")
        )
        problems = check(s, v, b)
        print("  CHECKS: " + ("OK" if not problems else " ; ".join(problems)))
        failures += bool(problems)
    print("=" * 78)
    print(f"TOTAL cost ${total_cost:.4f} for {len(stories)} stories · problems: {failures}")


if __name__ == "__main__":
    main()
