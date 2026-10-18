// How it works + Now (Phase 3 H9). Lubo's real way of working, 2026-10-18:
// contract + a written scope per project, an update + invoice every 2 weeks
// with automatically tracked hours, handover with docs and tests. Terms
// follow the contract Lubo works under today (ownership, confidentiality,
// 2-week invoices, 14 days' notice), written as his own standard terms;
// never a client's name, rate or payment days. Plain and fair both ways
// (Lubo: "nothing that would trick them"). Projects only.

export const steps = [
  {
    title: "Free 30-min call",
    icon: "call",
    note: "Free, no obligation",
    text: "You tell me the problem. I tell you honestly if AI is the right fit.",
  },
  {
    title: "Contract and a written scope",
    icon: "contract",
    note: "Scope and timeline in writing",
    text: "A simple contract, plus a written scope for each project: what I build, the steps and the timeline. Agreed before I start.",
  },
  {
    title: "Every 2 weeks: update + invoice",
    icon: "calendar",
    note: "Hours tracked automatically",
    text: "Dates, work done and hours per task, tracked automatically. You pay for real work only, and any line you question gets sorted out first.",
  },
  {
    title: "Handover",
    icon: "key",
    note: "You own 100% of it",
    text: "Working code with docs and tests, so your team can run it without me.",
  },
] as const;

// Fair terms, both ways (shown as a short list).
export const terms = [
  "You own 100% of what I build: code, docs and designs.",
  "Your data stays confidential and only in the systems you give me.",
  "I finish what we agree on and keep you in the loop. You pay invoices on time.",
  "Either side can stop with 14 days' notice. You keep all the work done so far.",
] as const;

// Client named with Lubo's OK (2026-10-18); never project details (D6).
export const now = "AI Engineer (contract) at Structured Fusion AI, and building LuBot.";
