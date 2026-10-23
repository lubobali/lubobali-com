// Lubo's resume (Phase 6), one source for the PDF (scripts/brand/resume-pdf.mjs)
// and the /resume page. Lubo's v11 text ("keep all as is, it's true") with
// his 2026-10-22 changes; every fact and its source: plans repo
// docs/phase-6-facts.md. No imports, so Node loads it directly for the PDF
// and the tests. The phone number is NOT here: it lives only in the PDF
// script, so it never reaches the web pages (bots scrape them).

/** LuBot's size, recounted 2026-10-22 (prod main 2e6fbdd6: 259,529 lines,
 * 12,554 tests). The home proof strip and the LuBot story say the same;
 * scripts/tests/resume.test.mjs keeps them equal. */
export const lubotNumbers = { lines: "260,000+", tests: "12,000+" } as const;

export type ResumeLink = { label: string; url: string };

export type ResumeJob = {
  company: string;
  title: string;
  dates: string;
  bullets: readonly string[];
  stack: string;
};

export type ResumeProject = {
  name: string;
  kind: string;
  bullet: string;
  stack: string;
  links: readonly ResumeLink[];
};

export const resume = {
  name: "Lubo Bali",
  title: "Senior Data & AI Platform Engineer",
  location: "Venice, FL",
  citizenship: "US Citizen",
  email: "data@lubobali.com",
  links: [
    { label: "lubobali.com", url: "https://lubobali.com" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/lubo-bali" },
    { label: "GitHub", url: "https://github.com/lubobali" },
    { label: "LuBot.ai", url: "https://lubot.ai" },
  ],
  summary: [
    "3+ years in data and AI engineering, after 12 years running the finances of a 50-unit building ($500K+ a year)",
    "Zach Wilson (ex-Netflix, Airbnb, Meta) about my capstone: 'Best project in the bootcamp, ready to make money'",
    `Lead engineer at HelloPayments, and I built LuBot.ai on my own (${lubotNumbers.lines} lines of code, ${lubotNumbers.tests} tests)`,
  ],
  jobs: [
    {
      company: "HelloPayments",
      title: "Senior Data & AI Platform Engineer",
      dates: "Mar 2026 - Sep 2026",
      bullets: [
        "Lead engineer for DataSwim, a multi-tenant B2B SaaS that replaced Excel for payment processing residuals and commissions.",
        "Built the residual engine and 7 APIs. The pilot customer ran 6 months of real data through it, $31K+ in commissions.",
        "Built an AI column mapper, so a new payment processor's CSV format needs no code change.",
        "Set up a 3-level LLM gateway (own GPU, NVIDIA NIM, OpenRouter). 80% of questions are answered with no LLM cost.",
        "Handled a server hack alone: removed the malware, rotated 13 secrets, and locked SSH to Tailscale only.",
      ],
      stack: "Clerk, LiteLLM, OpenRouter, Keycloak OIDC, Playwright, Next.js, FastAPI, Resend, Svix",
    },
    {
      company: "LuBot.ai",
      title: "Founder & Lead Engineer",
      dates: "Jun 2025 - Present",
      bullets: [
        `Built LuBot alone: multi-tenant AI SaaS for business analytics and stock advice, ${lubotNumbers.lines} lines of code, ${lubotNumbers.tests} tests.`,
        "Built a 4-step router (rules, regex, embeddings, then LLM). 95%+ of questions are routed with no LLM cost.",
        "Built an MCP server so LuBot works from Claude Desktop, plus RAG over user files with NVIDIA embeddings and FAISS.",
        "Python does all the math in 9 analysis modules and the LLM only writes the text, so it can't make up numbers.",
        "Built with Claude Code in parallel git worktrees: test first, then integration tests on staging after every merge.",
      ],
      stack: "NVIDIA Nemotron stack, FAISS, AdalFlow, Langfuse, Sentry, Prometheus + Grafana, Vite + React 19, TradingView Charts",
    },
    {
      company: "RE/MAX",
      title: "Data Engineer",
      dates: "Jan 2024 - Feb 2025",
      bullets: [
        "Built a Python ETL pipeline that pulled 10K+ property listings from MLS APIs into MySQL, so agents could see market changes fast.",
        "Automated the daily refresh with validation checks. 3+ hours of manual work a day went down to 15 minutes.",
        "Built Tableau dashboards for inventory and prices across 20+ neighborhoods, used by 15+ agents to find deals before competitors.",
      ],
      stack: "Python, MySQL, Tableau, MLS APIs",
    },
    {
      company: "2828 Arthington Condominium Association",
      title: "Financial Data Manager",
      dates: "Jan 2013 - Jan 2024",
      bullets: [
        "Managed the finances of a 50-unit building for 12 years ($500K+ revenue a year) with SQL and Excel: leases, vendor contracts and budgets.",
        "Automated reconciliation in Excel. Month-end close went from 3 days to under 2, and the copy-paste errors stopped.",
      ],
      stack: "PostgreSQL, MySQL, SQL, Excel, Power BI, Tableau, financial reporting",
    },
  ] satisfies readonly ResumeJob[],
  skills: [
    { label: "Languages & Backend", items: "Python, SQL, TypeScript, FastAPI, REST APIs, Pytest, multi-tenant SaaS, Stripe, Clerk, webhooks" },
    { label: "Data", items: "PostgreSQL, Supabase, Snowflake, dbt, Databricks, Spark, PySpark, Delta Lake, Airflow, Kafka, Redis" },
    { label: "AI & LLMs", items: "Claude Code, Claude API, NVIDIA Nemotron + NIM, LiteLLM, OpenRouter, RAG, FAISS, pgvector, MCP servers, tool calling" },
    { label: "Cloud & DevOps", items: "AWS (Lambda, Step Functions, S3, DynamoDB, Bedrock), Terraform, Docker, Linux, GitHub Actions, Sentry, Grafana" },
    { label: "Frontend & Security", items: "React, Vite, Next.js, Tailwind | NIST CSF 2.0, OWASP LLM Top 10, CIS Controls, incident response" },
  ],
  education: [
    { degree: "Associate of Applied Science, Computer Systems", school: "Lincoln Land Community College", dates: "Aug 2026" },
    {
      degree: "AI, Data and Analytics Engineering Tracks (Highest Distinction)",
      school: "DataExpert.io",
      dates: "Mar - May 2026",
      // Verified credentials (Lubo 2026-10-24), checked live: AE No. 99
      // (Mar 10), DE No. 139 (Apr 5), AI No. 177 (May 16, 2026).
      verify: [
        { label: "Analytics Engineering", url: "https://www.dataexpert.io/certification/lubo/ae-superb" },
        { label: "Data Engineering", url: "https://www.dataexpert.io/certification/lubo/de-0226-superb" },
        { label: "AI Engineering", url: "https://www.dataexpert.io/certification/lubo/ai-superb-allaccess-103" },
      ],
    },
    { degree: "Bachelor of Science, Basketball Coaching | Master of Science, Sports Management", school: "National Sports Academy 'Vasil Levski'", dates: "" },
  ],
  projects: [
    {
      name: "JobRadar-AI",
      kind: "AI Job Search Agent on Databricks (Scored 100/100)",
      bullet: "Pulls jobs from 129 sources into pgvector for search, and an MCP server with 11 tools lets the agent act on them.",
      stack: "Databricks, Spark, Lakebase, pgvector, FastMCP, Python",
      links: [{ label: "github.com/lubobali/JobRadar-AI", url: "https://github.com/lubobali/JobRadar-AI" }],
    },
    {
      name: "aws-job-streamer",
      kind: "AI Job Matcher on AWS (Public on GitHub)",
      bullet: "Pulls jobs from job board APIs, scores each one with Amazon Bedrock, and sends me email and SMS alerts.",
      stack: "AWS Lambda, Step Functions, DynamoDB, Bedrock, Terraform",
      links: [{ label: "github.com/lubobali/aws-job-streamer", url: "https://github.com/lubobali/aws-job-streamer" }],
    },
    {
      name: "Sentinel-AI",
      kind: "AI Email Agent (Public on GitHub)",
      bullet: "Sorts my email in real time and blocks prompt injection. 181 tests, 93% coverage.",
      stack: "Python, FastAPI, Gmail API, NVIDIA NIM, Postgres",
      links: [{ label: "github.com/lubobali/Sentinel-AI", url: "https://github.com/lubobali/Sentinel-AI" }],
    },
    {
      name: "mergeAI",
      kind: "AI Data Analyst (Scored 100/100)",
      bullet: "Upload a CSV and ask questions in plain English. AI agents write the SQL, check it and explain the answer.",
      stack: "TypeScript, Next.js, NVIDIA NIM, Neon Postgres",
      links: [
        { label: "Live: merge-ai-omega.vercel.app", url: "https://merge-ai-omega.vercel.app/" },
        { label: "github.com/lubobali/mergeAI", url: "https://github.com/lubobali/mergeAI" },
      ],
    },
  ] satisfies readonly ResumeProject[],
  more: [
    { label: "All projects: lubobali.com/projects", url: "https://lubobali.com/projects" },
    { label: "GitHub", url: "https://github.com/lubobali" },
    { label: "LuBot.ai", url: "https://lubot.ai" },
  ],
} as const;

/** The PDF's public path (the /resume page links it). */
export const resumePdfPath = "/lubo-bali-resume.pdf";
