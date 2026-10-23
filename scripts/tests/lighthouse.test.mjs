// node --test scripts/tests/lighthouse.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUDGETS, checkBudgets, gatePage, isFlake, median, medianSummary, pictureKind, samplePages, summarize, confirmRuns } from "../lib/lighthouse.mjs";

// Smallest Lighthouse JSON shape that summarize() reads.
const report = ({ perf = 0.95, a11y = 1, bp = 1, seo = 1, lcp = 1800, cls = 0, tbt = 200, requests = 12 } = {}) => ({
  categories: {
    performance: { score: perf },
    accessibility: { score: a11y },
    "best-practices": { score: bp },
    seo: { score: seo },
  },
  audits: {
    "largest-contentful-paint": { numericValue: lcp },
    "cumulative-layout-shift": { numericValue: cls },
    "total-blocking-time": { numericValue: tbt },
    "network-requests": { details: { items: Array.from({ length: requests }, () => ({})) } },
  },
});

test("summarize reads scores, metrics and request count", () => {
  assert.deepEqual(summarize(report()), {
    performance: 0.95, accessibility: 1, bestPractices: 1, seo: 1,
    lcpMs: 1800, cls: 0, tbtMs: 200, requests: 12,
  });
});

test("summarize throws on a failed run (no scores)", () => {
  const broken = report();
  broken.categories.performance.score = null;
  assert.throws(() => summarize(broken), /no score/);
});

test("median: odd, even, single", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(median([7]), 7);
});

test("medianSummary takes the median of each field separately", () => {
  const runs = [{ tbtMs: 700, lcpMs: 1700 }, { tbtMs: 300, lcpMs: 2300 }, { tbtMs: 400, lcpMs: 1800 }];
  assert.deepEqual(medianSummary(runs), { tbtMs: 400, lcpMs: 1800 });
});

test("checkBudgets: a good page passes, slow score is only a warning", () => {
  const good = summarize(report({ perf: 0.85 }));
  const { fails, warns } = checkBudgets(good);
  assert.deepEqual(fails, []);
  assert.equal(warns.length, 1);
  assert.match(warns[0], /performance 0.85 < 0.9/);
});

test("checkBudgets: each hard budget fails on its own", () => {
  const bad = {
    lcp: { lcp: BUDGETS.lcpMs + 1 },
    cls: { cls: 0.06 },
    tbt: { tbt: BUDGETS.tbtMs + 1 },
    requests: { requests: BUDGETS.requests + 1 },
    a11y: { a11y: 0.94 },
    bp: { bp: 0.94 },
    seo: { seo: 0.99 },
  };
  for (const [name, override] of Object.entries(bad)) {
    const { fails } = checkBudgets(summarize(report(override)));
    assert.equal(fails.length, 1, `${name}: ${fails}`);
  }
});

test("checkBudgets: exactly at the limit passes", () => {
  const edge = summarize(report({ lcp: BUDGETS.lcpMs, cls: BUDGETS.cls, tbt: BUDGETS.tbtMs, requests: BUDGETS.requests }));
  assert.deepEqual(checkBudgets(edge).fails, []);
});

test("gatePage: indexable pages fail hard on a broken budget", () => {
  const slow = summarize(report({ lcp: BUDGETS.lcpMs + 500 }));
  const { fails, warns } = gatePage(slow, { indexable: true });
  assert.equal(fails.length, 1);
  assert.equal(warns.length, 0);
});

test("gatePage: noindex pages only warn (internal, e.g. /styleguide)", () => {
  const slow = summarize(report({ lcp: BUDGETS.lcpMs + 500, perf: 0.8 }));
  const { fails, warns } = gatePage(slow, { indexable: false });
  assert.deepEqual(fails, []);
  assert.equal(warns.length, 2);
  assert.ok(warns.every((w) => /noindex/.test(w)), warns.join("\n"));
});

// Lighthouse sometimes fails to record its own trace (NO_NAVSTART, seen in CI
// 2026-10-21): retry that run. Anything else is a real failure.
test("isFlake: Lighthouse runtime errors are retryable", () => {
  const err = (stderr) => Object.assign(new Error("Command failed"), { stderr });
  assert.equal(isFlake(err("Runtime error encountered: Something went wrong with recording the trace over your page load. Please run Lighthouse again. (NO_NAVSTART)\n")), true);
  assert.equal(isFlake(err("Runtime error encountered: Chrome prevented page load (PROTOCOL_TIMEOUT)\n")), true);
});

test("isFlake: other errors are real failures", () => {
  assert.equal(isFlake(Object.assign(new Error("Command failed"), { stderr: "ENOENT: no such file" })), false);
  assert.equal(isFlake(new Error("boom")), false);
  assert.equal(isFlake(undefined), false);
});

test("samplePages: template pages keep the heaviest of each picture kind, others all kept", () => {
  const pages = [
    { path: "/", bytes: 90 },
    { path: "/projects", bytes: 70 },
    { path: "/projects/a", bytes: 10, kind: "chart" },
    { path: "/projects/b", bytes: 40, kind: "chart" },
    { path: "/projects/c", bytes: 30, kind: "flow" },
    { path: "/projects/d", bytes: 20, kind: "screen" },
    { path: "/projects/e", bytes: 5, kind: "screen" },
    { path: "/work/lubot", bytes: 50 },
  ];
  assert.deepEqual(
    samplePages(pages).map((p) => p.path),
    ["/", "/projects", "/projects/b", "/projects/c", "/projects/d", "/work/lubot"],
  );
  assert.deepEqual(samplePages(pages.slice(0, 2)), pages.slice(0, 2)); // nothing to sample
});

test("pictureKind reads the picture type from a built page", () => {
  // Brand cards (P5.6) cost the same whatever chart is inside (fonts +
  // drawn art); a big real screen below adds an image.
  assert.equal(pictureKind('<figure data-world="ai" class="bc">'), "brand");
  assert.equal(pictureKind('<figure data-world="ai" class="bc"></figure><figure class="cs-screen flex">'), "brand+screen");
  assert.equal(pictureKind('<figure class="cs-screen flex">'), "screen");
  assert.equal(pictureKind("<main>"), undefined);
});

test("confirmRuns: a page that fails on 3 runs gets 2 more, judged on the median of 5", () => {
  assert.equal(confirmRuns(3, 1), 2); // failed: confirm with 5 runs in total
  assert.equal(confirmRuns(3, 0), 0); // passed: done
  assert.equal(confirmRuns(5, 1), 0); // already confirmed: a real failure
});
