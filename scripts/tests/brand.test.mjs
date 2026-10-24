// Brand image templates (scripts/brand/*.html): every file they load must
// exist. A missing font doesn't error, Chrome quietly draws a default font
// (2026-10-24: og.html and icon.html still pointed at a font renamed in
// Phase 3 H12, so a re-render came out in the wrong font).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

const brand = new URL("../brand/", import.meta.url).pathname;
const templates = readdirSync(brand).filter((f) => f.endsWith(".html"));

test("brand templates exist", () => {
  for (const f of ["og.html", "icon.html", "share.html", "resume.html"]) assert.ok(templates.includes(f), f);
});

for (const f of templates) {
  test(`${f}: every font and image it loads exists`, () => {
    const html = readFileSync(join(brand, f), "utf8");
    const refs = [...html.matchAll(/(?:url\("|src=")([^"]+)"/g)].map((m) => m[1]).filter((r) => !/^(data:|https?:|#)/.test(r));
    const missing = refs.filter((r) => !existsSync(join(dirname(join(brand, f)), r)));
    assert.deepEqual(missing, []);
  });
}
