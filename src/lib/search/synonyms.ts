// Same-meaning words for site search (Phase 5 P5.2). A CEO types their own
// words ("customers leaving"), not ours ("churn"): every phrase in a group
// finds what any other phrase in the group finds. Lower case; plurals are
// handled by the engine. Grow it from the monthly search report (P5.8):
// a search that found nothing usually means a missing word here.
// No imports, so the tests load it directly.

export const synonyms: readonly (readonly string[])[] = [
  // Industries
  ["health", "healthcare", "hospital", "patient", "medical", "clinic", "care"],
  ["finance", "financial", "bank", "banking", "fintech"],
  ["payments", "payouts", "commissions", "invoices", "billing", "payroll"],
  ["stock", "market", "trading", "investing", "portfolio", "ticker"],
  ["crypto", "bitcoin", "btc", "blockchain"],
  ["retail", "store", "shop", "ecommerce", "e commerce"],
  ["food", "restaurant", "delivery app", "doordash"],
  ["logistics", "supply chain", "shipping", "delivery", "warehouse", "inventory"],
  ["hr", "human resources", "employees", "staff", "workforce", "people team"],
  ["jobs", "hiring", "recruiting", "job postings", "careers", "talent"],
  ["education", "school", "students", "university", "college"],
  ["sports", "basketball", "nba"],
  ["government", "public sector", "world bank", "loans", "public money"],
  ["mining", "manufacturing", "factory", "plant", "industrial", "production"],
  ["transport", "transportation", "bikes", "bike share", "mobility"],
  ["weather", "weather forecast", "storm", "alerts"],
  ["marketing", "content", "social media", "linkedin", "posts"],
  ["website", "web analytics", "traffic", "visitors", "google analytics"],
  ["support", "customer support", "help desk", "helpdesk", "tickets", "service desk"],
  ["email", "inbox", "gmail", "mail"],
  ["calendar", "meetings", "schedule", "assistant"],
  ["real estate", "property", "housing"],

  // Problems, in CEO words
  ["customers leaving", "churn", "attrition", "people leave", "quit", "turnover", "retention"],
  ["fraud", "money laundering", "aml", "suspicious", "scam"],
  ["by hand", "manual", "copy paste", "repetitive"],
  ["automate", "automation", "automatic", "automated", "workflow"],
  ["reports", "reporting", "dashboard", "kpi", "bi", "visualization", "charts"],
  ["month end", "close the books", "reconciliation"],
  ["bad data", "data quality", "dq", "validation", "audit", "wrong numbers"],
  ["migration", "migrate", "move database", "legacy", "modernize"],
  ["slow", "speed", "performance", "faster", "optimization", "optimisation", "tuning"],
  ["costs", "save money", "cheaper", "spend", "tokens", "budget"],
  ["real time", "realtime", "streaming", "live", "events"],
  ["forecast", "forecasting", "prediction", "predict", "machine learning", "ml", "model"],
  ["search", "semantic search", "vector search", "rag", "embeddings"],
  ["sentiment", "mood", "feelings", "nlp", "text analysis"],
  ["readmissions", "come back", "return to hospital"],
  ["late deliveries", "delays", "late", "on time"],

  // Tech, in the words people use for it
  ["ai", "artificial intelligence", "llm", "gpt", "claude", "agents", "chatbot", "copilot"],
  ["mcp", "model context protocol"],
  ["pipelines", "etl", "elt", "data engineering", "ingestion"],
  ["data warehouse", "snowflake", "databricks", "lakehouse", "delta lake"],
  ["postgres", "postgresql", "sql server", "mssql", "mysql", "database"],
  ["power bi", "powerbi"],
  ["excel", "spreadsheet"],
  ["aws", "amazon web services", "lambda", "cloud"],
  ["spark", "pyspark"],
  ["airflow", "orchestration", "scheduler"],
];
