// Header "Free AI blueprint" button (Lubo 2026-10-23): it always lands on
// the tool. blueprint-href.ts has no imports, so Node runs it directly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { blueprintHref } from "../../src/lib/blueprint-href.ts";

test("pages with the tool scroll to it in place", () => {
  assert.equal(blueprintHref("/"), "#blueprint");
  assert.equal(blueprintHref("/blueprint"), "#blueprint");
});

test("every other page goes to the home Blueprint card", () => {
  for (const p of ["/about", "/projects", "/projects/mergeai", "/work/lubot", "/resume"]) {
    assert.equal(blueprintHref(p), "/#blueprint");
  }
});
