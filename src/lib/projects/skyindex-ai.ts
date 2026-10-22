import type { Project } from "./model";

// Public repo lubobali/SkyIndex-AI (README read 2026-10-22). The Databricks
// App needs a workspace login: no live link. Facts: plans docs/phase-5-facts.md.
export const skyIndex: Project = {
  slug: "skyindex-ai",
  name: "SkyIndex-AI",
  chapter: "ai",
  industries: ["Weather", "Government"],
  oneLine: "Search that finds the answer even when the words don't match",
  description:
    "SkyIndex-AI: semantic search over live weather service text with pgvector. Ask about rain and it finds \"showers and thunderstorms\".",
  number: { value: "30 min", label: "between refreshes; only changed text is processed again" },
  problem:
    "Important answers are buried in free text, and keyword search misses them when the writer used other words: a forecast says \"showers\", you typed \"rain\".",
  built:
    "A pipeline that harvests live weather alerts and forecast discussions, turns them into vectors in Postgres (pgvector) and serves a search where meaning matters, not exact words. An AI can write a short answer from the passages it found.",
  why: "Lakebase Postgres with pgvector keeps search and data in one database; each text is processed once and only again when it changes, so refreshes stay cheap.",
  result:
    "\"Will it rain tomorrow morning\" finds \"a slight chance of showers and thunderstorms\", which keyword search returns nothing for. 221 tests, refreshed every 30 minutes.",
  tech: ["Python", "pgvector", "Lakebase", "Databricks"],
  // Brand card (P5.6): real questions, what came back, and the match score.
  picture: {
    kind: "matches",
    title: "Finds the answer even when the words don't match",
    rows: [
      { question: "will it rain tomorrow morning", found: "Forecast: a slight chance of showers and thunderstorms", score: 0.627 },
      { question: "dangerous heat, what should I do", found: "Heat Advisory: reschedule strenuous activities", score: 0.664 },
      { question: "flash flood risk this weekend", found: "Flash Flood Warning, El Paso, TX", score: 0.517 },
    ],
    caption: "Live National Weather Service text",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/SkyIndex-AI" }],
  searches: ["semantic search", "vector search postgres", "rag search"],
  anatomy: {
    model: "all-MiniLM-L6-v2 turns text into vectors; an AI model can write a short answer from the passages found.",
    harness: "Harvest, chunk, embed, store; a scheduled refresh every 30 minutes re-embeds only text that changed.",
    guardrails: "Answers come only from the retrieved passages, and say so when the passages don't hold the answer.",
    knowledge: "Live National Weather Service alerts and forecast discussions in Lakebase.",
    tools: "A search API over pgvector (HNSW index).",
  },
};
