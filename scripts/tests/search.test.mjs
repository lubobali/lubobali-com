// Site search engine (Phase 5 P5.2). The engine is pure TypeScript with no
// imports, so Node 22 runs it directly (type stripping), no test library.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSearch, normalize, searchKey } from "../../src/lib/search/engine.ts";
import { synonyms as realSynonyms } from "../../src/lib/search/synonyms.ts";

const docs = [
  {
    id: "diabetes",
    title: "Diabetes readmissions",
    keywords: ["Health", "SQL", "readmissions"],
    text: "100K patients, which care changes bring people back to hospital",
  },
  {
    id: "graphguard",
    title: "GraphGuard-AI",
    keywords: ["Finance", "money laundering", "Python", "XGBoost"],
    text: "catching money laundering by the shape of transfers",
  },
  {
    id: "nba",
    title: "NBA scoring",
    keywords: ["Sports", "Tableau"],
    text: "which players carry each team's points",
  },
  {
    id: "attrition",
    title: "IBM HR attrition",
    keywords: ["HR", "R", "churn"],
    text: "why employees leave and what drives pay",
  },
];

const synonyms = [
  ["hospital", "health", "healthcare", "patients", "medical"],
  ["fraud", "money laundering", "aml"],
  ["customers leaving", "churn", "attrition", "people leave"],
];

const search = createSearch(docs, synonyms);
const ids = (q) => search(q).hits.map((h) => h.id);

test("normalize: lower case, accents and punctuation gone", () => {
  assert.equal(normalize("  Café-Reports, Q4!  "), "cafe reports q4");
});

test("empty query returns every doc, in order, no matches listed", () => {
  const r = search("   ");
  assert.deepEqual(r.hits.map((h) => h.id), ["diabetes", "graphguard", "nba", "attrition"]);
  assert.equal(r.close, false);
});

test("a keyword finds its project and says why", () => {
  const [hit] = search("tableau").hits;
  assert.equal(hit.id, "nba");
  assert.deepEqual(hit.matched, ["Tableau"]);
});

test("CEO words: same-meaning groups (one word and phrases)", () => {
  assert.deepEqual(ids("hospital"), ["diabetes"]);
  assert.deepEqual(ids("fraud"), ["graphguard"]);
  assert.deepEqual(ids("customers leaving"), ["attrition"]);
});

test("every typed word must match (AND)", () => {
  assert.deepEqual(ids("sql health"), ["diabetes"]);
  assert.equal(search("sql health").close, false);
  assert.equal(search("sql tableau").close, true); // no project has both
});

test("typos are forgiven on longer words, not on short ones", () => {
  assert.deepEqual(ids("tablaeu"), ["nba"]);
  assert.deepEqual(ids("readmisions"), ["diabetes"]);
  assert.deepEqual(ids("sqx"), []);
});

test("a real word is never treated as a typo of another (stock is not stack)", () => {
  const s = createSearch(
    [
      { id: "lubot", title: "LuBot", keywords: ["stock"], text: "" },
      { id: "dial", title: "Built with", keywords: ["stack"], text: "" },
    ],
    [],
  );
  assert.deepEqual(s("stock").hits.map((h) => h.id), ["lubot"]);
  assert.deepEqual(s("stakc").hits.map((h) => h.id), ["dial"]); // a real typo still works
});

test("matched words are shown as typed, never trimmed (postgres, not postgre)", () => {
  const s = createSearch([{ id: "m", title: "Move", keywords: [], text: "postgres analysis" }], []);
  assert.deepEqual(s("postgres analysis").hits[0].matched, ["postgres", "analysis"]);
});

test("plurals and prefixes while typing", () => {
  assert.deepEqual(ids("readmission"), ["diabetes"]);
  assert.deepEqual(ids("tabl"), ["nba"]);
});

