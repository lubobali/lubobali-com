import type { Project } from "./model";

// Public repo lubobali/dbt-airflow-wap-pipeline (README read 2026-10-22).
// Facts: plans docs/phase-5-facts.md.
export const dbtWap: Project = {
  slug: "dbt-airflow-wap-pipeline",
  name: "Write, audit, publish (dbt + Airflow)",
  chapter: "pipelines",
  industries: ["Data quality"],
  oneLine: "Bad data stops at the door: tested first, published only if every test passes",
  description:
    "A dbt + Airflow pipeline on Snowflake with Write-Audit-Publish: data is tested before it reaches production, and one failed test stops it.",
  number: { value: "3", label: "SQL files replace 300+ lines of Python" },
  problem:
    "When bad data lands in production tables, every dashboard and report built on them is wrong before anyone notices.",
  built:
    "A Write-Audit-Publish pipeline: new data lands in an audit table, dbt tests run there (unique, not empty, prices above zero), and only if all pass does it merge into production.",
  why: "dbt for tested SQL instead of custom Python, Airflow (with Cosmos) to run it on a schedule and show exactly where it stopped, Snowflake as the warehouse.",
  result:
    "One failed test stops the pipeline, so bad data never reaches production, and 300+ lines of Python became 3 SQL files.",
  tech: ["dbt", "Airflow", "Snowflake", "SQL"],
  // Brand card (P5.6): the three gates of Write-Audit-Publish.
  picture: {
    kind: "gates",
    title: "Bad data never reaches production",
    gates: [
      { label: "Write", detail: "new data lands in an audit table first" },
      { label: "Audit", detail: "dbt tests: unique, not empty, prices above zero", turnsAway: true },
      { label: "Publish", detail: "merged into production only if every test passed" },
    ],
    outcomes: ["Production table", "Pipeline stopped"],
    caption: "dbt · Airflow · Snowflake",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/dbt-airflow-wap-pipeline" }],
  searches: ["data quality pipeline", "write audit publish", "dbt airflow"],
};
