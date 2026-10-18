import { site } from "@/lib/site";

// What Lubo offers (Phase 3 H6). One list for the home page cards AND the
// JSON-LD (schema.ts), so Google, AI assistants and visitors read the same
// thing. Copy approved by Lubo 2026-10-17 (plans repo docs/phase-3-copy.md §3).
// Each proof links to something a visitor can check today. `award` = the
// glowing emblem on the card (Lubo: cards should feel like awards).
export const services = [
  {
    name: "AI agents & RAG",
    award: "crystal",
    description:
      "Chat and agents that answer from your own documents and databases, with tools, citations and MCP connectors for Claude.",
    proof: "LuBot runs inside Claude with 9 MCP tools.",
    proofUrl: "https://smithery.ai/servers/lubobali/lubot",
  },
  {
    name: "AI-ready data platforms",
    award: "medal",
    description:
      "Postgres, pipelines and multi-tenant data design, so each customer's data is clean, separate and ready for AI.",
    proof: "One database per customer, featured by Neon.",
    proofUrl: site.featuredIn.url,
  },
  {
    name: "AI in production",
    award: "trophy",
    description:
      "AI that stays reliable and affordable: tests, model fallbacks, caching, cost limits, monitoring and safe deploys.",
    proof: "12,000+ automated tests and automatic model fallback in LuBot.",
    proofUrl: site.product.url,
  },
] as const;
