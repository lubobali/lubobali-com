import type { Project } from "./model";

// Public repo lubobali/bitcoin-dlt-streaming-pipeline (README read
// 2026-10-22). A small test run (18 trades), said so. Facts: plans
// docs/phase-5-facts.md.
export const bitcoinStreaming: Project = {
  slug: "bitcoin-streaming-pipeline",
  name: "Bitcoin streaming pipeline",
  chapter: "pipelines",
  industries: ["Finance", "Data quality"],
  oneLine: "Live Bitcoin trades, cleaned as they arrive, and bad ones kept aside instead of lost",
  description:
    "Real-time Bitcoin trade pipeline on Databricks Delta Live Tables: bad trades go to quarantine with a reason, so no row is ever silently lost.",
  number: { value: "0", label: "rows silently dropped: every bad trade kept with a reason" },
  problem:
    "Streaming pipelines usually drop bad records without a trace. Later nobody can say what was lost, or why the numbers don't match.",
  built:
    "Live BTC-USD trades from a WebSocket flow through Bronze, then split: clean trades to Silver, bad ones to a quarantine table with the reason, and Silver feeds 1-minute price candles in Gold.",
  why: "Delta Live Tables checks every trade (price, size, time, type); clean plus quarantined always equals everything that came in.",
  result:
    "In the test run, 18 trades came in: 15 clean, 3 held in quarantine with their reason, none lost. Gold builds 1-minute candles from the clean ones.",
  honesty: "A small test run: 18 trades.",
  tech: ["Databricks", "Delta Live Tables", "PySpark", "Structured Streaming"],
  // Brand card (P5.6): Bronze splits into Silver + Quarantine (they add up).
  picture: {
    kind: "medallion",
    title: "Bad trades kept aside, never lost",
    raw: { label: "Bronze: every trade", count: 18 },
    clean: { label: "Silver: clean", count: 15 },
    held: { label: "Quarantine", count: 3, detail: "kept with the reason" },
    gold: { label: "Gold", detail: "1-minute price candles" },
    caption: "Clean + quarantine = all rows",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/bitcoin-dlt-streaming-pipeline" }],
  searches: ["real time streaming pipeline", "bad data quarantine", "bitcoin trades"],
};
