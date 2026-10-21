import { site } from "@/lib/site";
import type { CaseStudy } from "./types";

// LuBot (Phase 4 C3). Every text part OK'd by Lubo. Facts checked in
// LuBot's prod code 2026-10-20/21 (C1): 260,000+ source lines, 12,000+
// tests, 9 MCP tools, 3 MCP directories, OpenRouter first with a backup
// provider per call, DeepInfra embeddings, Neon per customer.
export const lubot: CaseStudy = {
  slug: "lubot",
  kind: "story",
  published: true, // Lubo 2026-10-21 (C6b); staging stays noindex + Disallow
  name: "LuBot.ai",
  eyebrow: "Case study · my own product, built solo",
  title: "An AI analyst that learns you",
  problem: "Small businesses have their numbers everywhere and no analyst to ask what they mean.",
  promise:
    "LuBot answers questions about your website, your files and your stock portfolio in plain English, with charts and the reasons behind them. The more you use it, the better it knows what you care about.",
  description:
    "How Lubo Bali built LuBot.ai alone: an AI analyst for your website, files and stock portfolio, one database per customer, featured by Neon (Databricks).",
  tags: ["AI analyst", "stock", "portfolio", "investing", "website analytics", "files", "spreadsheets", "PDF", "RAG", "embeddings", "LLM", "SaaS", "multi-tenant", "Neon", "Postgres", "MCP", "Claude", "OpenRouter", "AWS", "personalization"],
  badge: { label: "Featured by Neon (Databricks)", url: site.featuredIn.url },
  hero: {
    name: "lubot-stock-chart",
    alt: "LuBot stock view: Apple daily candles with the 50-day average, volume and RSI, and a Buy signal",
    caption: "Real LuBot screen · demo data",
  },
  numbers: [
    { value: "260,000+", label: "lines of code, built solo" },
    { value: "83", label: "stock analysis tools" },
    { value: "36", label: "AI workers learning in the background" },
  ],
  // Lubo: "use all numbers ... show it in the full spectrum". Counted on
  // LuBot prod main 9bb09072, 2026-10-20 (method: plans repo, Phase 4 C1).
  stats: [
    { value: "260,000+", label: "lines of code" },
    { value: "12,000+", label: "automated tests" },
    { value: "1,800+", label: "commits since March 2026" },
    { value: "169", label: "API endpoints" },
    { value: "84", label: "database tables" },
    { value: "83", label: "stock analysis tools" },
    { value: "36", label: "background AI workers" },
    { value: "24", label: "specialist chat handlers" },
    { value: "9", label: "tools inside Claude (MCP)" },
    { value: "3", label: "MCP directories list it" },
    { value: "1", label: "database per customer" },
    { value: "1", label: "engineer: me" },
  ],
  flow: {
    app: "LuBot",
    before: {
      title: "Without LuBot",
      label: "How it works without LuBot",
      steps: [
        { label: "Export data from each tool", meta: "Analytics, spreadsheets, broker", pain: true },
        { label: "Build the report by hand", meta: "Spreadsheets", pain: true },
        { label: "Guess what the numbers mean", meta: "No analyst on the team", pain: true },
        { label: "Decide days later", meta: "Meetings" },
      ],
    },
    after: {
      title: "With LuBot",
      label: "With LuBot",
      steps: [
        { label: "Ask in plain English" },
        { label: "Answer from your own data" },
        { label: "Charts and the why behind them" },
        { label: "It remembers what you care about" },
      ],
    },
  },
  // Every moment is a real feature in LuBot's code (checked 2026-10-20).
  // Background jobs are built but paused until paying users (Lubo): the
  // text says what LuBot is built to do, never a live "this morning".
  day: {
    person: "Alex",
    intro: "Alex runs a small online shop and invests on the side. No data team, no analyst. Here is a day with LuBot (an example, every feature is real).",
    moments: [
      {
        when: "Morning",
        title: "LuBot noticed before Alex asked",
        text: "LuBot is built to watch the website on its own: a spike, a page that suddenly carries all the traffic, a cause hiding inside the averages. Alex gets a short card, not a dashboard to dig through.",
        behind: "36 background AI workers, built in",
        shot: {
          name: "lubot-ai-noticed",
          alt: "LuBot 'AI noticed' cards: a segment move, 5 pages driving 91% of clicks, Thursday as the biggest day, and a soft warning about Monday",
          caption: "Real LuBot screen · demo website",
          narrow: true,
        },
      },
      {
        when: "Mid-morning",
        title: "\u201cCan I sleep well with my portfolio?\u201d",
        text: "Alex asks in plain English. LuBot answers with a Sleep Well Score from 0 to 100 and the reasons, compares the stocks the way legendary investors would, and gently points out when a question sounds driven by fear or greed.",
        behind: "83 stock analysis tools, brokerage sync via Plaid (read-only)",
        shot: {
          name: "lubot-portfolio",
          alt: "LuBot portfolio table: 6 stocks with shares, average cost, current price, value and profit, total value $63,944.50",
          caption: "Real LuBot screen · sample portfolio",
        },
      },
      {
        when: "Afternoon",
        title: "\u201cWhat sold best last month?\u201d",
        text: "Alex drops in a spreadsheet and a PDF. LuBot draws the chart, flags duplicate and empty rows, and shows exactly where each answer came from.",
        behind: "One private database just for Alex. The reason Neon wrote about LuBot",
      },
      {
        when: "Next day",
        title: "It already knows Alex",
        text: "Shorter answers, because Alex likes them short. Suggestions for what to look at next, the way Netflix suggests a show. Every number is computed by code, never guessed by the AI.",
        behind: "Memory of each user + 12,000+ automated tests",
        // LuBot's real suggestion questions (Website mode, lubot.ai 2026-10-20).
        chips: ["Predict next week's traffic", "What pages are losing traffic?", "Compare this week to last week"],
      },
    ],
  },
  // Lubo OK'd the 3 problems 2026-10-21. Checked in prod code: per-call
  // backups (Groq / OpenAI / NIM, services/openrouter_client.py), numbers
  // as labeled fields (stock/stock_prompts.py _format_named_fields).
  problems: [
    {
      problem: "Every customer's data stays apart",
      decision: "Each customer gets their own database, so nobody can ever see someone else's numbers, even by mistake.",
      result: "Neon (Databricks) wrote a case study about this design.",
    },
    {
      problem: "The right AI for each job, and it never goes down",
      decision: "Each question goes to the model that does that job best: Claude, GPT or NVIDIA. If a provider is down, LuBot switches to a backup by itself.",
      result: "One company's outage doesn't stop the answers.",
    },
    {
      problem: "The AI never does the math",
      decision: "Python calculates every number first. The AI only explains it in plain words.",
      result: "The numbers in the chat always match the numbers on the screen.",
    },
  ],
  engineers: {
    intro: "One FastAPI backend, a React app and an MCP server for Claude. The decisions that matter:",
    layers: [
      { name: "You ask", parts: ["Web app (React)", "Inside Claude (MCP)"] },
      { name: "Backend", parts: ["FastAPI · 169 endpoints", "36 background workers"] },
      { name: "AI", parts: ["OpenRouter: Claude · GPT · Nemotron", "Backups: Groq · OpenAI · NVIDIA NIM", "Embeddings: DeepInfra (text + images)"] },
      { name: "Data", parts: ["Clerk (sign-in)", "Supabase (admin)", "Neon: 1 database per customer", "AWS S3 + Parquet + DuckDB (files)"] },
    ],
    decisions: [
      "Database per tenant: one Neon Postgres per customer. Plain Postgres SQL only, and all Neon-specific code lives in one file, so the data can move to any Postgres host.",
      "Best model per task, chosen by benchmark (the SQL planner was tested on 25 real cases before picking). OpenRouter first, with a backup provider when it fails.",
      "Multimodal embeddings (NVIDIA Nemotron, served by DeepInfra), so pictures inside a PDF can be found too.",
      "Files live in S3 as Parquet and are queried with DuckDB, with a local disk cache for speed.",
      "Numbers are computed in Python and handed to the model as labeled fields. The model only writes the words around them.",
      "12,000+ automated tests run on every push. CI mirrors production.",
    ],
  },
  role: "Founder and only engineer",
  when: "Built solo, 2026", // Lubo 2026-10-20
  stack: ["Python", "FastAPI", "PostgreSQL (Neon)", "React", "OpenRouter", "DeepInfra", "MCP", "AWS S3"],
  links: [
    { label: "Visit LuBot.ai", url: site.product.url },
    { label: "Read the Neon article", url: site.featuredIn.url },
  ],
};
