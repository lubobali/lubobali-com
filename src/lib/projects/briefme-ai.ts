import type { Project } from "./model";

// Public repo lubobali/BriefMe-AI (README read 2026-10-22). No bootcamp
// mention and no WhatsApp screenshot (Lubo's real calendar). Facts: plans
// docs/phase-5-facts.md.
export const briefMe: Project = {
  slug: "briefme-ai",
  name: "BriefMe-AI",
  chapter: "ai",
  industries: ["Productivity"],
  oneLine: "An email chief of staff, rebuilt to do the same job with 96% fewer AI tokens",
  description:
    "BriefMe-AI: an AI email chief of staff, rebuilt to use 19 → 4 tool calls and 2,477 → 102 tokens per run, with no duplicate work.",
  number: { value: "96%", label: "fewer AI tokens for the same inbox run" },
  problem:
    "A working AI agent can still waste money every run: searching the inbox three times, summarizing each email three ways, creating the same meeting twice.",
  built:
    "An email agent that reads the inbox, sorts each email into meeting, action or FYI, adds calendar events and sends a summary, rebuilt step by step to do it in one pass.",
  why: "One combined search, one call per email, the rules sent once, and every email remembered so it is handled exactly once.",
  result:
    "Tool calls went from 19 to 4, inbox searches from 11 to 1, AI tokens from 2,477 to 102, and duplicate work from 9 emails to 0. 47 tests.",
  tech: ["Python", "FastAPI", "Pydantic", "Gmail API", "Google Calendar"],
  // Brand card (P5.6): one dot per call, search and duplicate, before vs after.
  picture: {
    kind: "tally",
    title: "Same inbox, a fraction of the work",
    unit: "calls",
    rows: [
      { label: "Tool calls", before: 19, after: 4 },
      { label: "Inbox searches", before: 11, after: 1 },
      { label: "Emails handled twice", before: 9, after: 0 },
    ],
    caption: "2,477 → 102 AI tokens per run",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/BriefMe-AI" }],
  searches: ["email assistant ai", "ai token cost", "inbox summary agent"],
  anatomy: {
    model: "A Claude model, with NVIDIA NIM as the fallback.",
    harness: "One heartbeat run: a single combined search, one call per email, batch processing, no re-checks.",
    guardrails: "Personal data redacted, prompt-injection checks, and it only reads mail from an approved sender.",
    knowledge: "The inbox (newest 10 emails) and a record of every email already handled.",
    tools: "Gmail, Google Calendar, and a summary sent back to you.",
  },
  safe: "It only reads mail from one approved sender (it won't start without one), removes personal data first, and checks for prompt injection.",
};
