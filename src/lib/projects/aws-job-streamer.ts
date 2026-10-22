import type { Project } from "./model";

// Public repo lubobali/aws-job-streamer (README read 2026-10-22). Picture
// drawn in code: the repo's email screenshot shows Lubo's own job search,
// so it is not used. Facts: plans docs/phase-5-facts.md.
export const awsJobStreamer: Project = {
  slug: "aws-job-streamer",
  name: "aws-job-streamer",
  chapter: "pipelines",
  industries: ["Jobs"],
  oneLine: "A live AWS pipeline that reads ~130 job boards and emails only the jobs worth applying to",
  description:
    "aws-job-streamer: a live serverless AWS pipeline. Reads ~130 job sources every 4 hours, scores each new job with AI and emails a ranked list.",
  number: { value: "~130", label: "job sources read every 4 hours, all in ~17 seconds" },
  problem:
    "Job posts are spread over dozens of boards, many are stale, and the good ones fill fast. Reading them all by hand takes hours every week.",
  built:
    "Every 4 hours a serverless pipeline pulls ~130 boards, drops jobs that can't be taken, scores each new one from 0 to 100 with an AI model and emails a ranked list. A daily \"still alive\" email and alarms mean it never fails silently.",
  why: "Serverless AWS runs only on schedule, and Terraform rebuilds all of it from code. Each job is scored once, ever, so the AI bill stays small and predictable.",
  result:
    "Live and running: real matches arrive every 4 hours, 616 tests guard it, and a person still decides where to apply.",
  tech: ["AWS Lambda", "Terraform", "DynamoDB", "Amazon Bedrock", "Python"],
  // Brand card (P5.6): many boards in, a short ranked list out. The repo's
  // email screenshot shows Lubo's own job search, so it is not used.
  picture: {
    kind: "funnel",
    title: "~130 job boards in, only the jobs worth it out",
    stages: [
      { label: "~130 sources", detail: "public job APIs, Workday boards, Adzuna, Remotive, USAJobs" },
      { label: "Can really be taken", detail: "work rights and location checked first" },
      { label: "New jobs only", detail: "each one scored once, ever: the AI bill stays small" },
      { label: "AI score 0–100", detail: "one honest reason each (Claude Haiku on Amazon Bedrock)" },
      { label: "Ranked email", detail: "every 4 hours, plus a daily heartbeat" },
    ],
    caption: "Runs by itself every 4 hours on AWS",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/aws-job-streamer" }],
  searches: ["job postings pipeline", "aws serverless pipeline", "score jobs with ai"],
};
