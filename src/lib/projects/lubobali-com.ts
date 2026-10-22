import type { Project } from "./model";

// This site and its AI Blueprint (plans docs/phase-3b-blueprint.md, live
// test B10: 9 s + 21 s = 30 s). Cost per run is not shown. Facts: plans
// docs/phase-5-facts.md.
export const lubobaliCom: Project = {
  slug: "lubobali-com",
  name: "This site and its AI Blueprint",
  chapter: "ai",
  industries: ["Any business", "Marketing"],
  oneLine: "Describe a business problem and get a first AI plan in about 30 seconds, on this site",
  description:
    "The AI Blueprint on lubobali.com: describe a problem, answer up to 3 AI questions and get a first plan in about 30 seconds. The AI writes, code checks.",
  number: { value: "30 s", label: "from your problem to a first plan, measured live" },
  problem:
    "A CEO with an idea for AI usually can't tell if it's a weekend job or a six-month project, and a first call often starts from zero.",
  built:
    "You write your problem in two or three sentences and tap twice. The AI asks up to 3 follow-up questions, then writes a blueprint: what the solution does, a simple diagram, a readiness score, the risks and a rough timeline.",
  why: "The AI writes, the code checks: the model may only return strict JSON, and code validates it and computes the score and the timeline from rules, so the numbers are never made up.",
  result:
    "3 questions in 9 seconds and a full blueprint in 21, about 30 seconds in all, live. Try it on this site: \"Free AI blueprint\" at the top.",
  tech: ["Next.js", "TypeScript", "Claude", "Python", "Forgejo CI"],
  // Brand card (P5.6): the measured time, step by step.
  picture: {
    kind: "timeline",
    title: "Your problem to a first plan in about 30 seconds",
    unit: "s",
    steps: [
      { label: "AI asks up to 3 questions", value: 9 },
      { label: "AI writes the blueprint", value: 21 },
    ],
    caption: "Measured live on the real tool",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/lubobali-com" }],
  searches: ["ai blueprint", "ai project plan", "free ai plan"],
  anatomy: {
    model: "Claude Opus 5.5, picked after a 12-story test (all valid, both attack stories blocked).",
    harness: "Your story, 2 taps, up to 3 AI questions, then the blueprint card and a way to book a call.",
    guardrails: "Strict JSON only, checked by code; code computes the score and timeline; no HTML from the model; input limits and rate limits.",
    knowledge: "Only what you write and answer, plus fixed rules for scores and timelines.",
    tools: "None, on purpose: the model can only answer, never act.",
  },
  safe: "The model has no tools and may only return checked JSON; code computes every number, and limits stop abuse before it costs anything.",
};
