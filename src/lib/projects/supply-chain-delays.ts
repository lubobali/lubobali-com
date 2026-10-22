import type { Project } from "./model";

// Framer page "Supply chain" (archived 2026-10-22), Lubo's 3 public Power BI
// dashboards (live 2026-10-22) and the public DataCo dataset. Facts: plans
// docs/phase-5-facts.md.
export const supplyChain: Project = {
  slug: "supply-chain-delays",
  name: "Supply chain delays",
  chapter: "analytics",
  industries: ["Logistics", "Retail"],
  oneLine: "Which shipping methods arrive late, and where the profit really comes from",
  description:
    "Power BI supply chain analysis of $4M in orders: late deliveries by shipping method, profit per order by category and profit by region.",
  number: { value: "37%", label: "of First Class orders arrived late" },
  problem:
    "Late deliveries lose customers, and the fastest or priciest shipping isn't always the most reliable. Without the data, nobody knows which one to trust.",
  built:
    "Power BI dashboards over $4 million of orders: late delivery rate by shipping method and product, profit per order by category, and profit by region and customer.",
  why: "Power BI, because operations teams can open it and filter it themselves, with no code.",
  result:
    "First Class arrived late 37% of the time, Standard Class only 15%. Computers earn $158 profit per order, more than twice the next category.",
  tech: ["Power BI", "DAX"],
  // Brand card (P5.6, CEO hook): 37% / 15% = 2.47 → "2.5×". One ring per
  // shipping method, the share that arrived late.
  picture: {
    kind: "rings",
    title: "First Class arrives late 2.5× more often than Standard",
    rings: [
      { label: "First Class", value: 37 },
      { label: "Second Class", value: 30 },
      { label: "Same Day", value: 18 },
      { label: "Standard Class", value: 15 },
    ],
    caption: "DataCo supply chain data",
  },
  links: [
    {
      kind: "dashboard",
      label: "Open the shipping dashboard",
      url: "https://app.powerbi.com/view?r=eyJrIjoiZGE2NDJmMzgtMjhiZC00ZDg3LWI2M2UtMGE4OTJhM2Y0MTBlIiwidCI6Ijc0YmMxMmQ0LTM2MmMtNDhiYS1iNDJiLWU4NTA0NjNlZmQzMiIsImMiOjN9",
    },
    {
      kind: "dashboard",
      label: "Profit by region and customer",
      url: "https://app.powerbi.com/view?r=eyJrIjoiMjQwMWE2NzEtODk0Yi00OGNkLWJhODUtNTA2MmUwZTAzYTc5IiwidCI6Ijc0YmMxMmQ0LTM2MmMtNDhiYS1iNDJiLWU4NTA0NjNlZmQzMiIsImMiOjN9",
    },
    {
      kind: "dashboard",
      label: "Orders vs profit",
      url: "https://app.powerbi.com/view?r=eyJrIjoiYWEzNzMyZTctNzg2NC00Mjk3LWJjMzUtMDUwZTI0YTYyYmQ5IiwidCI6Ijc0YmMxMmQ0LTM2MmMtNDhiYS1iNDJiLWU4NTA0NjNlZmQzMiIsImMiOjN9",
    },
  ],
  source: { label: "DataCo Smart Supply Chain (Mendeley Data)", url: "https://data.mendeley.com/datasets/8gx2fvg2k6/5" },
  searches: ["late deliveries", "shipping delays", "supply chain dashboard"],
};
