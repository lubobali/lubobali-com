// What a note says when it's shared (Phase 9 P9.9, option A, Lubo
// 2026-10-28): a PENDING LinkedIn draft in the publisher (Lubo approves it,
// nothing posts by itself) and an X thread for him to paste. Built only
// from the note's own fields: real numbers, his words, no AI writing.
import type { Cluster, Note } from "./note";

const SITE = "https://lubobali.com";
const X_LINK = 23; // X counts every link as 23 characters
const X_MAX = 280;

const HASHTAGS: Record<Cluster, string[]> = {
  "data-pipelines": ["DataEngineering", "AI", "LLM"],
  agents: ["AIAgents", "AI", "LLM"],
  rag: ["RAG", "GenAI", "AI"],
  mcp: ["MCP", "AIAgents", "AI"],
  "ai-cost": ["AI", "LLM", "FinOps"],
};

/** Length as X counts it: any link = 23. */
export const tweetLength = (t: string) => t.replace(/https?:\/\/\S+/g, "x".repeat(X_LINK)).length;

const fit = (t: string, room: number) => (t.length <= room ? t : `${t.slice(0, room - 1).replace(/\s+\S*$/, "")}…`);

export function shareTexts(n: Note) {
  const url = `${SITE}/notes/${n.slug}`;
  const number = `${n.hero.value} ${n.hero.label}.`;
  const read = n.audio
    ? `Read it in ${n.readMinutes} min, or listen (an AI version of my voice):`
    : `Read it in ${n.readMinutes} min:`;
  const linkedin = [n.title, n.tldr, number, `${read}\n${url}`, `The code is open: ${n.repo}`].join("\n\n");

  const hook = `${n.title}\n\n${number}`;
  const x = [
    tweetLength(hook) <= X_MAX ? hook : fit(n.title, X_MAX),
    fit(n.tldr, X_MAX),
    `Full note, the numbers and the code:\n${url}`,
  ];
  return { linkedin: { text: linkedin, hashtags: HASHTAGS[n.cluster] }, x, url };
}
