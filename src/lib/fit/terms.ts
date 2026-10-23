// "Does Lubo fit your project?" (Phase 6, P6.6): every skill, tool and
// industry a job post or a question can name, in the words people write.
// Each term says what PROVES it on the site; the matcher shows a ✓ only when
// that proof exists (Lubo: a wrong answer must never hurt him). A term with
// no proof is a new tool for the same job, said positively (copy.ts), with
// its closest real skills. Grown from 100+ real AI and data job posts (2026:
// Python, AWS, AI agents, RAG, MCP, SQL, Databricks and Azure lead).
// No imports, so Node runs the tests on it directly.
//
// Proof keys (resolved by match.ts against the real data, never typed):
//   tech:<tag>      a project / story / job that lists this tech
//   industry:<name> a project / story in this industry (projects/model.ts)
//   chapter:<id>    every project in a chapter (ai, pipelines, analytics)
//   project:<slug> / story:<slug> / job:<id>   one named piece of work
//   page:<path>     a page on the site that shows it (e.g. /about#security)

export type FitKind = "ai" | "data" | "cloud" | "app" | "analytics" | "practice" | "industry";

export type FitTerm = {
  id: string;
  label: string;
  kind: FitKind;
  /** Words in a post, any case; plurals and punctuation don't matter. */
  aliases: readonly string[];
  /** Case-sensitive patterns for words too short or common to match alone (Go, R). */
  exact?: readonly string[];
  proof: readonly string[];
  /** Term ids shown when there is no proof: the honest closest real skills. */
  closest?: readonly string[];
};

const list = "(?<=(?:^|[,/(]\\s*|\\b(?:and|or|in|with)\\s))"; // "Python, Go", "in Go"
const listEnd = "(?=\\s*(?:[,/);]|$|\\s(?:and|or)\\b))";
const notGoPhrase = "(?![-\\w]|\\s+(?:to|live|ahead|back|beyond|further|over|through)\\b)"; // "Go is a plus", not "go live"

