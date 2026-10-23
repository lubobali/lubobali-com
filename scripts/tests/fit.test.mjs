// "Does Lubo fit your project?" (Phase 6, P6.6). Real job posts
// (fixtures/fit-jobs.mjs): what each must find was written by
// hand before the matcher. The rules that protect Lubo are tested on all of
// them: a ✓ always has real proof, a miss is never "not qualified".
import "../lib/ts-paths.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOLDOUT, JOBS, QUESTIONS } from "./fixtures/fit-jobs.mjs";

const repo = new URL("../../", import.meta.url).pathname;
const { FIT_TERMS } = await import("../../src/lib/fit/terms.ts");
const { matchFit, proveTerm } = await import("../../src/lib/fit/match.ts");
const { fitSources } = await import("../../src/lib/fit/index.ts");
const { fitCopy } = await import("../../src/lib/fit/copy.ts");

const run = (text) => matchFit(text, FIT_TERMS, fitSources);
const ids = (r, status) => r.needs.filter((n) => n.status === status).map((n) => n.id).sort();

for (const c of [...JOBS, ...HOLDOUT, ...QUESTIONS]) {
  test(`finds what ${c.id} asks for`, () => {
    const r = run(c.text);
    assert.deepEqual({ yes: ids(r, "yes"), new: ids(r, "new") }, { yes: [...c.yes].sort(), new: [...c.new].sort() });
    if (c.topics) assert.deepEqual(r.topics, c.topics);
  });
}

test("every ✓ links to real work, every miss has no ✓ wording", () => {
  for (const c of [...JOBS, ...HOLDOUT, ...QUESTIONS]) {
    for (const n of run(c.text).needs) {
      if (n.status === "yes") assert.ok(n.proof.length > 0 && n.proof.every((p) => p.href.startsWith("/")), n.id);
      else assert.deepEqual(n.proof, [], n.id);
    }
  }
});

test("dictionary: unique ids, every proof key resolves, every closest is a real proven term", () => {
  const seen = new Set();
  const byId = new Map(FIT_TERMS.map((t) => [t.id, t]));
  for (const t of FIT_TERMS) {
    assert.ok(!seen.has(t.id), `duplicate id ${t.id}`);
    seen.add(t.id);
    for (const k of t.proof) assert.ok(proveTerm({ ...t, proof: [k] }, fitSources).length > 0, `${t.id}: ${k} proves nothing`);
    for (const c of t.closest ?? []) {
      assert.ok(byId.has(c), `${t.id}: closest ${c} unknown`);
      assert.ok(proveTerm(byId.get(c), fitSources).length > 0, `${t.id}: closest ${c} has no proof`);
    }
    if (!t.proof.length) assert.ok(t.closest?.length, `${t.id}: no proof and no closest`);
  }
});

test("everyday words are not skills: benefits, 'go live', R&D", () => {
  const r = run(
    "We go live in March and the go-to-market team will go ahead. R&D budget is set. Our support agents and real estate agents love it. " +
      "We offer medical, dental and vision insurance, health and safety training, stock options and a 401(k).",
  );
  assert.deepEqual(r.needs.map((n) => n.id), []);
});

test("needs come back in the order the post names them", () => {
  assert.deepEqual(run("Data pipelines in Python and Airflow on AWS Lambda, then Snowflake.").needs.map((n) => n.id), ["pipelines", "python", "airflow", "aws", "lambda", "snowflake"]);
});

test("every word a visitor can read is positive (Lubo: never 'I can't')", () => {
  const NEGATIVE = /\b(can'?t|cannot|not qualified|no experience|lack|unable|never used|not yet|don'?t have|missing)\b/i;
  const words = [
    ...Object.values(fitCopy).filter((v) => typeof v === "string"),
    ...[[0, 0], [0, 1], [0, 3], [1, 1], [1, 2], [7, 9], [8, 9]].map(([f, t]) => fitCopy.summary(f, t)),
    fitCopy.breadth(37, "15+"),
    fitCopy.askHow("Azure"),
    fitCopy.topics.rate,
    fitCopy.topics.location,
    ...FIT_TERMS.map((t) => t.label),
  ];
  for (const w of words) assert.doesNotMatch(w, NEGATIVE, w);
  assert.equal(fitCopy.summary(7, 9), "7 of 9 needs already proven in real projects. The other 2 are new tools for the same work, and I learn fast.");
  assert.equal(fitCopy.summary(8, 9), "8 of 9 needs already proven in real projects. The other one is a new tool for the same work, and I learn fast.");
});

test("a long paste is cut, never slow", () => {
  const big = JOBS.map((j) => j.text).join(" ").repeat(40); // ~60 KB
  const t0 = performance.now();
  run(big);
  assert.ok(performance.now() - t0 < 200, "over 200 ms");
});

test("nothing is sent anywhere: the matcher has no network calls", () => {
  for (const f of ["src/lib/fit/match.ts", "src/lib/fit/terms.ts"]) {
    assert.doesNotMatch(readFileSync(`${repo}${f}`, "utf8"), /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket\(/);
  }
});
