import type { Project } from "./model";

// Framer pages "CVS Contractor Performance" + "CVS pipeline" (archived
// 2026-10-22) + public repo lubobali/CVS_contractor-api-pipeline-and-dashboard,
// one page (Lubo OK). Lubo never worked at CVS ("a project because I wanted
// to work with CVS"): made-up data, said on the page. The screen is his
// public Tableau dashboard. Facts: plans docs/phase-5-facts.md.
export const cvsContractors: Project = {
  slug: "cvs-contractor-performance",
  name: "Contractor performance (modeled on CVS)",
  chapter: "analytics",
  industries: ["Facilities", "Retail"],
  oneLine: "Which maintenance contractors cost the most and miss their deadlines",
  description:
    "Contractor performance for a CVS-style facilities team: SQL and a Tableau dashboard show overdue work orders, cost per order and response times.",
  number: { value: "18%", label: "of work orders overdue, on average" },
  problem:
    "Big retail chains pay many contractors to fix their stores. Without measuring them, late and expensive vendors stay hidden in the budget.",
  built:
    "A small pipeline (Flask API → PostgreSQL → daily CSV export) and SQL that answers 4 questions: cost per order, who is late most, who costs most, how fast they respond. Tableau puts it on one executive screen.",
  why: "SQL and Tableau, the tools facilities and finance teams already use, so anyone can check the numbers and rerun them every month.",
  result:
    "An average order costs $1,340 (the Midwest costs most), 18% of orders are late and some vendors miss half their deadlines: clear targets for the next contract talk.",
  honesty: "Made-up data, modeled on how a CVS facilities team could work. I built it because I wanted to work with CVS; it isn't CVS data.",
  tech: ["SQL", "Tableau", "PostgreSQL", "Flask", "Python"],
  // Brand card (P5.6): the dashboard's headline numbers (Tableau); the real
  // dashboard is shown large below.
  picture: {
    kind: "kpis",
    title: "Some vendors miss half their deadlines",
    tiles: [
      { value: "18%", label: "of work orders overdue" },
      { value: "$1,340", label: "average work order" },
      { value: "134 min", label: "average response" },
    ],
    bars: {
      title: "Average work order cost by region",
      prefix: "$",
      items: [
        { label: "Midwest", value: 1417.7 },
        { label: "West", value: 1351.5 },
        { label: "Northeast", value: 1338.9 },
        { label: "South", value: 1276.1 },
      ],
    },
    caption: "Made-up data, modeled on CVS",
  },
  screen: {
    image: "cvs-contractor-dashboard",
    title: "See the real dashboard",
    alt: "Tableau dashboard: 18% average overdue rate, $1,340 average work order cost, 134 minutes average response, overdue share by contractor, cost by region and response time by contractor",
    caption: "Real Tableau dashboard, made-up data.",
  },
  links: [
    { kind: "dashboard", url: "https://public.tableau.com/views/CVSContractorsExecutiveDashboard/Dashboard1" },
    { kind: "github", url: "https://github.com/lubobali/CVS_contractor-api-pipeline-and-dashboard" },
  ],
  searches: ["contractor performance", "vendor costs", "facilities maintenance"],
};
