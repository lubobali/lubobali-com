// Resume PDF (Phase 6, P6.5): one source (src/lib/resume.ts), never stale,
// same numbers as the site, phone only in the PDF.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { MANIFEST_PATH, PDF_PATH, PHONE, loadResume, resumeHash, resumeHtml } from "../lib/resume.mjs";

const repo = new URL("../../", import.meta.url).pathname;
const { resume, lubotNumbers } = await loadResume(repo);

test("the PDF exists and matches the resume data today (else re-run scripts/brand/resume-pdf.mjs)", async () => {
  assert.ok(existsSync(join(repo, PDF_PATH)), "no PDF: run scripts/brand/resume-pdf.mjs");
  const manifest = JSON.parse(readFileSync(join(repo, MANIFEST_PATH), "utf8"));
  assert.equal(manifest.hash, await resumeHash(repo), "PDF is stale: run scripts/brand/resume-pdf.mjs");
});

test("the PDF is one page", () => {
  const pdf = readFileSync(join(repo, PDF_PATH), "latin1");
  assert.equal(pdf.match(/\/Type\s*\/Page\b/g)?.length, 1);
});

test("LuBot numbers on the resume = the numbers on the site", () => {
  for (const f of ["src/components/home/proof-strip.tsx", "src/lib/case-studies/lubot.ts"]) {
    const src = readFileSync(join(repo, f), "utf8");
    assert.ok(src.includes(`"${lubotNumbers.lines}"`), `${f} doesn't say ${lubotNumbers.lines}`);
    assert.ok(src.includes(`"${lubotNumbers.tests}"`), `${f} doesn't say ${lubotNumbers.tests}`);
  }
});

test("the phone number is never in the site's source (PDF only)", () => {
  const digits = PHONE.replace(/\D/g, "");
  const hits = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx|mdx?|json|txt|html)$/.test(name) && readFileSync(p, "utf8").replace(/\D/g, "").includes(digits)) hits.push(p);
    }
  };
  walk(join(repo, "src"));
  assert.deepEqual(hits, []);
});

test("resume data: no removed client, degree done, LuBot numbers used", () => {
  const all = JSON.stringify(resume);
  assert.doesNotMatch(all, /structured fusion/i);
  assert.doesNotMatch(all, /expected/i);
  assert.ok(all.includes(lubotNumbers.lines) && all.includes(lubotNumbers.tests));
});

test("resumeHtml: phone + every job, plain headings in ATS order, text escaped", () => {
  const html = resumeHtml(resume);
  assert.ok(html.includes(PHONE));
  for (const j of resume.jobs) assert.ok(html.includes(j.title.replace(/&/g, "&amp;")), j.title);
  const order = ["Summary", "Work Experience", "Technical Skills", "Education", "Projects"].map((h) => html.indexOf(`<h2>${h}</h2>`));
  assert.ok(order.every((i, k) => i > -1 && (k === 0 || i > order[k - 1])), `headings: ${order}`);
  assert.ok(!/<table|<img[^>]*alt="[^"]/.test(html), "no tables, no text in images");
  const x = resumeHtml({ ...resume, name: "<b>&" });
  assert.ok(x.includes("&lt;b&gt;&amp;"));
});
