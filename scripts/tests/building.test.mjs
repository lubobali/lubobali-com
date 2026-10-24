// /building data contract (Phase 7, P7.1). The daily job writes live.json;
// the site checks it against the same schema before building the page, so
// a broken or half-written file can never reach visitors.
import "../lib/ts-paths.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dir = new URL("../../src/lib/building/", import.meta.url);
const schema = JSON.parse(readFileSync(new URL("live.schema.json", dir), "utf8"));
const sample = JSON.parse(readFileSync(new URL("live.sample.json", dir), "utf8"));
const { checkLive } = await import("../../src/lib/building/live.ts");

const edit = (path, value) => {
  const data = structuredClone(sample);
  const last = path.at(-1);
  const node = path.slice(0, -1).reduce((n, k) => n[k], data);
  if (value === undefined) delete node[last];
  else node[last] = value;
  return data;
};

test("the sample fits the schema, and says it is a sample", () => {
  assert.deepEqual(checkLive(schema, sample), []);
  assert.equal(sample.sample, true);
});

test("uptime may be missing (no real source = no block)", () => {
  assert.deepEqual(checkLive(schema, edit(["uptime"], null)), []);
});

for (const [path, value] of [
  [["version"], 2],
  [["lastShipped"], "yesterday"],
  [["year", "total"], -1],
  [["year", "total"], 1.5],
  [["year"], undefined],
  [["tests", "allGreen"], "yes"],
  [["building"], [...sample.building, ...sample.building]],
  [["milestones"], Array(7).fill(sample.milestones[0])],
  [["ci", "last60"], ["ok", "maybe"]],
  [["uptime", "pct"], 101],
  [["building", 0, "what"], "x".repeat(121)],
  [["extra"], "not allowed"],
]) {
  test(`rejects ${path.join(".")} = ${JSON.stringify(value)?.slice(0, 30)}`, () => {
    assert.notDeepEqual(checkLive(schema, edit(path, value)), []);
  });
}

test("every required field is really required", () => {
  const walk = (node, path) => {
    const s = node.$ref ? schema.$defs[node.$ref.split("/").at(-1)] : node;
    for (const key of s.required ?? []) {
      assert.notDeepEqual(checkLive(schema, edit([...path, key], undefined)), [], `${[...path, key].join(".")}`);
      if (s.properties[key].type === "object") walk(s.properties[key], [...path, key]);
    }
  };
  walk(schema, []);
});

test("errors name the field, so the job's alert says what broke", () => {
  const errors = checkLive(schema, edit(["ci", "runs"], "many"));
  assert.ok(errors.some((e) => e.startsWith("ci.runs")), errors.join("\n"));
});

// --- loadLive(): the page's only way in ----------------------------------------
const { loadLive } = await import("../../src/lib/building/load.ts");
const { mkdtempSync, writeFileSync } = await import("node:fs");
const { tmpdir } = await import("node:os");
const { join } = await import("node:path");

test("loadLive reads the job's file when LIVE_DATA_FILE names it", () => {
  const dir = mkdtempSync(join(tmpdir(), "live-"));
  const file = join(dir, "live.json");
  writeFileSync(file, JSON.stringify({ ...sample, sample: false }));
  assert.equal(loadLive(file).sample, false);
});

test("loadLive falls back to the sample (marked sample) when no file is set", () => {
  const saved = process.env.LIVE_DATA_FILE; // CI sets it for real builds
  delete process.env.LIVE_DATA_FILE;
  try {
    assert.equal(loadLive().sample, true);
  } finally {
    if (saved !== undefined) process.env.LIVE_DATA_FILE = saved;
  }
});

test("a broken data file fails the build, naming the field", () => {
  const dir = mkdtempSync(join(tmpdir(), "live-"));
  const file = join(dir, "live.json");
  writeFileSync(file, JSON.stringify({ ...sample, tests: { ...sample.tests, total: -1 } }));
  assert.throws(() => loadLive(file), /tests\.total/);
});

test("a missing data file fails the build (never a silent sample)", () => {
  assert.throws(() => loadLive("/nope/live.json"), /live\.json/);
});
