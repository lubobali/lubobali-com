import type { Blueprint } from "../types";
import { ACCOUNTING } from "./accounting";
import { CLINIC } from "./clinic";
import { CONSTRUCTION } from "./construction";
import { LAW } from "./law";
import { EXAMPLE_META, type ExampleKey } from "./meta";
import { PAYMENTS } from "./payments";
import { TRUCKING } from "./trucking";

// All 6 examples with their data, for server-rendered pages (/blueprint:
// every card in the HTML for search + AI assistants). The home page uses
// meta.ts + lazy.ts instead (loads one on click).
const DATA: Record<ExampleKey, Blueprint> = {
  trucking: TRUCKING,
  payments: PAYMENTS,
  clinic: CLINIC,
  accounting: ACCOUNTING,
  construction: CONSTRUCTION,
  law: LAW,
};

export type Example = { key: ExampleKey; label: string; icon: string; bp: Blueprint };

export const EXAMPLES: readonly Example[] = EXAMPLE_META.map((m) => ({ ...m, bp: DATA[m.key] }));
