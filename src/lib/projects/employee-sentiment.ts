import type { Project } from "./model";

// Public repo lubobali/employee-sentiment-analysis (README read
// 2026-10-22). Chart counted from the repo's data/labeled_data.csv. No
// employee names (real people in the data). Facts: plans docs/phase-5-facts.md.
export const employeeSentiment: Project = {
  slug: "employee-sentiment",
  name: "Employee sentiment",
  chapter: "analytics",
  industries: ["HR"],
  oneLine: "Spot unhappy employees early, from the tone of their work emails",
  description:
    "Employee sentiment analysis in Python: 2,191 work emails scored for tone, mood tracked by month and possible flight risks flagged early.",
  number: { value: "2,191", label: "work emails read for tone" },
  problem: "HR often learns that someone is unhappy only when they resign, and by then it's too late to help.",
  built:
    "Python reads each email and marks it positive, neutral or negative, scores every person month by month, and flags anyone with 4 or more negative emails in 30 days.",
  why: "Simple, explainable language analysis (TextBlob) and scikit-learn, so HR can see exactly why someone was flagged.",
  result:
    "92% of emails were neutral or positive, so the workplace was mostly healthy, but 7 people were flagged as possible flight risks (people who may quit), even some of the most positive ones.",
  tech: ["Python", "Pandas", "TextBlob", "scikit-learn"],
  // Brand card (P5.6): one dot per 10 emails (counted from the repo's
  // data/labeled_data.csv), negatives lit.
  picture: {
    kind: "dots",
    title: "7 possible flight risks, spotted from tone alone",
    per: 10,
    groups: [
      { label: "Neutral", count: 1056 },
      { label: "Positive", count: 971 },
      { label: "Negative", count: 164, lit: true },
    ],
    caption: "4+ negative emails in 30 days = a flag",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/employee-sentiment-analysis" }],
  searches: ["employees leaving", "employee sentiment", "flight risk"],
};
