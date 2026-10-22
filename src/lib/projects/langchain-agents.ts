import type { Project } from "./model";

// Public repo lubobali/langchain-ai-agents (README read 2026-10-22). No
// bootcamp mention (Lubo). Facts: plans docs/phase-5-facts.md.
export const langchainAgents: Project = {
  slug: "langchain-ai-agents",
  name: "AI agents that watch their own cost",
  chapter: "ai",
  industries: ["Any business"],
  oneLine: "Three AI agents that broke in expensive ways, and the fixes that made them cheap and safe",
  description:
    "3 LangChain AI agents fixed for production: a question went from $12 to $0.001, 571K tokens to 133, and 25 tools to the 6–11 it needs.",
  number: { value: "12,000×", label: "cheaper per question: $12 down to $0.001" },
  problem:
    "AI agents fail quietly and expensively: one dumps a whole database into the AI, one never stops researching, one gets 25 tools and picks the wrong one. The bill is the first sign.",
  built:
    "Three agents with the real fixes: field stripping and size guards on what the AI sees, a budget manager that tracks every step's cost and stops in time, and a keyword router that loads only the tools a question needs.",
  why: "LangChain with OpenAI, every call traced in Langfuse, so cost, tokens and speed are measured instead of guessed. The router uses no AI at all, so it costs nothing.",
  result:
    "A question went from $12 and 8 minutes to $0.001 and 15 seconds, one call from 571K tokens to 133, and each turn now loads 6–11 tools instead of 25. 46 tests hit the real AI.",
  tech: ["Python", "LangChain", "OpenAI", "Langfuse", "MCP"],
  // Brand card (P5.6): the three before → after drops.
  picture: {
    kind: "drops",
    title: "The same agents, 12,000× cheaper",
    rows: [
      { label: "Cost per question", before: "$12", after: "$0.001", cut: "12,000× cheaper" },
      { label: "AI tokens in one call", before: "571K", after: "133", cut: "99.98% less" },
      { label: "Tools loaded each turn", before: "25", after: "6–11", cut: "up to 76% fewer" },
    ],
    caption: "Every call traced in Langfuse",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/langchain-ai-agents" }],
  searches: ["ai agent cost", "cut llm costs", "langchain agents"],
  anatomy: {
    model: "OpenAI models through LangChain.",
    harness: "Three LangChain agents; a budget manager tracks every step's tokens and cost and stops the run in time.",
    guardrails: "Output size guards, field stripping (no card numbers ever reach the AI), hard step and budget limits.",
    knowledge: "A support database and research sources, cut down to the fields a question needs.",
    tools: "MCP tool servers (GitHub, Slack, a database), loaded per question by a keyword router with no AI cost.",
  },
  safe: "No card numbers ever reach the AI (fields stripped first), and every run has a hard budget and step limit.",
};
