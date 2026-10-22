import { site } from "@/lib/site";

// Selected work (Phase 3 H7). Facts from the approved copy (plans repo
// docs/phase-3-copy.md §4) and, for GraphGuard-AI, its public README
// (Lubo picked it over RE/MAX, 2026-10-18). Every number here must be
// checkable by a visitor; GraphGuard's data is simulated and says so.
// Full case study pages come in Phase 4: no "coming soon" links before.

// `art` = the moving picture on the card, `tone` = its accent colour
// (all three stay in the brand blue family; globals.css .work-card).
export type Work = {
  // Anchor of the card (#id), used by the "Built with" wheel links.
  id: string;
  name: string;
  art: "candles" | "payments" | "laundry";
  tone: "sapphire" | "violet" | "ice";
  role: string;
  summary: string;
  highlights: readonly string[];
  stack: readonly string[];
  links: readonly { label: string; url: string }[];
};

export const work = [
  {
    id: "lubot",
    name: "LuBot.ai",
    art: "candles",
    tone: "sapphire",
    role: "Founder · AI analytics SaaS, built solo",
    summary:
      "Ask questions about your website, files or stock portfolio in plain English and get charts, reasoning and SQL. Multi-tenant, one database per customer.",
    highlights: [
      "Featured by Neon (Databricks) for its database-per-customer design",
      "Runs inside Claude with 9 MCP tools, listed in 3 MCP directories",
      "260,000+ lines of code and 12,000+ automated tests",
    ],
    // Stack checked in LuBot's code 2026-10-20 (Phase 4 C1): LLMs via
    // OpenRouter (best model per task), embeddings via DeepInfra, NVIDIA
    // NIM only as fallback (NVIDIA stays in the "Built with" dial).
    stack: ["Python", "FastAPI", "PostgreSQL (Neon)", "React", "OpenRouter", "DeepInfra", "MCP", "AWS S3"],
    links: [
      { label: "Visit LuBot.ai", url: site.product.url },
      { label: "Read the Neon article", url: site.featuredIn.url },
    ],
  },
  {
    id: "hellopayments",
    name: "HelloPayments",
    art: "payments",
    tone: "violet",
    // \u2060 + \u00a0 keep the dates on one line on phones.
    role: "Senior Data & AI Platform Engineer · Mar\u2060–\u2060Sep\u00a02026",
    summary:
      "Lead engineer for a multi-product B2B SaaS for payment-processing sales organizations. Built DataSwim, an automated residual and commission engine that replaces manual Excel.",
    highlights: [
      "Residual engine end to end: the pilot customer ran 6 months of real data through it, $31K+ in commissions",
      "AI column mapper: a new payment processor needs zero code change",
      "3-tier LLM gateway: 80% of queries at $0 LLM cost",
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Next.js", "LiteLLM", "NVIDIA NIM"],
    links: [],
  },
  {
    id: "graphguard-ai",
    name: "GraphGuard-AI",
    art: "laundry",
    tone: "ice",
    role: "Open source · ML for money-laundering detection",
    summary:
      "Finds money laundering by the shape money moves in, not by any single transfer, across 5 million simulated bank transfers (IBM AMLworld).",
    highlights: [
      "332 of the top 1,000 alerts are real laundering, against about 1 for a random queue",
      "Surfaces 76% of complete laundering rings",
      "Leakage rules enforced by CI; the graph model lost to XGBoost, and that is reported honestly",
    ],
    stack: ["Python", "XGBoost", "PyTorch Geometric", "Polars", "Optuna"],
    links: [{ label: "See the code on GitHub", url: "https://github.com/lubobali/GraphGuard-AI" }],
  },
] as const satisfies readonly Work[];
