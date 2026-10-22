// The /projects shelf logic (Phase 5 P5.4): filters, live counts and the
// shareable URL. shelf.ts has no imports, so Node runs it directly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { countOptions, matchesFilters, readShelfUrl, shelfUrl, topOptions } from "../../src/lib/projects/shelf.ts";

const items = [
  { id: "a", industries: ["Health"], tech: ["SQL", "Python"] },
  { id: "b", industries: ["Health", "Finance"], tech: ["SQL"] },
  { id: "c", industries: ["Finance"], tech: ["Spark"] },
  { id: "d", industries: ["Jobs"], tech: ["Python", "Spark"] },
];
const none = { industry: [], tech: [] };
const ids = (list) => list.map((i) => i.id);

test("no filters = everything", () => {
  assert.deepEqual(ids(items.filter((i) => matchesFilters(i, none))), ["a", "b", "c", "d"]);
});

test("inside one filter = OR, between filters = AND", () => {
  const or = { industry: ["Health", "Jobs"], tech: [] };
  assert.deepEqual(ids(items.filter((i) => matchesFilters(i, or))), ["a", "b", "d"]);
  const and = { industry: ["Health"], tech: ["Python"] };
  assert.deepEqual(ids(items.filter((i) => matchesFilters(i, and))), ["a"]);
});

test("counts: each option counts what the OTHER filter allows, so picking more in one filter never zeroes it", () => {
  const f = { industry: ["Health"], tech: [] };
  // Industry ignores its own picks: Health 2, Finance 2, Jobs 1.
  assert.deepEqual(Object.fromEntries(countOptions(items, f, "industry")), { Health: 2, Finance: 2, Jobs: 1 });
  // Tech counts inside Health only: SQL 2, Python 1, Spark 0.
  assert.deepEqual(Object.fromEntries(countOptions(items, f, "tech")), { SQL: 2, Python: 1, Spark: 0 });
});

test("counts respect the search: only items search found are counted", () => {
  const found = new Set(["c", "d"]);
  assert.deepEqual(Object.fromEntries(countOptions(items, none, "tech", found)), { SQL: 0, Python: 1, Spark: 2 });
});

test("topOptions: most used first, then A to Z, cut to n", () => {
  assert.deepEqual(topOptions(items, "tech", 2), ["Python", "Spark"]);
  assert.deepEqual(topOptions(items, "industry", 9), ["Finance", "Health", "Jobs"]);
});

const allowed = { industry: ["Health", "Finance", "Jobs"], tech: ["SQL", "Python", "Spark"] };

test("URL round trip: filters + search survive a shared link", () => {
  const state = { filters: { industry: ["Health", "Finance"], tech: ["SQL"] }, q: "patients coming back" };
  const url = shelfUrl(state);
  assert.equal(url, "?q=patients+coming+back&industry=Health&industry=Finance&tech=SQL");
  assert.deepEqual(readShelfUrl(url, allowed), state);
  assert.equal(shelfUrl({ filters: none, q: "  " }), "");
});

test("URL: unknown values are dropped, case is fixed, no duplicates, search capped at 100", () => {
  const url = "?industry=health&industry=Health&industry=<script>&tech=sql&tech=Excel&q=" + "x".repeat(300);
  const { filters, q } = readShelfUrl(url, allowed);
  assert.deepEqual(filters, { industry: ["Health"], tech: ["SQL"] });
  assert.equal(q.length, 100);
  assert.deepEqual(readShelfUrl("", allowed), { filters: none, q: "" });
});
