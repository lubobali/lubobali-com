import type { Project } from "./model";

// Framer page "IBM" (archived 2026-10-22). The IBM dataset is fictional but
// realistic: said on the page. Facts: plans docs/phase-5-facts.md.
export const ibmHr: Project = {
  slug: "ibm-hr-attrition",
  name: "What really drives pay and quitting",
  chapter: "analytics",
  industries: ["HR"],
  oneLine: "Tested HR beliefs with statistics: experience, not age, drives pay, and a firing rumor was false",
  description:
    "HR analytics in R on IBM's employee data: experience explains pay far better than age, younger staff leave more, and a firing rumor was false.",
  number: { value: "60%", label: "of pay explained by experience + age (25% by age alone)" },
  problem:
    "HR decisions often run on beliefs: older people earn more, new hires get fired first. If the belief is wrong, the policy built on it is wrong too.",
  built:
    "An R analysis that tests each belief: regressions for what drives salary (monthly income), a t-test for the firing rumor, and an attrition comparison of who stays and who leaves.",
  why: "Statistics instead of gut feeling: a regression shows how much each factor adds, and a p-value shows when a difference is just noise.",
  result:
    "Each year of experience adds about $489 a month, against $257 per year of age; adding experience lifts the model from 25% to about 60%. People who left were about 4 years younger, and the \"new hires get fired\" rumor didn't hold (p = 0.68).",
  honesty: "IBM's public HR dataset: fictional but realistic.",
  tech: ["R", "Statistics"],
  // Brand card (P5.6): the two slopes head to head.
  picture: {
    kind: "versus",
    title: "Experience pays almost twice as much as age",
    left: { value: "$257", label: "more a month per year of age" },
    right: { value: "$489", label: "more a month per year of experience" },
    winner: "right",
    caption: "Regression on IBM HR data",
  },
  links: [],
  source: { label: "IBM HR Analytics (Kaggle)", url: "https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset" },
  searches: ["employee attrition", "what drives salary", "hr analytics"],
};
