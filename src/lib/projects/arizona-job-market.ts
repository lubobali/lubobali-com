import type { Project } from "./model";

// Framer page "Arizona job market" (archived 2026-10-22); live feed, raw data
// not public (said). Video is Lubo's own. Facts: plans docs/phase-5-facts.md.
export const arizonaJobs: Project = {
  slug: "arizona-job-market",
  name: "Arizona job market",
  chapter: "analytics",
  industries: ["Jobs"],
  oneLine: "Who's hiring, when, and how much experience they really ask for, from live job data",
  description:
    "Sigma dashboards on live Snowflake data: 35,000+ Arizona job postings show who's hiring, when, and how much experience employers really ask for.",
  number: { value: "35,000+", label: "live job postings analyzed" },
  problem:
    "Job seekers and recruiters guess at hiring seasons and requirements. Live postings show what employers actually ask for, and when.",
  built:
    "Sigma dashboards on a live labor-market feed in Snowflake: experience required, monthly postings, top employers and top job titles across Arizona.",
  why: "Sigma reads Snowflake directly, so the dashboards stay live without exports, and SQL is there when a question needs it.",
  result:
    "\"1 year of experience\" was the most common ask (6,000+ postings), about 800 jobs needed none, and the hiring trends were clear: a peak in summer, a dip in winter.",
  honesty: "Live data from a licensed labor-market feed; the raw data isn't public.",
  tech: ["Sigma", "Snowflake", "SQL"],
  // Brand card (P5.6): the headline numbers.
  picture: {
    kind: "kpis",
    title: "1 year of experience is the most common ask",
    tiles: [
      { value: "35,000+", label: "live job postings" },
      { value: "6,000+", label: "ask for 1 year" },
      { value: "~800", label: "need no experience" },
    ],
    caption: "Live Snowflake data in Sigma",
  },
  links: [{ kind: "video", url: "https://www.youtube.com/watch?v=L_E7QborfDg", label: "Watch the dashboard walkthrough" }],
  searches: ["hiring trends", "job market analysis", "sigma snowflake dashboard"],
};
