import type { Project } from "./model";

// Public repo lubobali/spark-stock-pipeline-optimisation (README read
// 2026-10-22, timings measured on Databricks Serverless). Facts: plans
// docs/phase-5-facts.md.
export const sparkTuning: Project = {
  slug: "spark-pipeline-tuning",
  name: "Spark pipeline tuning",
  chapter: "pipelines",
  industries: ["Finance"],
  oneLine: "A stock signal pipeline made 4× faster, and the bug it was hiding found",
  description:
    "PySpark tuning on Databricks: 8 slow patterns fixed in a stock signal pipeline, 183 s down to 47 s, and 268 silently missed signals found.",
  number: { value: "4×", label: "faster: 183 seconds down to 47 per run" },
  problem:
    "A Spark pipeline gave correct-looking results but ran slowly, and on real data volumes it would take hours or crash. It was also quietly wrong.",
  built:
    "Measured all 7 stages on 1.7 million minute bars, found 8 slow patterns (Python UDFs, needless shuffles, thousands of tiny files) and fixed each one, then compared the results before and after.",
  why: "PySpark on Databricks with Delta Lake, where this kind of data lives. Each fix is a plain Spark change any team can keep.",
  result:
    "4× faster overall, up to 15× on one stage, and 268 buy/sell signal changes (26%) that the old code silently dropped are now caught: it skipped weekends.",
  tech: ["PySpark", "Databricks", "Delta Lake", "Unity Catalog"],
  // Brand card (P5.6): the same 7 stages before vs after (seconds from the
  // README timing table; totals are their sums: 183 s and 47 s).
  picture: {
    kind: "race",
    title: "Same pipeline, 183 s down to 47 s",
    unit: "s",
    stages: [
      { label: "Load", before: 29.49, after: 2 },
      { label: "Daily totals", before: 4, after: 1 },
      { label: "Indicators", before: 47, after: 5 },
      { label: "Correlation", before: 51.11, after: 14.69 },
      { label: "Signal report", before: 19, after: 14 },
      { label: "Delta write", before: 31, after: 9.7 },
      { label: "Summary", before: 1, after: 1 },
    ],
    caption: "Measured on Databricks Serverless",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/spark-stock-pipeline-optimisation" }],
  searches: ["slow spark pipeline", "pyspark tuning", "make data pipeline faster"],
};
