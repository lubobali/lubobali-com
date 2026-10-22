import type { Project } from "./model";

// Framer page "Massachusetts" (archived 2026-10-22). CORRECTION: no "2024"
// (the public dataset isn't from 2024); class size and college attendance
// shown as a link, not a cause. Video is Lubo's. Facts: plans
// docs/phase-5-facts.md.
export const massSchools: Project = {
  slug: "massachusetts-schools",
  name: "Massachusetts schools",
  chapter: "analytics",
  industries: ["Education"],
  oneLine: "School performance across 1,861 public schools, and two common beliefs the data didn't support",
  description:
    "Tableau dashboard of 1,861 Massachusetts public schools: class size, college attendance, graduation rates and 4th-grade math, with some surprises.",
  number: { value: "1,861", label: "public schools compared" },
  problem:
    "School decisions lean on beliefs like \"smaller classes mean better outcomes\". Leaders need to see where that holds and which schools need help.",
  built:
    "A Tableau dashboard and analysis of state school data: class size against college attendance, economically disadvantaged schools highlighted, the lowest graduation rates, and 4th-grade math scores.",
  why: "Tableau, so school leaders and parents can filter by school and see the pattern themselves, not just read a table.",
  result:
    "Schools with larger classes had higher college attendance (a link, not a cause), many economically disadvantaged schools matched or beat the rest, and the schools that most need support stand out.",
  tech: ["Tableau"],
  // Brand card (P5.6): beliefs vs what the data showed.
  picture: {
    kind: "myths",
    title: "The data didn't support two school beliefs",
    rows: [
      { assumed: "Smaller classes send more students to college", found: "Larger classes went with higher college attendance" },
      { assumed: "Low-income schools fall behind on college", found: "Many matched or beat the other schools" },
    ],
    caption: "State education data, 1,861 schools",
  },
  links: [{ kind: "video", url: "https://www.youtube.com/watch?v=2qhZbQrXPbE", label: "Watch the dashboard walkthrough" }],
  source: { label: "Massachusetts public schools data (Kaggle)", url: "https://www.kaggle.com/datasets/ndalziel/massachusetts-public-schools-data" },
  searches: ["school performance", "education data analysis", "class size college"],
};
