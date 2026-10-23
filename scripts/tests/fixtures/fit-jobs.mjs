// Job posts for the fit-box tests (Phase 6, P6.6). Rebuilt from real AI and
// data job posts (2026): the skills and industries each post really asked
// for, written as a short post, with no company names or pay. Each ends the way real posts do
// (benefits, legal lines), because "health insurance" must never read as
// healthcare experience.
//
// `yes` = needs with real proof on the site (✓). `new` = a new tool for
// the same job (said positively, with the closest real work). Both lists are written by hand,
// BEFORE the matcher, and must equal what it finds, in any order.

const BENEFITS = "We offer medical, dental and vision insurance, a 401(k) match, stock options and paid time off. We are an equal opportunity employer.";

export const JOBS = [
  {
    id: "data-platform-fintech",
    text: `Senior Data Engineer, Data Platform. Build our data platform on Snowflake and PostgreSQL. You will design multi-tenant data models, build ETL pipelines in Python and SQL, and own data quality frameworks. AI-assisted development is a plus. AWS and Terraform preferred. We work in a regulated financial environment. 5+ years of experience. ${BENEFITS}`,
    yes: ["pipelines", "snowflake", "postgres", "saas", "warehouse", "python", "sql", "data-quality", "ai-coding", "aws", "terraform", "finance"],
    new: [],
  },
  {
    id: "healthcare-data",
    text: `Senior Data Engineer. Join our healthcare team helping members eat better. Build data pipelines with Python, TypeScript and Node.js on PostgreSQL, set up data quality checks, and work in our cloud data warehouse (BigQuery). HIPAA experience required. 6+ years. ${BENEFITS}`,
    yes: ["pipelines", "health", "python", "typescript", "postgres", "data-quality", "warehouse"],
    new: ["node", "bigquery", "hipaa"],
  },
  {
    id: "azure-databricks-contract",
    text: "Data Engineer (6-month contract). Build and maintain pipelines in Azure Data Factory and Databricks using Delta Live Tables and PySpark. Write SQL and Python, implement data quality checks with Soda, set up CI/CD with Jenkins, and do dimensional modeling. Terraform is a plus.",
    yes: ["pipelines", "databricks", "spark", "sql", "python", "data-quality", "ci-cd", "warehouse", "terraform"],
    new: ["azure", "ci-other"], // Jenkins: CI/CD yes, Jenkins itself no
  },
  {
    id: "federal-ai",
    text: "AI Software Engineer. Build LLM applications with RAG and agentic workflows on AWS Bedrock. Python, APIs, and security frameworks like NIST. Kubernetes is a plus. Must be able to obtain a Public Trust clearance. You will support federal clients.",
    yes: ["llm", "rag", "ai-agents", "aws", "bedrock", "python", "apis", "security", "government"], // "AWS Bedrock" = AWS too
    new: ["kubernetes", "gov-clearance"],
  },
  {
    id: "aws-data-ai-consulting",
    text: "AWS Data & AI Engineer. Build data and AI solutions on AWS: Bedrock, Lambda, DynamoDB, S3, Glue and Athena. Develop RAG applications and LLMOps practices, with infrastructure as code in Terraform or CloudFormation. This is a client-facing consulting role.",
    yes: ["aws", "llm", "bedrock", "lambda", "dynamodb", "s3", "glue", "rag", "mlops", "terraform"], // "AI Engineer" in the title = llm
    new: ["aws-more", "iac-other", "client-facing"], // CloudFormation: Terraform yes, CloudFormation itself no
  },
  {
    id: "lead-contract-extraction",
    text: "Lead Software Engineer. Lead a small team building our AI contract extraction platform: PDFs in, structured data out. Python, FastAPI, PostgreSQL, React. Mentor engineers and own the architecture. OCR experience is a plus.",
    yes: ["lead", "python", "fastapi", "postgres", "react", "documents"],
    new: [],
  },
  {
    id: "data-agents-warehouse",
    text: "Software Engineer, AI Agents. Build production data agents that answer analytics questions over a customer's data warehouse: text-to-SQL, tool calling, and evals for agent quality. Python and TypeScript. Snowflake, BigQuery and Databricks connectors.",
    yes: ["ai-agents", "chat-data", "warehouse", "tool-calling", "evals", "python", "typescript", "snowflake", "databricks"],
    new: ["bigquery"],
  },
  {
    id: "founding-ai-rentals",
    text: "Founding AI Engineer. We're building AI for short-term rental hosts. You'll build agent harnesses, tool-use pipelines and RAG over host messages, using the Claude Agent SDK. Evals over vibes. Payments and commissions experience is a plus. Startup pace, 0 to 1.",
    yes: ["llm", "real-estate", "ai-agents", "tool-calling", "pipelines", "rag", "claude", "evals", "payments", "founding"],
    new: [],
  },
  {
    id: "databricks-accounts-payable",
    text: "Data Engineer, Databricks. Our platform automates accounts payable: invoice and PO processing, payment collection and data capture across 1.1M business relationships. Build Spark pipelines on Databricks with Delta Lake and Unity Catalog. Azure experience required.",
    yes: ["pipelines", "databricks", "automation", "payments", "spark", "lakehouse", "governance"],
    new: ["azure"],
  },
  {
    id: "partner-integrations",
    text: "Senior Software Engineer, Cloud Partner Integrations. Design multi-tenant SaaS integrations with OAuth and OIDC across trust boundaries, webhooks and REST APIs in Go and Python. Kubernetes, Kafka. Stripe experience is a plus.",
    yes: ["saas", "apis", "auth", "python", "kafka", "payments"],
    new: ["go", "kubernetes"],
  },
  {
    id: "genai-contract",
    text: "AI Data Engineer / GenAI Engineer (contract, 24 months). Python, LLM applications with OpenAI, Anthropic and Gemini, tool calling with JSON Schema, RAG pipelines, vector databases (pgvector or Pinecone), FastAPI, Docker, AWS.",
    yes: ["pipelines", "llm", "python", "openai", "claude", "tool-calling", "rag", "vector-db", "fastapi", "docker", "aws"],
    new: ["gemini", "vector-vendors"], // Pinecone itself: not yet
  },
  {
    id: "llm-routing-platform",
    text: "AI Engineer, Agentic AI Platform. Multi-provider LLM integration and routing: select models dynamically, with latency, cost and capability in every routing decision. Build agents with MCP and observability (Langfuse or LangSmith). Python, PostgreSQL, Redis.",
    yes: ["llm", "ai-agents", "llm-cost", "mcp", "evals", "monitoring", "python", "postgres"],
    new: ["redis", "eval-tools"], // LangSmith itself: not yet (Langfuse yes)
  },
  {
    id: "cdc-ingestion",
    text: "Data Engineer, Ingestion & Change Data Capture. Turn messy partner files into one canonical table with SCD Type 2 history, stream change data capture from Postgres with Debezium into Kafka, and run data quality checks and reconciliation. Python and SQL, Airflow.",
    yes: ["pipelines", "streaming", "data-mapping", "warehouse", "postgres", "kafka", "data-quality", "python", "sql", "airflow"],
    new: [],
  },
  {
    id: "analytics-engineer",
    text: "Senior Analytics Engineer. Own our dbt models in Snowflake and the Looker dashboards used by Finance, Supply Chain and Pricing. Strong SQL and Python, data quality and testing.",
    yes: ["dashboards", "dbt", "snowflake", "finance", "logistics", "sql", "python", "data-quality", "testing"],
    new: ["looker"],
  },
  {
    id: "streaming-flink",
    text: "Python Data Engineer. Build real-time streaming pipelines with Apache Flink, Kafka and Spark on AWS. Kubernetes, Java or Scala experience preferred.",
    yes: ["python", "pipelines", "streaming", "flink", "kafka", "spark", "aws"],
    new: ["kubernetes", "java", "scala"],
  },
  {
    id: "claude-code-product",
    text: "AI Product Engineer. Use Claude Code as a core part of the development workflow, turn LLM workflows into repeatable internal standards, and write plan files and structured dev notes. TypeScript, React, Next.js, Node.js. AI-first team.",
    yes: ["ai-coding", "llm", "typescript", "react", "nextjs"],
    new: ["node"],
  },
  {
    id: "medallion-sql",
    text: "SQL Data Engineer (contract to hire). Medallion architecture (Bronze/Silver/Gold), Parquet, Apache Iceberg, Delta Lake, DuckDB, PostgreSQL. Databricks and Spark are a plus.",
    yes: ["sql", "pipelines", "lakehouse", "postgres", "databricks", "spark", "duckdb"],
    new: [],
  },
  {
    id: "fintech-multi-tenant",
    text: "Fintech Data Engineer. Ingest bank data from Plaid, Supabase and Postgres, keep each client's data isolated in a multi-tenant setup, reconcile data from many sources. Python, dbt.",
    yes: ["finance", "pipelines", "plaid", "supabase", "postgres", "saas", "data-quality", "python", "dbt"],
    new: [],
  },
  {
    id: "mlops-reach",
    text: "Senior Machine Learning Operations Engineer. Model registry, shadow and canary deployments, drift detection, SHAP explainability. Python, Kubernetes, SageMaker, MLflow.",
    yes: ["ml", "mlops", "python"],
    new: ["kubernetes", "aws-more"],
  },
  {
    id: "web-scraping",
    text: "Web Scraping Specialist. Build scrapers with Playwright for messy data from many sites, clean it and load it into PostgreSQL. MongoDB or Cassandra experience is a plus. 3+ years.",
    yes: ["scraping", "data-mapping", "postgres"],
    new: ["mongodb"],
  },
];

