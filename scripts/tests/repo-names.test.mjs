// repo-names.mjs (Phase 7, P7.4): the projects on this site are the list of
// public work Lubo approved. The daily /building job reads this map to name
// a GitHub repo; a repo that isn't on the site stays unnamed (counted only).
import "../lib/ts-paths.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const { projects } = await import("../../src/lib/projects/index.ts");
const script = new URL("../repo-names.mjs", import.meta.url).pathname;
const out = JSON.parse(execFileSync("node", [script], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));

const repoOf = (p) => p.links.find((l) => l.kind === "github")?.url.match(/github\.com\/lubobali\/([^/#?]+)/)?.[1];

test("every project with a GitHub link is in the map, keyed by lower-case repo name", () => {
  const withRepo = projects.filter(repoOf);
  assert.ok(withRepo.length >= 20, `only ${withRepo.length}`);
  for (const p of withRepo) {
    const entry = out[repoOf(p).toLowerCase()];
    assert.ok(entry, p.name);
    assert.deepEqual(entry, { name: p.name, what: p.oneLine, slug: p.slug });
  }
});

test("nothing else is in the map", () => {
  assert.equal(Object.keys(out).length, new Set(projects.map(repoOf).filter(Boolean).map((r) => r.toLowerCase())).size);
});

test("fits the /building card (schema: name 40, what 120)", () => {
  for (const [repo, e] of Object.entries(out)) {
    assert.ok(e.name.length <= 40, `${repo} name`);
    assert.ok(e.what.length <= 120, `${repo} what`);
  }
});
