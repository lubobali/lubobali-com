// /building page helpers (Phase 7, P7.7): pure, so the page shows the same
// words and squares for the same data. Chicago time everywhere (Lubo's day).
import { test } from "node:test";
import assert from "node:assert/strict";
import { heatLevels, heatWeeks, isActive, shippedLabel, updatedLabel } from "../../src/lib/building/format.ts";

test("updated label is Chicago time, CDT and CST", () => {
  assert.equal(updatedLabel("2026-10-24T10:00:00Z"), "Updated Oct 24, 5:00 AM CT");
  assert.equal(updatedLabel("2026-12-01T11:00:00Z"), "Updated Dec 1, 5:00 AM CT");
});

test("shipped label: today, yesterday, then the date", () => {
  const at = "2026-10-24T10:00:00Z"; // Oct 24 in Chicago
  assert.equal(shippedLabel("2026-10-24", at), "Shipped today");
  assert.equal(shippedLabel("2026-10-23", at), "Shipped yesterday");
  assert.equal(shippedLabel("2026-10-20", at), "Last shipped Oct 20");
});

test("shipped label uses the Chicago day, not the UTC day", () => {
  // 03:00 UTC on Oct 25 is still Oct 24 in Chicago.
  assert.equal(shippedLabel("2026-10-24", "2026-10-25T03:00:00Z"), "Shipped today");
});

test("the live dot pulses only if the last ship was within 2 days", () => {
  const at = "2026-10-24T10:00:00Z";
  assert.equal(isActive("2026-10-24", at), true);
  assert.equal(isActive("2026-10-22", at), true);
  assert.equal(isActive("2026-10-21", at), false);
});

test("year map: Monday-first weeks, padded, every real day once", () => {
  // 2026-03-01 is a Sunday: the first column has 6 empty cells, then Mar 1.
  const days = Array.from({ length: 10 }, (_, i) => i + 1);
  const { weeks, months } = heatWeeks("2026-03-01", days);
  assert.equal(weeks[0].length, 7);
  assert.deepEqual(weeks[0].slice(0, 6), [null, null, null, null, null, null]);
  assert.deepEqual(weeks[0][6], { date: "2026-03-01", count: 1 });
  assert.deepEqual(weeks[1][0], { date: "2026-03-02", count: 2 });
  assert.equal(weeks.flat().filter(Boolean).length, 10);
  assert.equal(weeks.at(-1).length, 7); // the last week is padded too
  assert.deepEqual(months[0], { week: 0, label: "Mar" });
});

test("year map: a month label sits on the week its first day falls in", () => {
  const days = Array(61).fill(1); // Mar 1 .. Apr 30
  const { months } = heatWeeks("2026-03-01", days);
  assert.deepEqual(months.map((m) => m.label), ["Mar", "Apr"]);
  assert.equal(months[1].week, 5); // Apr 1 2026 is a Wednesday, in the 6th column
});

test("heat levels: 0 stays empty, the rest in 4 even steps of the busy days", () => {
  const levels = heatLevels([0, 1, 2, 3, 4, 5, 6, 7, 8, 0]);
  assert.equal(levels(0), 0);
  assert.equal(levels(1), 1);
  assert.equal(levels(8), 4);
  for (let n = 1; n < 8; n++) assert.ok(levels(n) <= levels(n + 1));
});

test("heat levels: one very busy day doesn't wash out the rest", () => {
  const levels = heatLevels([1, 2, 2, 3, 3, 4, 200]);
  assert.equal(levels(200), 4);
  assert.ok(levels(4) >= 3, "a normal busy day still looks busy");
});

test("live summary: one line + dot state for Explore, footer and home", async () => {
  const { liveSummary } = await import("../../src/lib/building/format.ts");
  const data = { lastShipped: "2026-10-24", generatedAt: "2026-10-24T10:00:00Z", tests: { total: 18957 } };
  assert.deepEqual(liveSummary(data), { active: true, line: "Shipped today · 18,957 tests" });
  const quiet = { ...data, lastShipped: "2026-10-10" };
  assert.deepEqual(liveSummary(quiet), { active: false, line: "Last shipped Oct 10 · 18,957 tests" });
});
