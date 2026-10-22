import type { Project } from "./model";

// Public repo lubobali/delta-lake-stock-pipeline (README read 2026-10-22).
// 1,950 minute bars per ticker = 5 trading days (390 a day), so ~40
// partitions (8 tickers x 5 days), as the README says. Facts: plans
// docs/phase-5-facts.md.
export const deltaLakeStocks: Project = {
  slug: "delta-lake-stock-pipeline",
  name: "Delta Lake stock pipeline",
  chapter: "pipelines",
  industries: ["Finance"],
  oneLine: "Stock data laid out so a query reads only what it needs, and other teams find it by name",
  description:
    "PySpark + Delta Lake pipeline for minute stock data: partitioned by ticker and day, optimized and shared by name in Unity Catalog.",
  number: { value: "1 of 8", label: "stocks' partitions read when you ask about one stock" },
  problem:
    "Stock data piles up fast. Stored carelessly, every question scans everything, and other teams need to know file paths to use it.",
  built:
    "A pipeline that pulls minute-level prices for 8 stocks, writes them to a Delta table split by stock and day, keeps the files tidy (OPTIMIZE, Z-ORDER, VACUUM) and registers the table in Unity Catalog.",
  why: "Questions almost always filter by stock or date, so partitioning the data that way lets each query skip the rest; the catalog lets anyone query it by name.",
  result:
    "About 40 partitions instead of thousands, a query for one stock reads only its own, and the table is shared by name. Rate limits of the price API are handled with pacing and retries.",
  tech: ["PySpark", "Delta Lake", "Unity Catalog", "Databricks"],
  // Brand card (P5.6): 8 stocks x 5 days; a one-stock query lights one row.
  picture: {
    kind: "grid",
    title: "A query reads only the data it needs",
    rows: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM"],
    cols: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    lit: "NVDA",
    caption: "Partitioned by stock and day",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/delta-lake-stock-pipeline" }],
  searches: ["delta lake partitioning", "stock data pipeline", "unity catalog table"],
};
