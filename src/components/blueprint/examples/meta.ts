// Names + icons of the 6 example industries (Phase 3b B6, Lubo 2026-10-20),
// chosen from 2026 research: AI spend + payback + "stuck explorer" SMBs +
// Lubo's proof. Light on purpose: the home page's chip row imports this,
// and loads one example's data only when its chip is clicked (lazy.ts).
export const EXAMPLE_META = [
  { key: "trucking", label: "Trucking", icon: "🚚" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "clinic", label: "Clinic", icon: "🏥" },
  { key: "accounting", label: "Accounting", icon: "📊" },
  { key: "construction", label: "Construction", icon: "🏗️" },
  { key: "law", label: "Law firm", icon: "⚖️" },
] as const;

export type ExampleKey = (typeof EXAMPLE_META)[number]["key"];
