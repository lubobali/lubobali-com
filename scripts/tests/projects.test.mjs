// Project data checks (Phase 5 P5.3). checkProject() runs on every project
// when the site builds (a broken project fails the build); these tests pin
// what it catches. model.ts has no imports, so Node runs it directly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CHAPTERS, checkProject, INDUSTRIES, kindClashes, proofItems } from "../../src/lib/projects/model.ts";

const good = {
  slug: "diabetes-readmissions",
  name: "Diabetes readmissions",
  chapter: "analytics",
  industries: ["Health"],
  oneLine: "Why diabetic patients come back to the hospital",
  description: "SQL analysis of 101,766 hospital visits: which diabetic patients come back within 30 days, and why.",
  number: { value: "101,766", label: "hospital visits analyzed" },
  problem: "Hospitals pay for patients who come back within 30 days.",
  built: "Six SQL questions over real, anonymized records.",
  why: "SQL, because a hospital analyst can rerun it every month.",
  result: "More medications, more returns: 12.48% vs 7.48%.",
  tech: ["SQL", "MySQL"],
  picture: {
    kind: "chart",
    title: "Back within 30 days",
    unit: "%",
    bars: [
      { label: "≤ 5", value: 7.48 },
      { label: "16+", value: 12.48 },
    ],
    caption: "Share of patients readmitted within 30 days",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/x" }],
  searches: ["hospital readmissions", "patients coming back"],
};

test("a complete project passes", () => {
  assert.deepEqual(checkProject(good), []);
});

test("the fixed lists exist (a typo can't invent a filter)", () => {
  // Page order too: AI agents first (Lubo 2026-10-22: "this is hot right now").
  assert.deepEqual(Object.keys(CHAPTERS), ["ai", "pipelines", "analytics"]);
  assert.ok(INDUSTRIES.includes("Health"));
});

const broken = (patch) => checkProject({ ...good, ...patch });

test("unknown chapter or industry", () => {
  assert.match(broken({ chapter: "dashboards" }).join(), /chapter/);
  assert.match(broken({ industries: ["Helth"] }).join(), /industry "Helth"/);
  assert.match(broken({ industries: [] }).join(), /industries/);
});

test("Google description must be 50–160 characters", () => {
  assert.match(broken({ description: "Too short." }).join(), /description/);
  assert.match(broken({ description: "x".repeat(161) }).join(), /description/);
});

test("empty text fields and a missing number are caught", () => {
  for (const field of ["name", "oneLine", "problem", "built", "why", "result"]) {
    assert.match(broken({ [field]: "  " }).join(), new RegExp(field));
  }
  assert.match(broken({ number: { value: "", label: "x" } }).join(), /number/);
  assert.match(broken({ tech: [] }).join(), /tech/);
});

test("slug is lower-case-with-dashes", () => {
  assert.match(broken({ slug: "Diabetes_Readmissions" }).join(), /slug/);
});

test("2 or 3 CEO searches", () => {
  assert.match(broken({ searches: ["one"] }).join(), /searches/);
  assert.match(broken({ searches: ["a", "b", "c", "d"] }).join(), /searches/);
});

test("links must be https", () => {
  assert.match(broken({ links: [{ kind: "live", url: "http://example.com" }] }).join(), /https/);
});

test("pictures: a screen needs alt text, a chart needs 2+ bars, a flow needs 3+ steps", () => {
  assert.match(broken({ picture: { kind: "screen", image: "x", alt: "", caption: "c" } }).join(), /alt/);
  assert.match(broken({ picture: { ...good.picture, bars: [{ label: "a", value: 1 }] } }).join(), /bars/);
  assert.match(
    broken({ picture: { kind: "flow", steps: [{ label: "a", detail: "b" }], caption: "c" } }).join(),
    /steps/,
  );
});

const anatomy = {
  model: "Nemotron Ultra 253B",
  harness: "3 agents in a retry loop",
  guardrails: "a validator checks every result",
  knowledge: "your CSV files in Postgres",
  tools: "real SQL queries",
};

test("an AI-agent project must show its anatomy: all 5 parts", () => {
  assert.match(broken({ chapter: "ai" }).join(), /anatomy/);
  assert.deepEqual(broken({ chapter: "ai", anatomy }), []);
  assert.match(broken({ chapter: "ai", anatomy: { ...anatomy, tools: " " } }).join(), /anatomy.*tools/);
});

test("Safe by design: if present, it must say how", () => {
  assert.deepEqual(broken({ safe: "Private, encrypted database; no SSH" }), []);
  assert.match(broken({ safe: "  " }).join(), /safe/);
});

test("proof line is built from real links, never typed by hand", () => {
  assert.deepEqual(proofItems(good), ["Code on GitHub"]);
  assert.deepEqual(
    proofItems({
      ...good,
      links: [
        { kind: "live", url: "https://x.app" },
        { kind: "github", url: "https://github.com/x" },
      ],
      source: { label: "UCI", url: "https://archive.ics.uci.edu" },
      honesty: "Generated test data",
    }),
    ["Live demo", "Code on GitHub", "Public data", "Limits said openly"],
  );
  // The note can be about the data or the project ("No longer running"):
  // the proof line must be true for both (seen on PortfolioScope 2026-10-22).
  assert.ok(!proofItems({ ...good, honesty: "No longer running" }).some((x) => /data/i.test(x)));
});

test("an extra real screen ('See the real app') needs alt text and must not repeat the main screen", () => {
  const shot = { image: "x", alt: "The app", caption: "Real screen" };
  assert.deepEqual(broken({ screen: shot }), []);
  assert.match(broken({ screen: { ...shot, alt: "" } }).join(), /screen/);
  assert.match(
    broken({ picture: { kind: "screen", image: "x", alt: "a", caption: "c" }, screen: shot }).join(),
    /screen/,
  );
});

// Brand-card picture kit (P5.6, Lubo 2026-10-22: "unique chart for every
// project"). Each kind draws real numbers, so the data must add up.
const withPicture = (picture) => checkProject({ ...good, picture });

test("gates: 3+ gates and 2+ outcomes", () => {
  const gates = [1, 2, 3].map((i) => ({ label: `Gate ${i}`, detail: "what it stops" }));
  const ok = { kind: "gates", title: "4 safety layers", gates, outcomes: ["Meeting", "Action"], caption: "c" };
  assert.deepEqual(withPicture(ok), []);
  assert.match(withPicture({ ...ok, gates: gates.slice(0, 2) }).join(), /gates/);
  assert.match(withPicture({ ...ok, outcomes: ["Meeting"] }).join(), /outcome/);
});

test("race: stage times must add up to each total (within 1%)", () => {
  const ok = {
    kind: "race",
    title: "Same pipeline, before and after",
    unit: "s",
    stages: [
      { label: "Load", before: 30, after: 2 },
      { label: "Write", before: 70, after: 8 },
    ],
    caption: "c",
  };
  assert.deepEqual(withPicture(ok), []);
  assert.match(withPicture({ ...ok, stages: [ok.stages[0]] }).join(), /2\+ stages/);
  assert.match(withPicture({ ...ok, stages: [{ label: "Load", before: 1, after: 2 }, ok.stages[1]] }).join(), /slower/);
});

test("rings: 2+ rings, each a share between 0 and 100", () => {
  const ok = { kind: "rings", title: "Late deliveries", rings: [{ label: "First", value: 37 }, { label: "Standard", value: 15 }], caption: "c" };
  assert.deepEqual(withPicture(ok), []);
  assert.match(withPicture({ ...ok, rings: [{ label: "First", value: 137 }, ok.rings[1]] }).join(), /0 and 100/);
  assert.match(withPicture({ ...ok, rings: [ok.rings[0]] }).join(), /2\+ rings/);
});

test("loop, funnel, stream: enough parts to draw", () => {
  const two = [{ label: "A", detail: "a" }, { label: "B", detail: "b" }];
  const three = [...two, { label: "C", detail: "c" }];
  const loop = { kind: "loop", title: "t", agents: three, back: "retry", center: { value: "~8 s", label: "to an answer" }, caption: "c" };
  assert.deepEqual(withPicture(loop), []);
  assert.match(withPicture({ ...loop, agents: two }).join(), /loop needs 3\+/);
  const funnel = { kind: "funnel", title: "t", stages: three, caption: "c" };
  assert.deepEqual(withPicture(funnel), []);
  assert.match(withPicture({ ...funnel, stages: two }).join(), /funnel needs 3\+/);
  const stream = { kind: "stream", title: "t", items: [{ label: "x", age: "5m", state: "fresh" }], into: { label: "Delta", detail: "d" }, caption: "c" };
  assert.match(withPicture(stream).join(), /stream needs 2\+/);
});

test("kpis, dots, reconcile: real-looking limits", () => {
  const kpis = { kind: "kpis", title: "t", tiles: [{ value: "18%", label: "late" }, { value: "$1,340", label: "per order" }], caption: "c" };
  assert.deepEqual(withPicture(kpis), []);
  assert.match(withPicture({ ...kpis, tiles: [kpis.tiles[0]] }).join(), /2 to 4 tiles/);
  assert.match(withPicture({ ...kpis, ring: { value: 140, label: "x" } }).join(), /0 and 100/);
  const dots = { kind: "dots", title: "t", per: 10, groups: [{ label: "Neutral", count: 1056 }, { label: "Negative", count: 164, lit: true }], caption: "c" };
  assert.deepEqual(withPicture(dots), []);
  // A dot per email would be thousands of shapes: the page must stay light.
  assert.match(withPicture({ ...dots, per: 1 }).join(), /too many dots/);
  const rec = { kind: "reconcile", title: "t", left: { label: "SQL Server", note: "n" }, right: { label: "PostgreSQL", note: "n" }, missingShare: 2 / 3, caption: "c" };
  assert.deepEqual(withPicture(rec), []);
  assert.match(withPicture({ ...rec, missingShare: 1.5 }).join(), /between 0 and 1/);
});

test("two neighbours in a chapter never share a picture kind (each one easy to remember)", () => {
  const p = (slug, chapter, kind) => ({ slug, chapter, picture: { kind } });
  assert.deepEqual(kindClashes([p("a", "ai", "loop"), p("b", "pipelines", "loop"), p("c", "ai", "gates")]), []);
  assert.match(kindClashes([p("a", "ai", "loop"), p("b", "ai", "loop")]).join(), /a and b/);
});
