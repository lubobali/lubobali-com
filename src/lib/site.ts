// One source of truth for who Lubo is and where to find Lubo. Used by the
// page metadata, the JSON-LD entity, sitemap/robots and llms.txt, so Google
// and AI assistants all read the same facts.
// Profile links: Phase 2 decision L3 (all checked live 2026-10-13).

export const site = {
  url: "https://lubobali.com",
  name: "Lubo Bali",
  jobTitle: "Senior AI & Data Platform Engineer",
  // Meta description + llms.txt summary. 50-160 chars (scripts/check-seo.mjs).
  description:
    "Senior AI & Data Platform Engineer. Solo-built LuBot.ai, a production multi-tenant AI SaaS featured by Neon (Databricks). Available for AI projects.",
  locale: "en_US",
  // Projects only (Lubo, 2026-10-18; replaces D2 "full-time also open").
  // Shown near every Book-a-call button. Lubo updates the month by hand
  // when it moves (set 2026-10-18 = about 2 months out).
  availableFrom: "December 2026",
  availability: "Available for new AI projects from December 2026.",
  // The one call-to-action: free 30-min intro call (Phase 3 D3).
  email: "data@lubobali.com",
  bookCall: {
    label: "Book a free 30-min call",
    url: "https://calendly.com/data-lubobali/30min",
  },
  // Own profiles (schema.org sameAs).
  sameAs: [
    "https://www.linkedin.com/in/lubo-bali",
    "https://github.com/lubobali",
    "https://x.com/Lubo_Bali",
  ],
  // Article about Lubo (schema.org subjectOf).
  featuredIn: {
    title: "Inside LuBot's database-per-tenant architecture",
    publisher: "Neon",
    url: "https://neon.com/blog/inside-lubots-database-per-tenant-architecture",
  },
  // Product Lubo founded and built.
  product: {
    name: "LuBot",
    url: "https://lubot.ai/",
    description: "an AI analytics SaaS with one database per customer",
    // Registered company (Lubo, 2026-10-17); also the invoicing entity.
    legalName: "LuBot LLC",
  },
  knowsAbout: [
    "AI engineering",
    "Data platform engineering",
    "Data engineering",
    "Retrieval-augmented generation",
    "Multi-agent systems",
    "Large language models",
    "Multi-tenant SaaS",
    "PostgreSQL",
    "Python",
    "Apache Spark",
    // The "Built with" wheel tools (src/lib/tech.ts) are added in schema.ts.
  ],
} as const;

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();
