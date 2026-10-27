// /notes words (Phase 9). Each note's own words live in content/notes/*.md;
// only the page frame lives here. Lubo's rules: real numbers only, his own
// story, one build a week with the newest AI.
import type { Cluster } from "./note";

export const notesCopy = {
  title: "Notes",
  description:
    "Weekly notes by Lubo Bali: one small build with the newest AI, the real numbers, what broke, and the code on GitHub.",
  hero: {
    eyebrow: "One build a week",
    headline: "I try the newest AI on a real build, then write down what happened.",
    sub: "Real numbers, what broke, and the code. No hype, no recaps.",
  },
  empty: "The first note is coming soon.",
  clusters: {
    agents: "AI agents",
    rag: "RAG",
    mcp: "MCP",
    "data-pipelines": "Data pipelines",
    "ai-cost": "AI cost",
  } satisfies Record<Cluster, string>,
  note: {
    back: "All notes",
    eyebrow: (n: number, week: number) => `Note ${String(n).padStart(2, "0")} · Week ${week}`,
    number: (n: number) => `Note ${String(n).padStart(2, "0")}`,
    week: (week: number) => `Week ${week}`,
    minutes: (m: number) => `${m} min read`,
    updated: "Updated",
    tldr: "TL;DR",
    proof: "See the proof",
    stack: "Built with",
    sources: "Sources",
    repo: "See the code on GitHub",
    previous: "Older note",
    next: "Newer note",
    cta: "Have a problem like this?",
  },
  listen: {
    play: "Listen",
    pause: "Pause",
    voice: "AI version of my voice",
    player: "Audio player",
    seek: "Position in the audio",
    speed: (r: number) => `Playback speed ${r}x, change`,
    close: "Close the player",
  },
};
