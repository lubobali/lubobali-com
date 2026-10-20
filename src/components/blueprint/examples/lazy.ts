import type { Blueprint } from "../types";
import type { ExampleKey } from "./meta";

// One example's data, loaded on click (its own small JS file, cached).
// Keeps the home page as light as before the examples existed.
export const LOAD_EXAMPLE: Record<ExampleKey, () => Promise<Blueprint>> = {
  trucking: () => import("./trucking").then((m) => m.TRUCKING),
  payments: () => import("./payments").then((m) => m.PAYMENTS),
  clinic: () => import("./clinic").then((m) => m.CLINIC),
  accounting: () => import("./accounting").then((m) => m.ACCOUNTING),
  construction: () => import("./construction").then((m) => m.CONSTRUCTION),
  law: () => import("./law").then((m) => m.LAW),
};
