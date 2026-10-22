import type { Project } from "./model";

// Framer page "DoorDash" (archived 2026-10-22). CORRECTION: its data link is
// the public iFood marketing dataset, not DoorDash data: named honestly.
// "Smaller households spend more" not used (group totals of unequal size).
// Facts: plans docs/phase-5-facts.md.
export const foodDelivery: Project = {
  slug: "food-delivery-customers",
  name: "Food delivery customers: who buys where",
  chapter: "analytics",
  industries: ["Food", "Retail"],
  oneLine: "Which channels customers really use, and which ones overlap, from 2,022 delivery customers",
  description:
    "Excel analysis of 2,022 food delivery customers: in-store purchases still beat web and catalog, and which channels share the same buyers.",
  number: { value: "23,474", label: "in-store purchases, vs 16,634 on the web" },
  problem:
    "Delivery companies push digital channels, but don't always know where customers really buy, or which channels reach the same people.",
  built:
    "An Excel analysis of public customer data (2,022 customers, 41 columns), a customer segmentation by channel: purchases (store, web, catalog), how the channels relate to each other, and how household makeup shapes spending.",
  why: "Excel with pivot tables and charts, the tool a marketing team already has, so they can rerun it themselves.",
  result:
    "In-store purchases led with 23,474, ahead of web (16,634) and catalog (10,690). Catalog and store buyers overlap most (R² 0.32), web and catalog least (0.17): bundle the first pair, run separate plays for the web.",
  tech: ["Excel", "Pivot tables"],
  // Brand card (P5.6): purchases by channel.
  picture: {
    kind: "chart",
    title: "In-store still beats the web",
    unit: "",
    bars: [
      { label: "Store", value: 23474 },
      { label: "Web", value: 16634 },
      { label: "Catalog", value: 10690 },
    ],
    caption: "Purchases by channel, 2,022 customers",
  },
  links: [],
  source: { label: "iFood marketing dataset (GitHub)", url: "https://github.com/nailson/ifood-data-business-analyst-test" },
  searches: ["customer segmentation", "purchase channels", "food delivery data"],
};
