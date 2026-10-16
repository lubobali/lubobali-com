// Pure helpers for scripts/lighthouse.mjs (Phase 2 P9 speed/quality gate).
//
// Budgets chosen by Lubo 2026-10-16: hard limits on Google's page-experience
// metrics + Lighthouse categories; the overall speed score is a warning only,
// because it swings about ±0.05 between runs (measured) and must not roll
// back a good deploy. Phone settings (Lighthouse default: mid-range phone,
// slow 4G, 4x CPU slowdown).
export const BUDGETS = {
  lcpMs: 2500, // Largest Contentful Paint: Google "good" <= 2.5 s
  cls: 0.05, // layout shift (Google "good" <= 0.1; we keep it tighter)
  tbtMs: 600, // Total Blocking Time (lab stand-in for INP)
  requests: 20, // nginx burst limit per IP is 20 (P8)
  accessibility: 0.95,
  bestPractices: 0.95,
  seo: 1,
};
export const WARN_PERFORMANCE = 0.9;

/** The numbers we gate on, from one Lighthouse JSON report. */
export function summarize(report) {
  const score = (id) => {
    const s = report.categories[id]?.score;
    if (typeof s !== "number") throw new Error(`Lighthouse run has no score for ${id}`);
    return s;
  };
  const value = (id) => report.audits[id].numericValue;
  return {
    performance: score("performance"),
    accessibility: score("accessibility"),
    bestPractices: score("best-practices"),
    seo: score("seo"),
    lcpMs: value("largest-contentful-paint"),
    cls: value("cumulative-layout-shift"),
    tbtMs: value("total-blocking-time"),
    requests: report.audits["network-requests"].details.items.length,
  };
}

export function median(values) {
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/** Median of each field across runs (one slow run can't fail the gate). */
export function medianSummary(runs) {
  return Object.fromEntries(Object.keys(runs[0]).map((k) => [k, median(runs.map((r) => r[k]))]));
}

/** Hard fails + warnings for one page's median summary. */
export function checkBudgets(s) {
  const fails = [];
  const over = (name, value, max, unit = "") => {
    if (value > max) fails.push(`${name} ${round(value)}${unit} > ${max}${unit}`);
  };
  const under = (name, value, min) => {
    if (value < min) fails.push(`${name} ${value} < ${min}`);
  };
  over("LCP", s.lcpMs, BUDGETS.lcpMs, " ms");
  over("CLS", s.cls, BUDGETS.cls);
  over("TBT", s.tbtMs, BUDGETS.tbtMs, " ms");
  over("requests", s.requests, BUDGETS.requests);
  under("accessibility", s.accessibility, BUDGETS.accessibility);
  under("best practices", s.bestPractices, BUDGETS.bestPractices);
  under("SEO", s.seo, BUDGETS.seo);
  const warns =
    s.performance < WARN_PERFORMANCE ? [`performance ${s.performance} < ${WARN_PERFORMANCE}`] : [];
  return { fails, warns };
}

const round = (n) => (Number.isInteger(n) ? n : Math.round(n * 1000) / 1000);

/** Budgets protect what people and Google see: indexable pages fail hard.
 * noindex pages (internal, e.g. /styleguide) are measured but only warn. */
export function gatePage(summary, { indexable }) {
  const { fails, warns } = checkBudgets(summary);
  if (indexable) return { fails, warns };
  return { fails: [], warns: [...fails, ...warns].map((w) => `${w} (noindex page, not gated)`) };
}
