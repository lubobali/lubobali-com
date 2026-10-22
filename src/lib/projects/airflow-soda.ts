import type { Project } from "./model";

// Public repo lubobali/airflow-soda-integration (README read 2026-10-22).
// Facts: plans docs/phase-5-facts.md.
export const airflowSoda: Project = {
  slug: "airflow-soda-quality-checks",
  name: "Airflow + Soda quality checks",
  chapter: "pipelines",
  industries: ["Data quality"],
  oneLine: "Data quality rules written in plain lines, run on a schedule, logged on every run",
  description:
    "Airflow runs Soda data quality checks on a PostgreSQL table on a schedule: empty tables, missing values and duplicates caught early.",
  number: { value: "4", label: "data quality rules checked on every run" },
  problem:
    "Empty tables, missing values and duplicate rows usually show up in a report first. Nobody checks by hand every day.",
  built:
    "An Airflow DAG that runs Soda checks against a PostgreSQL table on a schedule; the rules live in one readable file, and every scan is logged in Airflow.",
  why: "Soda rules read like sentences (row count above zero, no duplicates), so anyone can add one without writing code; Docker runs it all locally.",
  result:
    "Every run checks the table and leaves a log, and a new rule is one line in the rules file, with no extra code.",
  tech: ["Airflow", "Soda", "PostgreSQL", "Docker"],
  // Brand card (P5.6): the rules as written in checks.yml.
  picture: {
    kind: "rules",
    title: "Rules anyone can read, checked on every run",
    rules: ["row_count > 0", "missing_count(dag_id) = 0", "missing_count(execution_date) = 0", "duplicate_count(run_id) = 0"],
    caption: "Soda checks inside Airflow",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/airflow-soda-integration" }],
  searches: ["soda data quality", "data checks airflow", "duplicate rows check"],
};
