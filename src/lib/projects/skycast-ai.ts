import type { Project } from "./model";

// Public repo lubobali/SkyCast-AI (README read 2026-10-22, cleaned of course
// wording the same day). Public instance skycast.lubot.ai (200). Facts: plans
// docs/phase-5-facts.md.
export const skyCast: Project = {
  slug: "skycast-ai",
  name: "SkyCast-AI",
  chapter: "ai",
  industries: ["Weather"],
  oneLine: "A weather agent where every number in the answer comes from a tool, not the AI's memory",
  description:
    "SkyCast-AI: a weather MCP server and a Databricks agent. Ask in plain English; every number in the answer comes from a tool call.",
  number: { value: "5", label: "tools the agent can call, each number from one of them" },
  problem:
    "AI chat answers about the real world often sound right and invent the numbers. For anything you act on, every figure needs a source.",
  built:
    "An MCP server with 5 weather tools (current conditions, forecast, advice, severe alerts, compare cities) and a Databricks agent that picks the right tool, calls it and answers from what came back.",
  why: "Thin tools, adapters that hold every web call, and the judgement (thresholds like 60°F for a jacket) in plain code, published in the tool's own description.",
  result:
    "Answers like \"No jacket needed: 97°F Saturday and 102°F Sunday\", where every number came from a tool call, plus a public live endpoint.",
  tech: ["Python", "MCP", "Databricks", "Agent Bricks"],
  // Brand card (P5.6): the real example, numbers from tools lit.
  picture: {
    kind: "chat",
    title: "Every number comes from a tool, not a guess",
    question: "Should I bring a jacket to Austin this weekend?",
    // Tools as in the agent transcript (agent/agent_config.md); answer as in the README.
    calls: ["get_forecast()", "get_outdoor_recommendation(Sat)", "get_outdoor_recommendation(Sun)"],
    answer:
      "No jacket needed. Austin is forecast to reach 97°F Saturday and 102°F Sunday, both far above the 60°F threshold. Take sunscreen instead, the UV index peaks at 8.4.",
    highlights: ["97°F", "102°F", "60°F", "8.4"],
    caption: "Open-Meteo + National Weather Service",
  },
  links: [
    { kind: "live", url: "https://skycast.lubot.ai/", label: "See the live server" },
    { kind: "github", url: "https://github.com/lubobali/SkyCast-AI" },
  ],
  searches: ["weather ai agent", "mcp server", "ai answers with sources"],
  anatomy: {
    model: "A Databricks Agent Bricks agent.",
    harness: "The agent chooses one of 5 MCP tools, calls it and answers only from the result.",
    guardrails: "Thresholds live in code and in each tool's description; the public server needs a bearer token; no raw web calls inside a tool.",
    knowledge: "Live forecasts from Open-Meteo and severe-weather alerts from the National Weather Service.",
    tools: "Current weather, forecast, outdoor advice, severe alerts, compare cities.",
  },
};
