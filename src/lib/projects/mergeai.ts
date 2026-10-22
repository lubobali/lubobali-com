import type { Project } from "./model";

// Public repo lubobali/mergeAI (README read 2026-10-22); live demo checked
// (200) the same day. The screen is from the repo's own screenshots.
export const mergeAI: Project = {
  slug: "mergeai",
  name: "mergeAI",
  chapter: "ai",
  industries: ["Any business"],
  oneLine: "Upload spreadsheets, ask a question in plain English, get a checked answer",
  description:
    "mergeAI: upload CSV files and ask in plain English. Three AI agents find the joins, write real SQL, check the result and retry. Try the live demo.",
  number: { value: "~8 s", label: "from question to a checked answer" },
  problem:
    "Joining two spreadsheets that were never made to match takes drag-and-drop, formulas or SQL. Most people just want to ask the question and trust the answer.",
  built:
    "Three AI agents: one finds how the files connect (EmpID is Employee ID), one writes a real PostgreSQL query to join them, and a checker runs it. Zero rows or a wrong column? It sends feedback and they retry, up to 3 rounds.",
  why: "Real SQL in a real database instead of an AI guessing in memory, so every answer can be checked: \"View SQL\" shows exactly what ran.",
  result:
    "Any CSV becomes something you can ask questions in plain English, with a chart, a table and a short summary in about 8 seconds. It's live: try it with your own files.",
  tech: ["Next.js", "TypeScript", "PostgreSQL", "NVIDIA Nemotron", "Vercel"],
  // Brand card (P5.6): the 3 agents on a loop, the checker sending work
  // back; the real screen is shown large below ("See the real app").
  picture: {
    kind: "loop",
    title: "Ask in plain English, a checked answer in ~8 s",
    agents: [
      { label: "Schema agent", detail: "finds how your files connect: EmpID is Employee ID" },
      { label: "SQL agent", detail: "writes a real PostgreSQL query to join them" },
      { label: "Validator", detail: "runs it and checks the result, with no AI in it" },
    ],
    back: "Zero rows or a wrong column? Back to the agents, up to 3 rounds.",
    center: { value: "~8 s", label: "question to checked answer" },
    caption: "3 agents that check each other",
  },
  screen: {
    image: "mergeai-dashboard",
    alt: "mergeAI: three agent cards (Schema, SQL, Validator) all done, the question, a short summary and a training outcome pie chart",
    caption: "Real mergeAI screen, demo HR files: the three agents done, then the answer.",
  },
  links: [
    { kind: "live", url: "https://merge-ai-omega.vercel.app/" },
    { kind: "video", url: "https://www.youtube.com/watch?v=Yr0CkXKNF0M" },
    { kind: "github", url: "https://github.com/lubobali/mergeAI" },
  ],
  searches: ["ask questions about spreadsheets", "join csv files with ai", "excel ai agent"],
  anatomy: {
    model: "NVIDIA Nemotron Ultra 253B writes the SQL; Nano 8B reads the files and writes the summary.",
    harness: "Three agents in a loop (schema, SQL, validator), shown live, up to 3 rounds of self-correction.",
    guardrails: "A validator with no AI in it runs every query and sends back zero rows, wrong columns or case mismatches before you see an answer.",
    knowledge: "Your CSV files in PostgreSQL (one table for any shape of file) plus a map of how the files connect.",
    tools: "Real PostgreSQL queries (joins, CTEs), charts, and Excel or CSV download.",
  },
};
