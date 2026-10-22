// Project data checks (Phase 5 P5.3). checkProject() runs on every project
// when the site builds (a broken project fails the build); these tests pin
// what it catches. model.ts has no imports, so Node runs it directly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CHAPTERS, checkProject, INDUSTRIES, proofItems } from "../../src/lib/projects/model.ts";

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
  assert.deepEqual(Object.keys(CHAPTERS), ["analytics", "pipelines", "ai"]);
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
    ["Live demo", "Code on GitHub", "Public data", "Generated test data, said so"],
  );
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
