import type { Project } from "./model";

// Public repo lubobali/TicketDesk-AI (README read 2026-10-22). No AI model
// in the code, so it lives in Data pipelines (Lubo OK 2026-10-22). Screen =
// the repo's own screenshot (example data). Facts: plans docs/phase-5-facts.md.
export const ticketDesk: Project = {
  slug: "ticketdesk-ai",
  name: "TicketDesk-AI",
  chapter: "pipelines",
  industries: ["Customer support"],
  oneLine: "A support desk on Databricks Lakebase, built like a trading terminal",
  description:
    "TicketDesk-AI: a support ticket desk on Databricks Lakebase (managed Postgres) whose changes stream into Delta tables for analytics. 180 tests.",
  number: { value: "180", label: "tests, run against a real Postgres database" },
  problem:
    "Support tickets need a database that never loses a message and never lets two people change one ticket at the same moment. Analytics tables can't promise that.",
  built:
    "A ticket desk on Databricks Lakebase: live SLA clocks, priority signals and keyboard shortcuts. Every change also flows into Delta tables for analytics, with no extra connector.",
  why: "Lakebase gives the app real rows, keys and rules; Change Data Feed gives analysts the full history next to it. One platform, both jobs.",
  result:
    "A working desk running as a Databricks App, 180 tests on a real Postgres (no fake database), and an analytics history that fills itself.",
  tech: ["Databricks Lakebase", "PostgreSQL", "Flask", "Python", "Delta Lake"],
  // Brand card (P5.6): live SLA clocks (example tickets from the repo
  // screenshot) flowing into Delta; the real screen is shown large below.
  picture: {
    kind: "stream",
    title: "Tickets and analytics on one platform",
    items: [
      { label: "Monitor flickers on the second display", age: "5m45s", state: "fresh" },
      { label: "SSO login loop on the analytics dashboard", age: "22h54m", state: "fresh" },
      { label: "VPN disconnects every few minutes", age: "2d18h", state: "ageing" },
      { label: "Payroll export fails for contractors", age: "5d06h", state: "late" },
    ],
    into: { label: "Delta tables", detail: "every change streams in by itself, no connector" },
    caption: "Example tickets · Databricks Lakebase",
  },
  screen: {
    image: "ticketdesk-app",
    alt: "TicketDesk-AI: a dark three-pane ticket desk with a stat tape, a ticket list with status and priority chips, and one open ticket thread",
    caption: "Real TicketDesk-AI screen, example tickets.",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/TicketDesk-AI" }],
  searches: ["support ticket app", "databricks lakebase app", "customer support desk"],
};
