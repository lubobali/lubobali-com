import type { Project } from "./model";

// Public repo lubobali/Sentinel-AI (README read 2026-10-22). Numbers and
// safety patterns: plans docs/phase-5-facts.md.
export const sentinelAI: Project = {
  slug: "sentinel-ai",
  name: "Sentinel-AI",
  chapter: "ai",
  industries: ["Productivity"],
  oneLine: "An AI agent that sorts your inbox, and can never send or delete a thing",
  description:
    "Sentinel-AI: an AI agent that sorts a Gmail inbox into Meeting, Action and FYI, with 4 safety layers. It can label and hold meetings, never send or delete.",
  number: { value: "4", label: "safety layers before the AI touches an email" },
  problem:
    "An AI agent on a real inbox can be tricked by one bad email, act twice on the same message, or act on a broken answer. Most demos skip this part.",
  built:
    "Sentinel triages a Gmail inbox: it sorts each email into Meeting, Action or FYI, adds a label and puts meeting requests on the calendar as tentative. When it isn't sure, it marks the email for a person to check.",
  why: "Two AI providers plus a keyword sorter with no AI as the last backup, so it keeps working when a provider is down. FastAPI and Postgres keep it simple and auditable.",
  result:
    "Runs on a server with 181 tests at 93% coverage. It labels emails and holds meeting times, and it has no power to send or delete anything.",
  tech: ["Python", "FastAPI", "Gmail API", "PostgreSQL", "Docker"],
  // Brand card (P5.6): the 4 layers as gates an email falls through.
  picture: {
    kind: "gates",
    title: "4 safety layers before the AI acts",
    gates: [
      { label: "Allowlist", detail: "only senders you trust get in", turnsAway: true },
      { label: "Injection guard", detail: "emails that try to trick the AI are blocked", turnsAway: true },
      { label: "AI sorts it", detail: "a second provider if the first fails, then a no-AI backup" },
      { label: "Answer check", detail: "broken or unsure means \"needs review\", never an action", turnsAway: true },
    ],
    outcomes: ["Meeting", "Action", "FYI", "Needs review"],
    caption: "Never sends, never deletes",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/Sentinel-AI" }],
  searches: ["inbox triage", "email ai agent", "sort emails"],
  anatomy: {
    model: "An AI model from one provider, a second provider (NVIDIA) if it fails, and a keyword sorter with no AI as the last backup.",
    harness: "A scheduled heartbeat: fetch, filter, sort, label, remember. Every email is handled once, even after a restart.",
    guardrails: "Sender allowlist, prompt-injection guard, fail-closed on bad AI output, and no send or delete ability at all.",
    knowledge: "Only emails from allowed senders, plus a Postgres record of every email already handled.",
    tools: "Gmail (read and label only) and Google Calendar (tentative events). Nothing else.",
  },
  safe: "Only allowed senders reach the AI, tricks are blocked before it reads them, a bad answer means \"needs review\" instead of an action, and it has no power to send or delete.",
};
