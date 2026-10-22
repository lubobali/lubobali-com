import type { Project } from "./model";

// Public repo lubobali/airflow-dq-pipeline (README read 2026-10-22, cleaned
// the same day). Facts: plans docs/phase-5-facts.md.
export const airflowDq: Project = {
  slug: "airflow-dq-pipeline",
  name: "Airflow data quality pipeline",
  chapter: "pipelines",
  industries: ["Data quality", "Finance"],
  oneLine: "New stock data waits in staging, passes 4 checks, then swaps into production in one move",
  description:
    "An Airflow pipeline on Apache Iceberg and S3: new data lands in staging, 4 quality checks run, and it swaps into production only if all pass.",
  number: { value: "4", label: "checks before any data reaches production" },
  problem:
    "Most pipelines write straight to production, so when bad data slips through, the people reading the reports see it before the team does.",
  built:
    "An Airflow pipeline that waits for upstream data, loads it into a staging table, runs 4 checks (not empty, no missing prices, prices above zero, no negative volume) and only then swaps the day into production and cleans up.",
  why: "Apache Iceberg on S3 with the AWS Glue catalog gives an atomic partition swap: production is never half-written, and any day can be re-run safely.",
  result:
    "If any check fails, the pipeline stops and production keeps yesterday's good data. Every run is repeatable and can be backfilled.",
  tech: ["Airflow", "Apache Iceberg", "AWS Glue", "Amazon S3", "Python"],
  // Brand card (P5.6): the 5 tasks in order.
  picture: {
    kind: "flow",
    steps: [
      { label: "Wait for data", detail: "a sensor waits until the upstream table is ready" },
      { label: "Load to staging", detail: "new data is kept apart from production" },
      { label: "4 checks", detail: "not empty, no missing prices, prices above zero, volumes not negative" },
      { label: "Swap into production", detail: "one atomic partition swap, never half-written" },
      { label: "Clean up", detail: "the staging table is dropped" },
    ],
    caption: "Write, audit, publish on Iceberg",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/airflow-dq-pipeline" }],
  searches: ["airflow data quality", "iceberg pipeline", "staging before production"],
};
