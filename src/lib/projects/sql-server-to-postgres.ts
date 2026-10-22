import type { Project } from "./model";

// Public repo lubobali/mssql-to-postgres-migration-kit (README read
// 2026-10-22). All data is generated ("No real data anywhere"), said so.
export const sqlServerToPostgres: Project = {
  slug: "sql-server-to-postgres-migration",
  name: "SQL Server → PostgreSQL migration",
  chapter: "pipelines",
  industries: ["Payments", "Finance", "Data quality"],
  oneLine: "Moving a payments database to AWS, and proving the money still adds up",
  description:
    "SQL Server to AWS PostgreSQL migration with Terraform and DMS. Every row arrived, yet 83,892 report rows silently stopped matching. Here is why.",
  number: { value: "83,892", label: "report rows that silently stopped matching" },
  problem:
    "Moving the data is the easy part. Knowing it arrived correct is the hard part: a lost cent or a date shifted by a time zone throws no error. It just gives you wrong numbers, forever.",
  built:
    "A full move from SQL Server 2022 to AWS RDS PostgreSQL, every resource in Terraform: AWS DMS with live replication, 15 checks that fail on any difference, a timed backup and restore, and Parquet copies for analytics.",
  why: "AWS DMS keeps the old system taking payments during the move (3.0 s behind). Terraform makes it repeatable. The checks run in CI, so a wrong number can't ship.",
  result:
    "Every row arrived and all 15 checks passed, yet a status filter returned a third of the rows: SQL Server ignores upper and lower case, PostgreSQL doesn't. Found before any report went wrong.",
  tech: ["SQL Server", "PostgreSQL", "AWS RDS", "AWS DMS", "Terraform", "Python", "Snowflake"],
  // Brand card (P5.6, CEO hook): the same rows in both systems; two thirds
  // silently missing from the filter (README: "returned a third of the rows").
  picture: {
    kind: "reconcile",
    title: "Every row arrived. 83,892 still came out wrong.",
    left: { label: "SQL Server", note: "ignores upper and lower case: the status filter finds every row" },
    right: { label: "PostgreSQL", note: "case matters: the same filter finds only a third" },
    missingShare: 2 / 3,
    caption: "Found before any report went wrong",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/mssql-to-postgres-migration-kit" }],
  honesty: "Generated test data: no real customers or cards.",
  searches: ["database migration", "move sql server to postgres", "payments data quality"],
  safe: "Private, encrypted database with IAM sign-in; no SSH into the old server; passwords live in AWS Secrets Manager, never in a file.",
};
