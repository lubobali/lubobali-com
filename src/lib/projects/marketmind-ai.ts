import type { Project } from "./model";

// Public repo lubobali/MarketMind_AI (README read 2026-10-22). No bootcamp
// mention (Lubo). Facts: plans docs/phase-5-facts.md.
export const marketMind: Project = {
  slug: "marketmind-ai",
  name: "MarketMind AI",
  chapter: "ai",
  industries: ["Finance"],
  oneLine: "A market analyst agent: live prices, news mood and signals, answered in plain English",
  description:
    "MarketMind AI: streams prices for 15 stocks, scores 131 news articles for mood, and an agent with 6 tools answers in about 2.6 seconds.",
  number: { value: "2.6 s", label: "average answer, up to 4 tool calls" },
  problem:
    "A retail investor can't follow prices, news and signals at once, and by the time they do, the moment has passed.",
  built:
    "A streaming pipeline (Bronze → Silver → Gold) for prices and news, news scored for mood (sentiment analysis), buy/sell/hold signals from RSI, MACD and Bollinger Bands, and an agent that answers questions about all of it.",
  why: "Spark Structured Streaming and Delta Live Tables on Databricks for clean data with checks, and Llama 3.3 70B with tool calling so answers come from the tables, not memory.",
  result:
    "15 stocks in 5 sectors, 131 articles scored, 15 Delta tables, and an agent with 6 tools that answers in 2.6 seconds on average. 308 tests.",
  tech: ["Databricks", "Apache Spark", "Delta Live Tables", "Llama 3.3", "MLflow"],
  // Brand card (P5.6): the 15 stocks by sector, plus the agent's numbers.
  picture: {
    kind: "sectors",
    title: "15 stocks, 131 news articles, one agent",
    groups: [
      { name: "Technology", items: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"] },
      { name: "Finance", items: ["JPM", "GS", "BAC"] },
      { name: "Energy", items: ["XOM", "CVX"] },
      { name: "Healthcare", items: ["PFE", "JNJ"] },
      { name: "Consumer", items: ["TSLA", "WMT", "KO"] },
    ],
    stats: [
      { value: "131", label: "news articles scored" },
      { value: "6", label: "agent tools" },
      { value: "2.6 s", label: "average answer" },
    ],
    caption: "Databricks · Delta Live Tables",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/MarketMind_AI" }],
  searches: ["stock market ai agent", "news sentiment analysis", "trading signals"],
  anatomy: {
    model: "Meta Llama 3.3 70B with tool calling (Databricks Foundation Models).",
    harness: "An agent loop with up to 4 tool calls per question, tracked in MLflow.",
    guardrails: "Answers come only from the Delta tables through 6 tools; data quality checks quarantine bad rows before they reach Gold.",
    knowledge: "Prices for 15 stocks and 131 news articles, through Bronze, Silver and Gold tables.",
    tools: "Price, sector performance, market mood, technical signals, compare two stocks, market summary.",
  },
};
