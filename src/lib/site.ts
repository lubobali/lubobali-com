// One source of truth for who Lubo is and where to find him. Used by the
// page metadata, the JSON-LD entity, sitemap/robots and llms.txt, so Google
// and AI assistants all read the same facts.
// Profile links: Phase 2 decision L3 (all checked live 2026-10-13).

export const site = {
  url: "https://lubobali.com",
  name: "Lubo Bali",
  jobTitle: "Senior AI & Data Platform Engineer",
  // Meta description + llms.txt summary. 50-160 chars (scripts/check-seo.mjs).
  description:
    "Senior AI & Data Platform Engineer. Solo-built LuBot.ai, a production multi-tenant AI SaaS featured by Neon (Databricks). Open to freelance projects.",
  locale: "en_US",
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
  ],
} as const;

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();
