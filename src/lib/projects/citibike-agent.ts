import type { Project } from "./model";

// Public repo lubobali/citibike-llm-analytics (README read 2026-10-22). Its
// live demo was "deployment in progress": no live link. Facts: plans
// docs/phase-5-facts.md.
export const citibike: Project = {
  slug: "citibike-analytics-agent",
  name: "Citibike analytics agent",
  chapter: "ai",
  industries: ["Transport"],
  oneLine: "Ask where the bikes need to go tomorrow morning, in plain English",
  description:
    "An AI analytics agent for NYC Citibike: 7 tested SQL answers need no AI at all, and the AI only writes new queries for new questions.",
  number: { value: "68%", label: "higher demand in November than in July" },
  problem:
    "In NYC's bike sharing system, every morning some stations run empty and others overflow. The redistribution team needs to know which stations need bikes, how many and of which type, without writing SQL.",
  built:
    "An agent over a star schema of the rides: common questions go to 7 tested SQL templates (no AI, instant), new questions go to an AI that writes the query, and every answer can come with a chart.",
  why: "Templates for the questions asked every day: faster, cheaper and never wrong. The AI only for the rest, with a local model option for private data.",
  result:
    "Answers like \"top 10 stations that need bikes, classic vs electric\" in plain English, and the finding that November has about 68% higher demand than July.",
  tech: ["Python", "FastAPI", "PostgreSQL", "AdalFlow", "Next.js"],
  // Brand card (P5.6): a question takes one of two roads.
  picture: {
    kind: "fork",
    title: "7 everyday questions need no AI at all",
    question: "Which stations need bikes tomorrow morning?",
    left: { label: "Tested SQL template", detail: "7 everyday questions, instant, no AI" },
    right: { label: "AI writes the query", detail: "for new questions (GPT-4o or a local model)" },
    end: { label: "Answer + chart", detail: "by station and bike type" },
    caption: "NYC Citibike, July and November",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/citibike-llm-analytics" }],
  searches: ["bike sharing demand", "ask data in plain english", "station redistribution"],
  anatomy: {
    model: "GPT-4o, or a local Llama model through Ollama for private data.",
    harness: "A router: a question that matches a tested template skips the AI; anything else goes to the AI.",
    guardrails: "7 pre-tested SQL templates for everyday questions, so the most-asked answers can't be made up.",
    knowledge: "NYC Citibike rides for July and November in a star schema, plus past successful questions.",
    tools: "PostgreSQL queries and Plotly charts.",
  },
};
