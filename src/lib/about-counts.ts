// Pure counting for /about (no imports, so Node tests run it directly:
// scripts/tests/about.test.mjs). The numbers come from the project data.

/** Distinct industries across all lists, minus the generic labels. */
export function countIndustries(lists: readonly (readonly string[])[], notIndustries: readonly string[]): number {
  return new Set(lists.flat().filter((i) => !notIndustries.includes(i))).size;
}

/** 17 -> "15+" (step 5): rounded down, so "N+" is always true. */
export function roundedDown(n: number, step: number): string {
  return `${Math.floor(n / step) * step}+`;
}
