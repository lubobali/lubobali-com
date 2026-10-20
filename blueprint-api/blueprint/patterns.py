"""The 4 kinds of projects Lubo really builds (Phase 3b B1).

Same 4 as the "What I do" cards on the home page. The AI picks one and
tailors it to the visitor's story; it never invents a fifth. `rounds` =
the work in 1-week rounds before the handover (the timeline rule adds a
data clean-up round, extra rounds and the handover).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Pattern:
    id: str
    title: str
    promise: str
    rounds: tuple[str, ...]


PATTERNS: dict[str, Pattern] = {
    p.id: p
    for p in (
        Pattern(
            id="agents",
            title="AI agents that do the work",
            promise="An agent that reads your data, uses your tools and finishes the job, inside the app your team already uses.",
            rounds=("Connect the agent to your data", "Teach it your real tasks"),
        ),
        Pattern(
            id="data_platform",
            title="Data that's ready for AI",
            promise="Your data cleaned, connected and kept in one place, so reports and AI answers come from one source of truth.",
            rounds=("Your data in one place", "Answers and reports on top"),
        ),
        Pattern(
            id="trusted_answers",
            title="Answers you can trust",
            promise="Numbers calculated from your real data by code, with the AI only explaining them, so it can't make up a figure.",
            rounds=("Numbers calculated by code", "The AI explains the numbers"),
        ),
        Pattern(
            id="cost_control",
            title="AI bills that stay small",
            promise="Each question goes the cheapest way that works, with limits, so your AI costs stay low and never surprise you.",
            rounds=("Measure what AI costs today", "Route each question the cheap way"),
        ),
    )
}

# What stays for the call (shown as a locked list, never filled in).
LOCKED: tuple[str, ...] = (
    "Which tools and AI models",
    "How it is built (architecture)",
    "How I solve each risk",
    "Cost estimate",
)
