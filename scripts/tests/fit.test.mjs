// "Does Lubo fit your project?" (Phase 6, P6.6). Real job posts
// (fixtures/fit-jobs.mjs): what each must find was written by
// hand before the matcher. The rules that protect Lubo are tested on all of
// them: a ✓ always has real proof, a miss is never "not qualified".
import "../lib/ts-paths.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOLDOUT, JOBS, NOT_TECH, QUESTIONS, REVIEW_TECH, TYPOS } from "./fixtures/fit-jobs.mjs";

const repo = new URL("../../", import.meta.url).pathname;
const { FIT_TERMS } = await import("../../src/lib/fit/terms.ts");
const { matchFit, proveTerm } = await import("../../src/lib/fit/match.ts");
const { fitSources } = await import("../../src/lib/fit/index.ts");
const { fitCopy } = await import("../../src/lib/fit/copy.ts");

const run = (text) => matchFit(text, FIT_TERMS, fitSources);
const ids = (r, status) => r.needs.filter((n) => n.status === status).map((n) => n.id).sort();

for (const c of [...JOBS, ...HOLDOUT, ...QUESTIONS, ...NOT_TECH, ...REVIEW_TECH, ...TYPOS]) {
  test(`finds what ${c.id} asks for`, () => {
    const r = run(c.text);
    assert.deepEqual({ yes: ids(r, "yes"), new: ids(r, "new") }, { yes: [...c.yes].sort(), new: [...c.new].sort() });
    if (c.topics) assert.deepEqual(r.topics, c.topics);
  });
}

test("every ✓ links to real work, every miss has no ✓ wording", () => {
  for (const c of [...JOBS, ...HOLDOUT, ...QUESTIONS, ...NOT_TECH, ...REVIEW_TECH]) {
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
  const kinds = ["tool", "industry", "adjacent", "talk"];
  const words = [
    ...["title", "placeholder", "button", "privacy", "limits", "proven"].map((k) => fitCopy[k]),
    ...kinds.flatMap((k) => [fitCopy.miss[k], fitCopy.closest[k], fitCopy.ask(k, "Azure")]),
    ...[[0, 0], [0, 1], [0, 3], [1, 1], [1, 2], [7, 9], [8, 9]].flatMap(([f, t]) =>
      kinds.map((k) => fitCopy.summary(f, t, [{ name: "Azure", miss: k }, { name: "Go", miss: "tool" }])),
    ),
    fitCopy.summary(0, 0, [], 2),
    fitCopy.breadth(37, "15+"),
    fitCopy.topics.rate,
    fitCopy.topics.location,
    ...FIT_TERMS.map((t) => t.label),
  ];
  for (const w of words) assert.doesNotMatch(w, NEGATIVE, w);
  const tools = [{ name: "Kubernetes", miss: "tool" }, { name: "Azure", miss: "tool" }];
  assert.equal(fitCopy.summary(8, 10, tools), "8 of 10 needs already proven in real projects. Kubernetes and Azure: different tools for work I already deliver.");
  assert.equal(fitCopy.summary(0, 1, [tools[1]]), "Azure: a different tool for work I already deliver.");
  // Not a tool: never "a different tool" (review: "Insurance: a different tool").
  assert.equal(fitCopy.summary(1, 2, [{ name: "Insurance", miss: "industry" }]), "1 of 2 needs already proven in real projects. For Insurance, see my closest work below.");
  assert.equal(fitCopy.ask("talk", "Public Trust"), "Let's talk about Public Trust");
  assert.equal(fitCopy.summary(0, 0, [], 1), "Good questions for our call.");
});

test("needs come back in the order the post names them", () => {
  assert.deepEqual(run("Data pipelines in Python and Airflow on AWS Lambda, then Snowflake.").needs.map((n) => n.id), ["pipelines", "python", "airflow", "aws", "lambda", "snowflake"]);
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

test("short questions: a tool name alone counts ('Spark?'), a long text needs context", () => {
  for (const [q, id] of [["Spark?", "spark"], ["React", "react"], ["Do you know Go?", "go"], ["Flask?", "flask"], ["Excel", "excel"]]) {
    assert.ok(run(q).needs.some((n) => n.id === id && n.status !== undefined), q);
  }
  assert.deepEqual(run("You will spark new ideas, react to feedback and go the extra mile every single day.").needs, []);
});

test("every skill bar link opens with its own skill proven", () => {
  for (const t of FIT_TERMS.filter((x) => ["ai", "data", "cloud", "app", "analytics"].includes(x.kind))) {
    const q = t.short?.[0] ?? t.aliases[0];
    if (!q) continue;
    assert.ok(run(q).needs.some((n) => n.id === t.id), `${t.id}: "${q}" doesn't find itself`);
  }
});