test("filler words are ignored", () => {
  assert.deepEqual(ids("we need something in tableau for our team"), ["nba"]);
  // With the real same-meaning list: CEO filler must not become a must-match word.
  const real = createSearch(docs, realSynonyms);
  const r = real("looking to find similar fraud projects you built");
  assert.deepEqual(r.hits.map((h) => h.id), ["graphguard"]);
  assert.equal(r.close, false); // a real match, not the "closest" fallback
});

// Found in P5.6 (2026-10-22): once one page said "analysis", the word was
// "on the site", so typo matching stopped and the page that says "analyzed"
// fell out of "healthcare sql analysis". Word forms live in the
// same-meaning list, so they match no matter what else is on the site.
test("word forms match each other even when both are on the site (analysis = analyzed)", () => {
  const s = createSearch(
    [
      { id: "a", title: "A", keywords: [], text: "SQL over 100K visits, analyzed by month" },
      { id: "b", title: "B", keywords: [], text: "simple language analysis of emails" },
    ],
    realSynonyms,
  );
  assert.deepEqual(s("analysis").hits.map((h) => h.id).sort(), ["a", "b"]);
  assert.deepEqual(s("analyze").hits.map((h) => h.id).sort(), ["a", "b"]);
});

test("CEO verbs are filler: make my pipeline faster", () => {
  const s = createSearch([{ id: "spark", title: "Spark tuning", keywords: [], text: "a slow pipeline made 4x faster" }], realSynonyms);
  const r = s("make my pipeline faster");
  assert.deepEqual(r.hits.map((h) => h.id), ["spark"]);
  assert.equal(r.close, false);
});

test("title beats keyword beats text", () => {
  const s = createSearch(
    [
      { id: "text", title: "Alpha", keywords: [], text: "spark jobs" },
      { id: "key", title: "Beta", keywords: ["Spark"], text: "" },
      { id: "title", title: "Spark tuning", keywords: [], text: "" },
    ],
    [],
  );
  assert.deepEqual(s("spark").hits.map((h) => h.id), ["title", "key", "text"]);
});

test("no full match: closest projects come back, marked close", () => {
  const r = search("tableau hospital");
  assert.equal(r.close, true);
  assert.deepEqual(r.hits.map((h) => h.id).sort(), ["diabetes", "nba"]);
});

test("nothing at all: empty hits, not close", () => {
  const r = search("quantum blockchain");
  assert.deepEqual(r.hits, []);
  assert.equal(r.close, false);
});

test("attack strings are just words: no throw, no match", () => {
  for (const q of ["<script>alert(1)</script>", "') OR 1=1 --", "x".repeat(5000)]) {
    assert.doesNotThrow(() => search(q));
    assert.deepEqual(ids(q), []);
  }
  // Only invisible characters = nothing typed: same as an empty box.
  assert.deepEqual(search(String.fromCharCode(0, 0x202e)), search(""));
});

test("fast: 500 docs searched well under 5 ms", () => {
  const many = Array.from({ length: 500 }, (_, i) => ({
    id: `p${i}`,
    title: `Project ${i} pipeline`,
    keywords: ["Python", "SQL", "Airflow", "Health"],
    text: "data quality checks before publishing to dashboards ".repeat(4),
  }));
  const s = createSearch(many, synonyms);
  s("warm up");
  const t = performance.now();
  for (let i = 0; i < 20; i++) s("hospital airflow dashbord");
  assert.ok((performance.now() - t) / 20 < 5);
});

test("same-meaning list: each phrase in one group only, lower case", () => {
  const groups = realSynonyms;
  const seen = new Map();
  const problems = [];
  for (const [i, group] of groups.entries()) {
    for (const phrase of group) {
      const key = searchKey(phrase); // as the engine sees it: "jobs" = "job"
      if (phrase !== phrase.toLowerCase()) problems.push(`"${phrase}" must be lower case`);
      if (seen.has(key)) problems.push(`"${phrase}" (group ${i}) repeats group ${seen.get(key)}`);
      seen.set(key, i);
    }
  }
  assert.deepEqual(problems, []);
});
