import type { Project } from "./model";

// Public repo lubobali/JobRadar-AI (README read 2026-10-22). Framed as
// matching at scale, not Lubo's own job hunt; no bootcamp mention (Lubo).
// Facts: plans docs/phase-5-facts.md.
export const jobRadar: Project = {
  slug: "jobradar-ai",
  name: "JobRadar-AI",
  chapter: "ai",
  industries: ["Jobs"],
  oneLine: "An AI agent that ranks thousands of job posts against one resume, and keeps the tracker up to date itself",
  description:
    "JobRadar-AI: Spark pulls 5,718 jobs from 8 APIs, AI ranks them against a resume, and an agent with 11 tools both searches and updates the tracker.",
  number: { value: "5,718", label: "job posts ranked against one resume" },
  problem:
    "There are thousands of job posts and the right ones hide among the wrong ones. Keyword search fails because both use the same words.",
  built:
    "Spark pulls posts from 8 job APIs, every description becomes searchable vectors, an AI ranks each one against the resume with a reason (the best matches first), and an agent answers in plain English and logs applications itself.",
  why: "Databricks for the heavy lifting, Lakebase (Postgres with vectors) so search results and the tracker live in one database, and Change Data Feed turns every change into analytics.",
  result:
    "5,718 posts, 60,860 vectors and an agent with 11 tools (5 that read, 6 that write), live as a Databricks App with 842 tests.",
  tech: ["Databricks", "Apache Spark", "Lakebase", "pgvector", "MCP"],
  // Brand card (P5.6): the agent's read and write tools around one database.
  picture: {
    kind: "toolbox",
    title: "An agent that reads and writes",
    read: ["search_jobs", "get_job", "list_applications", "get_profile", "draft_application_text"],
    write: ["save_job", "log_application", "update_application_status", "add_interview_note", "set_follow_up", "add_contact"],
    center: "One database: search results and the tracker",
    caption: "Lakebase + pgvector · 60,860 vectors",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/JobRadar-AI" }],
  searches: ["job matching ai", "rank jobs against resume", "ai agent that writes to a database"],
  anatomy: {
    model: "An AI model through the Databricks AI Gateway ranks each job against the resume; the agent runs on Agent Bricks.",
    harness: "Spark ingest, then embed, then score; the agent works through an MCP server with 11 tools.",
    guardrails: "The MCP server needs a bearer token; drafts are returned, never stored; every write goes through a named tool.",
    knowledge: "5,718 job posts as 60,860 vectors in Lakebase, plus the resume.",
    tools: "5 that read (search, get a job, list applications, profile, draft text) and 6 that write (save, log, update, note, follow-up, contact).",
  },
};
