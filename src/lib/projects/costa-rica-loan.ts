import type { Project } from "./model";

// Framer page "Costa Rica" (archived 2026-10-22), verified there with two
// World Bank reports. 85% = $9,148,225 / $10.7M (computed). Facts: plans
// docs/phase-5-facts.md.
export const costaRica: Project = {
  slug: "costa-rica-world-bank-loan",
  name: "Costa Rica's highway loan",
  chapter: "analytics",
  industries: ["Government", "Finance"],
  oneLine: "A $10.7 million road loan: half the road built, most of the money paid back",
  description:
    "SQL on 1.4 million World Bank records: Costa Rica's $10.7M highway loan built 322 of 640 km, yet $9.15M was repaid, or $28,409 per km built.",
  number: { value: "$28,409", label: "repaid per kilometer actually built" },
  problem:
    "Development loans are judged by the money lent; an audit of what was delivered is rare. A country can repay in full for roads that were never built.",
  built:
    "An SQL analysis of the World Bank's 1.4 million credit records that follows the spending of one loan from start to end: amount, money used, money repaid; then two World Bank reports for what was promised and what was built.",
  why: "SQL for the money trail in the official data, and the original project reports for the kilometers the data doesn't hold.",
  result:
    "The whole $10.7 million was spent, only 322 of the promised 640 km were built, and $9,148,225 was repaid over five decades: $28,409 for every kilometer that exists.",
  tech: ["SQL"],
  // Brand card (P5.6): promised vs built, on one scale.
  picture: {
    kind: "gap",
    title: "Half the road, 85% of the loan repaid",
    unit: "km",
    planned: { label: "Promised", value: 640 },
    actual: { label: "Built", value: 322 },
    note: "$9.15 million repaid on a $10.7 million loan",
    caption: "World Bank credit records + project reports",
  },
  links: [],
  source: { label: "World Bank IDA credits (Finances One)", url: "https://financesone.worldbank.org/ida-statement-of-credits-grants-and-guarantees-historical-data/DS00976" },
  searches: ["world bank loans", "development finance analysis", "government spending audit"],
};