export const FIT_TERMS: readonly FitTerm[] = [
  // ── AI ──────────────────────────────────────────────────────────────
  { id: "ai-agents", label: "AI agents", kind: "ai",
    aliases: ["ai agent", "agent", "agentic", "agentic ai", "agentic system", "agentic workflow", "multi agent", "multiagent", "autonomous agent", "agent orchestration", "ai orchestration", "agent framework", "agent runtime", "agent harness", "tool use agent"],
    proof: ["chapter:ai", "story:lubot"] },
  { id: "llm", label: "LLMs & generative AI", kind: "ai",
    aliases: ["llm", "large language model", "generative ai", "genai", "gen ai", "foundation model", "artificial intelligence", "ai engineer", "ai engineering", "applied ai"],
    proof: ["chapter:ai", "story:lubot"] },
  { id: "rag", label: "RAG (search over your documents)", kind: "ai",
    aliases: ["rag", "retrieval augmented generation", "retrieval augmented", "retrieval pipeline", "semantic search", "hybrid search", "knowledge assistant", "chunking", "reranking", "re ranking", "grounding"],
    proof: ["story:lubot", "project:jobradar-ai", "project:skyindex-ai"] },
  { id: "vector-db", label: "Vector databases & embeddings", kind: "ai",
    aliases: ["vector database", "vector db", "vector store", "vector search", "embedding", "pgvector", "faiss"],
    proof: ["tech:pgvector", "tech:FAISS", "project:skyindex-ai"] },
  { id: "vector-vendors", label: "Pinecone / Weaviate / Milvus", kind: "ai", aliases: ["pinecone", "weaviate", "milvus", "chroma", "chromadb", "qdrant", "opensearch", "elasticsearch"], proof: [], closest: ["vector-db"] },
  { id: "mcp", label: "MCP (Model Context Protocol)", kind: "ai",
    aliases: ["mcp", "model context protocol", "mcp server"],
    proof: ["tech:MCP"] },
  { id: "a2a", label: "Agent-to-agent (A2A)", kind: "ai", aliases: ["a2a", "agent to agent"], proof: [], closest: ["mcp", "ai-agents"] },
  { id: "tool-calling", label: "Tool calling & structured outputs", kind: "ai",
    aliases: ["tool calling", "function calling", "tool use", "structured output", "json schema"],
    proof: ["project:skycast-ai", "project:jobradar-ai", "story:lubot"] },
  { id: "guardrails", label: "AI guardrails & prompt-injection defense", kind: "ai",
    aliases: ["guardrail", "prompt injection", "ai safety", "llm security", "responsible ai", "hallucination", "jailbreak"],
    proof: ["project:sentinel-ai", "project:langchain-ai-agents", "page:/about#security"] },
  { id: "prompting", label: "Prompt engineering", kind: "ai",
    aliases: ["prompt engineering", "prompt design", "prompting", "prompts"],
    proof: ["chapter:ai"] },
  { id: "evals", label: "AI evaluation & observability", kind: "ai",
    aliases: ["llm evaluation", "model evaluation", "ai evaluation", "eval framework", "evals", "evaluation framework", "evaluation library", "evaluation pipeline", "evaluation harness", "llm as judge", "llm as a judge", "llm observability", "tracing", "langfuse"],
    proof: ["tech:Langfuse"] },
  { id: "eval-tools", label: "LangSmith / Ragas / TruLens", kind: "ai", aliases: ["langsmith", "ragas", "trulens", "deepeval", "arize", "phoenix"], proof: [], closest: ["evals"] },
  { id: "llm-cost", label: "Lower AI costs (model routing)", kind: "ai",
    aliases: ["model routing", "llm routing", "cost aware", "token cost", "llm cost", "ai cost", "cost optimization", "finops", "inference cost", "llm gateway", "multi provider", "multi model", "routing decision", "litellm", "openrouter"],
    proof: ["story:lubot", "project:langchain-ai-agents", "project:briefme-ai", "tech:LiteLLM", "tech:OpenRouter"] },
  { id: "chat-data", label: "Ask your data in plain English (text to SQL)", kind: "ai",
    aliases: ["text to sql", "natural language to sql", "nl2sql", "natural language query", "conversational analytics", "data agent", "analytics agent", "chatbot", "conversational ai", "ai assistant", "copilot"],
    proof: ["project:mergeai", "project:citibike-analytics-agent", "story:lubot"] },
  { id: "documents", label: "Document AI (PDFs, files, extraction)", kind: "ai",
    aliases: ["document processing", "document intelligence", "document ai", "idp", "ocr", "pdf", "docling", "data extraction", "contract extraction", "invoice extraction", "parsing documents", "unstructured data"],
    proof: ["story:lubot"] },
  { id: "multimodal", label: "Multimodal AI (images inside documents)", kind: "ai", aliases: ["multimodal", "multi modal", "vision language", "vlm", "image embedding"], proof: ["story:lubot"] },
  { id: "speech", label: "Speech & voice AI", kind: "ai", aliases: ["speech to text", "text to speech", "whisper", "voice ai", "transcription", "deepgram"], proof: [], closest: ["llm"] },
  { id: "inference-ops", label: "Running models yourself (vLLM, GPUs)", kind: "ai", aliases: ["vllm", "tensorrt", "quantization", "inference optimization", "model serving", "gpu cluster", "triton"], proof: [], closest: ["nvidia", "llm-cost"] },
  { id: "gemini", label: "Gemini", kind: "ai", aliases: ["gemini"], proof: [], closest: ["claude", "openai"] },
  { id: "langchain", label: "LangChain", kind: "ai", aliases: ["langchain"], proof: ["tech:LangChain"] },
  { id: "agent-frameworks", label: "LangGraph / CrewAI / AutoGen", kind: "ai", aliases: ["langgraph", "crewai", "crew ai", "autogen", "strands", "semantic kernel", "openai agents sdk"], proof: [], closest: ["adalflow", "langchain", "ai-agents"] },
  { id: "adalflow", label: "AdalFlow", kind: "ai", aliases: ["adalflow"], proof: ["tech:AdalFlow"] },
  { id: "llamaindex", label: "LlamaIndex", kind: "ai", aliases: ["llamaindex", "llama index"], proof: [], closest: ["langchain", "rag"] },
  { id: "openai", label: "OpenAI", kind: "ai", aliases: ["openai", "gpt", "chatgpt", "gpt 4", "gpt 5"], proof: ["tech:OpenAI"] },
  { id: "claude", label: "Claude (Anthropic)", kind: "ai", aliases: ["claude", "anthropic", "claude api", "claude agent sdk"], proof: ["tech:Claude"] },
  { id: "bedrock", label: "Amazon Bedrock", kind: "ai", aliases: ["bedrock", "amazon bedrock"], proof: ["tech:Amazon Bedrock"] },
  { id: "nvidia", label: "NVIDIA NIM & Nemotron", kind: "ai", aliases: ["nvidia", "nim", "nemotron", "nemo"], proof: ["tech:NVIDIA Nemotron", "tech:NVIDIA Nemotron stack"] },
  { id: "open-models", label: "Open models (Llama)", kind: "ai", aliases: ["llama", "open source model", "open weight", "ollama", "hugging face", "huggingface"], proof: ["tech:Llama 3.3"] },
  { id: "fine-tuning", label: "Fine-tuning models", kind: "ai", aliases: ["fine tuning", "finetuning", "fine tune", "lora", "rlhf"], proof: [], closest: ["rag", "evals"] },
  { id: "ml", label: "Machine learning", kind: "ai",
    aliases: ["machine learning", "ml", "predictive model", "classification model", "scikit learn", "sklearn", "xgboost", "gradient boosting"],
    proof: ["tech:scikit-learn", "tech:XGBoost"] },
  { id: "deep-learning", label: "Deep learning (PyTorch)", kind: "ai", aliases: ["pytorch", "deep learning", "neural network", "graph neural network", "gnn"], proof: ["tech:PyTorch Geometric"], closest: ["ml"] },
  { id: "tensorflow", label: "TensorFlow", kind: "ai", aliases: ["tensorflow", "keras"], proof: [], closest: ["deep-learning", "ml"] },
  { id: "mlops", label: "MLOps (MLflow)", kind: "ai", aliases: ["mlops", "mlflow", "model registry", "llmops", "model deployment"], proof: ["tech:MLflow"] },
  { id: "knowledge-graph", label: "Knowledge graphs (Neo4j)", kind: "ai", aliases: ["knowledge graph", "neo4j", "graph database", "graphrag", "graph rag"], proof: [], closest: ["rag", "deep-learning"] },
  { id: "nlp", label: "NLP & sentiment", kind: "ai", aliases: ["nlp", "natural language processing", "sentiment", "text classification"], proof: ["project:employee-sentiment", "project:marketmind-ai"] },
  { id: "fraud", label: "Fraud & money-laundering detection", kind: "industry", aliases: ["fraud", "money laundering", "aml", "anti money laundering", "suspicious activity"], proof: ["story:graphguard-ai"] },

  // ── Languages & app building ────────────────────────────────────────
  { id: "python", label: "Python", kind: "app", aliases: ["python", "python3"], proof: ["tech:Python"] },
  { id: "sql", label: "SQL", kind: "data", aliases: ["sql", "advanced sql", "t sql", "tsql", "plsql", "pl sql"], proof: ["tech:SQL", "tech:PostgreSQL", "tech:MySQL"] },
  { id: "typescript", label: "TypeScript", kind: "app", aliases: ["typescript"], proof: ["tech:TypeScript"] },
  { id: "javascript", label: "JavaScript", kind: "app", aliases: ["javascript", "js", "es6"], proof: ["tech:JavaScript", "tech:TypeScript"] },
  { id: "node", label: "Node.js", kind: "app", aliases: ["node js", "nodejs", "express js", "expressjs"], proof: [], closest: ["typescript", "python"] },
  { id: "r", label: "R", kind: "analytics", aliases: ["r programming", "rstudio", "tidyverse"], exact: [`${list}R${listEnd}`], proof: ["tech:R"] },
  { id: "go", label: "Go", kind: "app", aliases: ["golang"], exact: [`${list}Go${notGoPhrase}`], proof: [], closest: ["python", "typescript"] },
  { id: "java", label: "Java", kind: "app", aliases: ["java", "spring boot", "kotlin"], proof: [], closest: ["python", "typescript"] },
  { id: "ruby-php", label: "Ruby on Rails / PHP", kind: "app", aliases: ["ruby", "rails", "ruby on rails", "php", "laravel", "wordpress"], proof: [], closest: ["python", "fastapi"] },
  { id: "scala", label: "Scala", kind: "app", aliases: ["scala"], proof: [], closest: ["spark", "python"] },
  { id: "rust", label: "Rust", kind: "app", aliases: ["rust"], proof: [], closest: ["python"] },
  { id: "csharp", label: "C# / .NET", kind: "app", aliases: ["dotnet", "net core", "asp net"], exact: ["C#", "\\.NET"], proof: [], closest: ["python", "typescript"] },
  { id: "fastapi", label: "FastAPI", kind: "app", aliases: ["fastapi", "fast api"], proof: ["tech:FastAPI"] },
  { id: "flask", label: "Flask", kind: "app", aliases: ["flask"], proof: ["tech:Flask"] },
  { id: "django", label: "Django", kind: "app", aliases: ["django"], proof: [], closest: ["fastapi", "flask"] },
  { id: "apis", label: "REST APIs & integrations", kind: "app",
    aliases: ["rest api", "restful", "api", "apis", "api design", "api integration", "third party integration", "system integration", "microservice", "webhook"],
    proof: ["story:hellopayments", "tech:FastAPI"] },
  { id: "react", label: "React", kind: "app", aliases: ["react", "reactjs", "react js", "frontend", "front end"], proof: ["tech:React", "tech:Vite + React 19"] },
  { id: "nextjs", label: "Next.js", kind: "app", aliases: ["next js", "nextjs"], proof: ["tech:Next.js"] },
  { id: "full-stack", label: "Full-stack apps", kind: "app", aliases: ["full stack", "fullstack", "end to end application"], proof: ["story:lubot", "project:mergeai", "project:lubobali-com"] },
  { id: "saas", label: "Multi-tenant SaaS", kind: "app", aliases: ["saas", "multi tenant", "multitenant", "tenant isolation", "b2b platform"], proof: ["story:lubot", "story:hellopayments"] },
  { id: "auth", label: "Login & access (OAuth, OIDC, SSO)", kind: "app", aliases: ["oauth", "oidc", "sso", "single sign on", "authentication", "rbac", "iam", "keycloak", "clerk"], proof: ["tech:Clerk", "tech:Keycloak OIDC"] },
  { id: "plaid", label: "Bank data (Plaid)", kind: "app", aliases: ["plaid", "open banking"], proof: ["story:lubot"] },
  { id: "business-systems", label: "Salesforce / ERP / CRM systems", kind: "app", aliases: ["salesforce", "netsuite", "hubspot", "sap", "erp", "crm", "workday", "quickbooks", "zendesk", "intercom"], proof: [], closest: ["apis", "data-mapping"] },
  { id: "scraping", label: "Web scraping & browser automation", kind: "app", aliases: ["web scraping", "scraping", "scraper", "crawler", "playwright", "selenium", "puppeteer"], proof: ["tech:Playwright"] },
  { id: "testing", label: "Automated testing (TDD)", kind: "practice",
    aliases: ["unit test", "integration test", "automated testing", "test driven", "tdd", "pytest", "test coverage", "testing"],
    proof: ["story:lubot", "project:sentinel-ai"] },

  // ── Data ────────────────────────────────────────────────────────────
  { id: "pipelines", label: "Data pipelines (ETL / ELT)", kind: "data",
    aliases: ["etl", "elt", "data pipeline", "pipeline", "data engineering", "data engineer", "ingestion", "data ingestion", "batch processing"],
    proof: ["chapter:pipelines"] },
  { id: "postgres", label: "PostgreSQL", kind: "data", aliases: ["postgres", "postgresql", "psql", "neon", "aurora postgres"], proof: ["tech:PostgreSQL"] },
  { id: "mysql", label: "MySQL", kind: "data", aliases: ["mysql", "mariadb"], proof: ["tech:MySQL"] },
  { id: "sql-server", label: "SQL Server", kind: "data", aliases: ["sql server", "mssql", "ms sql"], proof: ["tech:SQL Server"] },
  { id: "oracle", label: "Oracle", kind: "data", aliases: ["oracle"], proof: [], closest: ["postgres", "sql-server"] },
  { id: "supabase", label: "Supabase", kind: "data", aliases: ["supabase"], proof: ["story:lubot"] },
  { id: "mongodb", label: "MongoDB / NoSQL", kind: "data", aliases: ["mongodb", "mongo", "nosql", "cassandra", "cosmos db"], proof: [], closest: ["dynamodb", "postgres"] },
  { id: "dynamodb", label: "DynamoDB", kind: "data", aliases: ["dynamodb", "dynamo db"], proof: ["tech:DynamoDB"] },
  { id: "redis", label: "Redis", kind: "data", aliases: ["redis", "caching"], proof: [], closest: ["postgres"] },
  { id: "duckdb", label: "DuckDB & Parquet", kind: "data", aliases: ["duckdb"], proof: ["story:lubot"] },
  { id: "snowflake", label: "Snowflake", kind: "data", aliases: ["snowflake", "snowpark"], proof: ["tech:Snowflake"] },
  { id: "databricks", label: "Databricks", kind: "data", aliases: ["databricks", "lakebase", "agent bricks", "delta live tables", "dlt"], proof: ["tech:Databricks", "tech:Databricks Lakebase", "tech:Lakebase"] },
  { id: "lakehouse", label: "Lakehouse (Delta Lake, Iceberg, medallion)", kind: "data",
    aliases: ["delta lake", "lakehouse", "iceberg", "apache iceberg", "medallion", "bronze silver gold", "parquet"],
    proof: ["tech:Delta Lake", "tech:Apache Iceberg", "tech:Delta Live Tables", "story:lubot"] },
  { id: "governance", label: "Data governance & catalog", kind: "data", aliases: ["unity catalog", "data governance", "data catalog", "lineage"], proof: ["tech:Unity Catalog"] },
  { id: "bigquery", label: "BigQuery", kind: "data", aliases: ["bigquery", "big query"], proof: [], closest: ["snowflake", "databricks"] },
  { id: "redshift", label: "Redshift", kind: "data", aliases: ["redshift"], proof: [], closest: ["snowflake", "postgres"] },
  { id: "warehouse", label: "Data warehouse & modeling", kind: "data",
    aliases: ["data warehouse", "data warehousing", "data modeling", "data model", "dimensional model", "dimensional modeling", "star schema", "kimball", "scd type 2", "slowly changing"],
    proof: ["tech:Snowflake", "tech:dbt", "project:citibike-analytics-agent"] },
  { id: "dbt", label: "dbt", kind: "data", aliases: ["dbt", "data build tool"], proof: ["tech:dbt"] },
  { id: "airflow", label: "Airflow (orchestration)", kind: "data", aliases: ["airflow", "apache airflow", "dag", "data orchestration", "pipeline orchestration"], proof: ["tech:Airflow"] },
  { id: "dagster", label: "Dagster / Prefect", kind: "data", aliases: ["dagster", "prefect"], proof: [], closest: ["airflow"] },
  { id: "spark", label: "Spark / PySpark", kind: "data", aliases: ["spark", "pyspark", "apache spark", "spark sql"], proof: ["tech:Apache Spark", "tech:PySpark"] },
  { id: "kafka", label: "Kafka", kind: "data", aliases: ["kafka", "apache kafka", "confluent"], proof: ["tech:Kafka"] },
  { id: "flink", label: "Flink", kind: "data", aliases: ["flink", "apache flink"], proof: ["tech:Apache Flink"] },
  { id: "streaming", label: "Real-time streaming", kind: "data",
    aliases: ["streaming", "real time", "realtime", "stream processing", "event driven", "websocket", "cdc", "change data capture"],
    proof: ["tech:Structured Streaming", "tech:Kafka", "tech:Apache Flink"] },
  { id: "kinesis", label: "Kinesis", kind: "data", aliases: ["kinesis"], proof: [], closest: ["kafka", "streaming"] },
  { id: "fivetran", label: "Fivetran / Airbyte", kind: "data", aliases: ["fivetran", "airbyte", "stitch"], proof: [], closest: ["pipelines", "airflow"] },
  { id: "data-quality", label: "Data quality & validation", kind: "data",
    aliases: ["data quality", "data validation", "data contract", "great expectations", "soda", "data testing", "data integrity", "reconciliation", "reconcile", "data observability"],
    proof: ["industry:Data quality"] },
  { id: "data-mapping", label: "Messy data → one clean table (mapping)", kind: "data",
    aliases: ["data mapping", "schema mapping", "column mapping", "source to target", "harmonization", "golden record", "entity resolution", "deduplication", "messy data", "canonical", "unify data", "unify customer data", "data unification", "single source of truth", "consolidate data"],
    proof: ["story:hellopayments", "project:mergeai"] },
  { id: "migration", label: "Database migration", kind: "data", aliases: ["migration", "data migration", "database migration", "legacy system", "modernization", "dms"], proof: ["project:sql-server-to-postgres-migration"] },
  { id: "performance", label: "Performance tuning", kind: "data", aliases: ["performance tuning", "query optimization", "spark tuning", "optimize pipeline", "performance optimization"], proof: ["project:spark-pipeline-tuning"] },
  { id: "pandas", label: "Pandas / Polars", kind: "data", aliases: ["pandas", "polars", "numpy"], proof: ["tech:Pandas", "tech:Polars"] },

  // ── Cloud & ops ─────────────────────────────────────────────────────
  { id: "aws", label: "AWS", kind: "cloud", aliases: ["aws", "amazon web services"],
    proof: ["tech:AWS Lambda", "tech:Amazon S3", "tech:AWS Glue", "tech:DynamoDB", "tech:Amazon Bedrock", "tech:AWS RDS", "tech:AWS DMS"] },
  { id: "lambda", label: "AWS Lambda & serverless", kind: "cloud", aliases: ["lambda", "serverless", "step function"], proof: ["tech:AWS Lambda"] },
  { id: "s3", label: "Amazon S3", kind: "cloud", aliases: ["s3"], proof: ["tech:Amazon S3"] },
  { id: "glue", label: "AWS Glue", kind: "cloud", aliases: ["glue"], proof: ["tech:AWS Glue"] },
  { id: "aws-more", label: "AWS Athena / EMR / SQS / SageMaker", kind: "cloud", aliases: ["athena", "emr", "sqs", "sns", "eventbridge", "sagemaker", "kinesis firehose"], proof: [], closest: ["aws", "lambda"] },
  { id: "azure", label: "Azure", kind: "cloud", aliases: ["azure", "microsoft azure", "azure data factory", "adf", "synapse", "microsoft fabric", "azure openai", "azure ai foundry", "power automate", "copilot studio"], proof: [], closest: ["aws", "databricks"] },
  { id: "gcp", label: "Google Cloud", kind: "cloud", aliases: ["gcp", "google cloud", "vertex ai", "cloud run"], proof: [], closest: ["aws"] },
  { id: "terraform", label: "Terraform (infrastructure as code)", kind: "cloud", aliases: ["terraform", "infrastructure as code", "iac"], proof: ["tech:Terraform"] },
  { id: "iac-other", label: "CloudFormation / CDK / Pulumi", kind: "cloud", aliases: ["cloudformation", "cdk", "pulumi", "terragrunt", "bicep"], proof: [], closest: ["terraform"] },
  { id: "docker", label: "Docker", kind: "cloud", aliases: ["docker", "container", "containerization", "docker compose"], proof: ["tech:Docker"] },
  { id: "kubernetes", label: "Kubernetes", kind: "cloud", aliases: ["kubernetes", "k8s", "eks", "aks", "gke", "helm"], proof: [], closest: ["docker", "terraform"] },
  { id: "ci-cd", label: "CI/CD", kind: "cloud", aliases: ["ci cd", "cicd", "continuous integration", "continuous deployment", "github actions", "devops"], proof: ["tech:Forgejo CI", "story:lubot"] },
  { id: "ci-other", label: "Jenkins / GitLab CI / CircleCI", kind: "cloud", aliases: ["jenkins", "gitlab ci", "gitlab", "circleci", "azure devops"], proof: [], closest: ["ci-cd"] },
  { id: "monitoring", label: "Monitoring (Sentry, Grafana)", kind: "cloud", aliases: ["monitoring", "observability", "sentry", "grafana", "prometheus", "alerting"], proof: ["tech:Sentry", "tech:Prometheus + Grafana"] },
  { id: "datadog", label: "Datadog / Splunk / New Relic", kind: "cloud", aliases: ["datadog", "splunk", "new relic", "dynatrace"], proof: [], closest: ["monitoring"] },
  { id: "security", label: "Security & compliance", kind: "practice",
    aliases: ["security", "encryption", "nist", "owasp", "soc 2", "soc2", "compliance", "incident response", "data privacy", "pii"],
    proof: ["page:/about#security", "story:hellopayments", "project:sentinel-ai"] },
  { id: "hipaa", label: "HIPAA", kind: "practice", aliases: ["hipaa", "phi"], proof: [], closest: ["security", "health"] },
  { id: "gov-clearance", label: "Public Trust / clearance / FedRAMP", kind: "practice", aliases: ["clearance", "public trust", "fedramp", "fisma", "secret clearance"], proof: [], closest: ["security"] },

  // ── Analytics ───────────────────────────────────────────────────────
  { id: "dashboards", label: "Dashboards & BI", kind: "analytics",
    aliases: ["dashboard", "business intelligence", "bi", "reporting", "kpi", "data visualization", "visualization", "analytics engineer", "analytics engineering"],
    proof: ["chapter:analytics"] },
  { id: "tableau", label: "Tableau", kind: "analytics", aliases: ["tableau"], proof: ["tech:Tableau"] },
  { id: "power-bi", label: "Power BI", kind: "analytics", aliases: ["power bi", "powerbi", "dax"], proof: ["tech:Power BI"] },
  { id: "looker", label: "Looker", kind: "analytics", aliases: ["looker", "lookml", "looker studio"], proof: [], closest: ["tableau", "power-bi"] },
  { id: "sigma", label: "Sigma", kind: "analytics", aliases: ["sigma computing"], proof: ["tech:Sigma"] },
  { id: "excel", label: "Excel", kind: "analytics", aliases: ["excel", "spreadsheet", "pivot table", "google sheets"], proof: ["tech:Excel"] },
  { id: "streamlit", label: "Streamlit", kind: "analytics", aliases: ["streamlit"], proof: ["tech:Streamlit"] },
  { id: "statistics", label: "Statistics & experiments", kind: "analytics", aliases: ["statistics", "statistical", "regression", "hypothesis test", "a b testing", "ab testing", "experimentation"], proof: ["tech:Statistics", "project:mining-process-quality"] },

  // ── How Lubo works ──────────────────────────────────────────────────
  { id: "automation", label: "Automating manual work", kind: "practice",
    aliases: ["automation", "automate", "workflow automation", "manual process", "manual work", "repetitive task", "zapier", "n8n", "make com", "rpa"],
    proof: ["project:sentinel-ai", "project:briefme-ai", "project:lubo-ai-publisher", "project:aws-job-streamer"] },
  { id: "ai-coding", label: "Builds with AI coding tools (Claude Code)", kind: "practice",
    aliases: ["claude code", "ai assisted development", "ai assisted coding", "ai coding", "cursor", "github copilot", "codex", "ai native", "ai first", "ai fluency"],
    proof: ["story:lubot", "project:lubobali-com"] },
  { id: "founding", label: "0 → 1 builds, end-to-end ownership", kind: "practice",
    aliases: ["founding engineer", "0 to 1", "zero to one", "from scratch", "end to end ownership", "own end to end", "greenfield", "startup"],
    proof: ["story:lubot"] },
  { id: "lead", label: "Lead engineer", kind: "practice", aliases: ["lead engineer", "tech lead", "technical lead", "technical leadership", "mentor", "mentoring"], proof: ["job:hellopayments"] },
  { id: "client-facing", label: "Client-facing / forward deployed", kind: "practice", aliases: ["forward deployed", "client facing", "customer facing", "consulting", "consultant"], proof: [], closest: ["lead", "founding"] },

  // ── Industries ──────────────────────────────────────────────────────
  { id: "health", label: "Healthcare", kind: "industry", aliases: ["healthcare", "health care", "health system", "digital health", "hospital", "patient", "clinical", "medical", "healthtech", "ehr"], proof: ["industry:Health"] },
  { id: "finance", label: "Finance & fintech", kind: "industry",
    aliases: ["finance", "financial", "fintech", "banking", "bank", "financial services", "wealth", "asset management", "accounting", "ledger", "trading", "market data", "stock", "lending", "loan", "credit union", "kyc"],
    proof: ["industry:Finance", "job:condo"] },
  { id: "payments", label: "Payments", kind: "industry", aliases: ["payments", "payment processing", "payment", "billing", "commissions", "residuals", "merchant", "invoices", "accounts payable", "stripe"], proof: ["industry:Payments"] },
  { id: "pharma", label: "Pharma & life sciences", kind: "industry", aliases: ["pharma", "pharmaceutical", "life science", "biotech", "drug discovery", "clinical trial"], proof: [], closest: ["health"] },
  { id: "insurance", label: "Insurance", kind: "industry", aliases: ["insurance", "insurtech", "insurance claims", "claims processing", "underwriting", "insurance carrier"], proof: [], closest: ["finance", "payments"] },
  { id: "retail", label: "Retail & e-commerce", kind: "industry", aliases: ["retail", "ecommerce", "e commerce", "online store", "consumer goods"], proof: ["industry:Retail"] },
  { id: "logistics", label: "Logistics & supply chain", kind: "industry", aliases: ["logistics", "supply chain", "shipping", "warehouse operations", "inventory", "fulfillment"], proof: ["industry:Logistics"] },
  { id: "hr", label: "HR & people analytics", kind: "industry", aliases: ["hr", "human resources", "people analytics", "employee data", "workforce", "attrition"], proof: ["industry:HR"] },
  { id: "jobs", label: "Hiring & job data", kind: "industry", aliases: ["recruiting", "hiring platform", "job board", "job posting", "talent acquisition", "hr tech", "labor market"], proof: ["industry:Jobs"] },
  { id: "education", label: "Education", kind: "industry", aliases: ["education", "edtech", "school", "student", "university", "learning platform"], proof: ["industry:Education"] },
  { id: "sports", label: "Sports", kind: "industry", aliases: ["sports", "sport", "basketball", "nba", "betting", "prediction market"], proof: ["industry:Sports"] },
  { id: "government", label: "Government & public sector", kind: "industry", aliases: ["government", "public sector", "federal", "government agency", "world bank"], proof: ["industry:Government"] },
  { id: "industry", label: "Manufacturing & industrial", kind: "industry", aliases: ["manufacturing", "industrial", "factory", "mining", "sensor data", "iot"], proof: ["industry:Industry"] },
  { id: "real-estate", label: "Real estate & property", kind: "industry", aliases: ["real estate", "property", "proptech", "mls", "property listings", "rental"], proof: ["job:remax", "job:condo"] },
  { id: "marketing", label: "Marketing & web analytics", kind: "industry", aliases: ["marketing", "martech", "adtech", "web analytics", "clickstream", "social media"], proof: ["industry:Marketing", "industry:Web"] },
  { id: "support", label: "Customer support", kind: "industry", aliases: ["customer support", "help desk", "helpdesk", "ticketing", "customer service", "support ticket"], proof: ["industry:Customer support"] },
  { id: "transport", label: "Transport & mobility", kind: "industry", aliases: ["transportation", "transport", "mobility", "fleet", "bike share"], proof: ["industry:Transport"] },
  { id: "weather", label: "Weather & climate", kind: "industry", aliases: ["weather", "climate"], proof: ["industry:Weather"] },
  { id: "crypto", label: "Crypto", kind: "industry", aliases: ["crypto", "bitcoin", "blockchain", "web3"], proof: ["project:bitcoin-streaming-pipeline"] },
  { id: "food", label: "Food & delivery", kind: "industry", aliases: ["food", "restaurant", "food delivery", "grocery"], proof: ["industry:Food"] },
];
