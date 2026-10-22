// /about numbers (Phase 6): "37 systems in 15+ industries" is counted from
// the project data, never typed, so it can't go stale. about-counts.ts has no
// imports, so Node runs it directly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { countIndustries, roundedDown } from "../../src/lib/about-counts.ts";

test("countIndustries: distinct real industries, generic labels left out", () => {
  const lists = [["Health", "Finance"], ["Finance", "Any business"], ["Data quality", "Sports"]];
  assert.equal(countIndustries(lists, ["Any business", "Data quality"]), 3);
});

test("roundedDown: a floor to the step + '+', so the claim stays true", () => {
  assert.equal(roundedDown(17, 5), "15+");
  assert.equal(roundedDown(15, 5), "15+");
  assert.equal(roundedDown(14, 5), "10+");
});
