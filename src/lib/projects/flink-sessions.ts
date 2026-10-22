import type { Project } from "./model";

// Public repo lubobali/flink-sessionization-project (read 2026-10-22). The
// "events per session" figures in its notes are examples, not results, so
// they are not used; the picture is an illustration of the 5-minute rule.
// Facts: plans docs/phase-5-facts.md.
export const flinkSessions: Project = {
  slug: "flink-sessionization",
  name: "Real-time web sessions (Flink)",
  chapter: "pipelines",
  industries: ["Web", "Marketing"],
  oneLine: "Live website clicks grouped into visits as they happen, with each visitor's location added",
  description:
    "A real-time pipeline with Apache Flink and Kafka: web events grouped into sessions with a 5-minute gap, enriched with location, saved to PostgreSQL.",
  number: { value: "5 min", label: "of quiet ends a visit" },
  problem:
    "Raw clickstream data doesn't say what a visit is. Without sessions, questions like \"how long do people stay\" can't be answered while the data is still fresh.",
  built:
    "A Flink job that reads web events from Kafka, adds the visitor's location from their IP, groups events into sessions that end after 5 minutes of quiet, and writes the result to PostgreSQL and back to Kafka.",
  why: "Flink works on event time with a watermark, so late or out-of-order clicks still land in the right session.",
  result:
    "Live sessions per visitor and website, ready for clickstream analytics like average events per visit, while the data is still minutes old.",
  tech: ["Apache Flink", "Kafka", "PostgreSQL", "Python"],
  // Brand card (P5.6): an illustration of how the 5-minute gap splits visits.
  picture: {
    kind: "sessions",
    title: "Clicks become visits, live",
    gap: "5 min",
    sessions: [4, 6, 3],
    caption: "Illustration of the session rule",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/flink-sessionization-project" }],
  searches: ["real time sessions", "flink kafka", "clickstream analytics"],
};