// Short questions, as a CEO would type them.
export const QUESTIONS = [
  { id: "agents-retail", text: "AI agents for retail?", yes: ["ai-agents", "retail"], new: [] },
  { id: "power-bi-hospital", text: "Have you built dashboards in Power BI for a hospital?", yes: ["dashboards", "power-bi", "health"], new: [] },
  { id: "junk", text: "asdf qwerty 12345 !!!", yes: [], new: [] },
  { id: "rate", text: "What's your hourly rate, and are you available for a 3-month contract?", yes: [], new: [], topics: ["rate", "availability"] },
];

// Hold-out posts (2026-10-24): written after the matcher was tuned on JOBS,
// expectations by hand first, run once untouched; results reported to Lubo.
export const HOLDOUT = [
  {
    id: "payments-backend-snowflake",
    text: "Senior Software Engineer, Data Platform. 80% backend: Python and FastAPI REST APIs serving Snowflake data to our payments products; 20% data platform work with dbt and Airflow. Correctness matters: every cent must reconcile. Kubernetes and Go is a nice-to-have.",
    yes: ["python", "fastapi", "apis", "snowflake", "payments", "dbt", "airflow", "data-quality"],
    new: ["kubernetes", "go"],
  },
  {
    id: "ehs-agentic-strategy",
    text: "Senior Data Scientist, EHS. Lead our agentic AI strategy: RAG workflows, semantic search and knowledge assistants for environmental, health and safety teams. Build prompt and evaluation libraries, and data pipelines in Python and SQL on Azure.",
    yes: ["ai-agents", "rag", "prompting", "evals", "pipelines", "python", "sql"],
    new: ["azure"],
  },
  {
    id: "document-intelligence",
    text: "Senior Data Engineer, AI/ML Data Platforms. Build document intelligence pipelines: parsing, layout extraction, OCR, metadata extraction, chunking and classification, then embeddings into a vector store for retrieval. Spark, Airflow, AWS, Kubernetes.",
    yes: ["pipelines", "ml", "documents", "rag", "vector-db", "spark", "airflow", "aws"],
    new: ["kubernetes"],
  },
  {
    id: "analytics-stripe",
    text: "Analytics Engineer. Build dbt models and dashboards for our KPIs, with Stripe as a key data source. SQL, Python, Looker or Tableau. Help Finance close the month faster.",
    yes: ["dashboards", "dbt", "payments", "sql", "python", "tableau", "finance"],
    new: ["looker"],
  },
  {
    id: "business-data-aws",
    text: "Senior Business Data Engineer. Our users are Accounting, Finance, Supply Chain and Publishing teams. Build ETL on AWS (Lambda, Glue, S3, Redshift), reporting in Power BI, and automate manual Excel reports.",
    yes: ["pipelines", "finance", "logistics", "aws", "lambda", "glue", "s3", "dashboards", "power-bi", "automation", "excel"],
    new: ["redshift"],
  },
  // Round 2 (2026-10-24, after reading the whole tracker), same rule: expectations first.
  {
    id: "itops-routing",
    text: "Sr AI Engineer. Multi-agent incident detection and resolution for IT operations. Cost-aware model routing: a powerful model for complex reasoning, a cheap model for simple tasks. RAG with hybrid search, re-ranking and chunking. Langfuse observability. MCP is nice to have. Guardrails for prompt injection and PII redaction.",
    yes: ["llm", "ai-agents", "llm-cost", "rag", "evals", "monitoring", "mcp", "guardrails", "security"], // "AI Engineer" = llm (my miss)
    new: [],
  },
  {
    id: "post-acquisition-data",
    text: "Senior Data Engineer. Python, SQL, Spark and Databricks pipelines for Finance, Retail, Wholesale, Marketing and Operations. Near-term focus: unify customer data across regions after an acquisition. Delta Lake is a plus.",
    yes: ["python", "sql", "spark", "databricks", "pipelines", "finance", "retail", "marketing", "data-mapping", "lakehouse"],
    new: [],
  },
  {
    id: "builder-tools-payments",
    text: "Full Stack Engineer, Builder Experience. Build AI-native workflows and agents that synthesize context, automate repetitive work and surface risks for teams building on payments. 0 to 1, high ambiguity, product-minded. React, TypeScript, Ruby or Java.",
    yes: ["full-stack", "ai-coding", "ai-agents", "automation", "payments", "founding", "react", "typescript"],
    new: ["ruby-php", "java"],
  },
  {
    id: "pharma-legacy-agents",
    text: "Senior AI Engineer. Build agentic workflows that connect to messy legacy systems for pharma services, with feedback loops for expert knowledge. Python, LLMs, evaluation. 6+ years.",
    yes: ["ai-agents", "migration", "python", "llm", "evals"], // "LLMs, evaluation" = LLM evaluation (my miss)
    new: ["pharma"],
  },
];
