import type { Project } from "./model";

// Public repo lubobali/DevTrack-AI (README read 2026-10-22). Facts: plans
// docs/phase-5-facts.md.
export const devTrack: Project = {
  slug: "devtrack-ai",
  name: "DevTrack-AI",
  chapter: "ai",
  industries: ["Productivity"],
  oneLine: "A weekly engineering report written from real data, where every claim cites a commit",
  description:
    "DevTrack-AI: reads git, AI usage and dev costs, then writes a weekly engineering report where every claim cites a commit. Personal data removed first.",
  number: { value: "4", label: "data sources turned into one weekly report" },
  problem:
    "Weekly engineering updates, for a team or a solo developer, are written from memory: what really shipped, what it cost and where the risk is gets lost.",
  built:
    "An agent that reads commits, issues and pull requests, AI usage and costs, and coding costs, computes the numbers locally, then writes a weekly report: wins, concerns, burnout risk and what to focus on next.",
  why: "The math is done in code first, so the AI only writes about numbers it was given; every point must cite a commit or a metric.",
  result:
    "A real weekly report by email from live data: velocity, code health, test discipline, AI costs and coaching, every claim traceable.",
  tech: ["Python", "NVIDIA Nemotron", "Langfuse", "Pydantic", "Forgejo"],
  // Brand card (P5.6): many sources in, one report out.
  picture: {
    kind: "funnel",
    title: "4 sources in, one honest weekly report out",
    stages: [
      { label: "Git server", detail: "commits, issues and pull requests" },
      { label: "AI usage", detail: "traces, tokens, cost and speed" },
      { label: "Coding costs", detail: "AI coding spend per project" },
      { label: "Numbers in code", detail: "velocity, code health, work patterns" },
      { label: "Weekly report", detail: "every claim cites a commit" },
    ],
    caption: "Personal data removed before and after the AI",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/DevTrack-AI" }],
  searches: ["engineering report", "developer productivity", "weekly team report"],
  anatomy: {
    model: "NVIDIA Nemotron Ultra 253B, with a Claude model as the alternative.",
    harness: "Collect from 4 sources, compute the metrics locally, then let the AI write the report.",
    guardrails: "Personal data stripped before and after the AI, answers checked against a schema (retry on bad JSON), low-confidence flag when data is thin.",
    knowledge: "Commits, issues, pull requests, AI traces and coding costs for the week.",
    tools: "Git server API, Langfuse, a coding-cost reader and email.",
  },
  safe: "Server addresses, keys, emails and phone numbers are removed before and after the AI sees anything, and every claim must cite a commit or a metric.",
};
