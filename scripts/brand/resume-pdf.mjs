// Renders Lubo's resume PDF (Phase 6, P6.5): public/lubo-bali-resume.pdf
// from src/lib/resume.ts, plus scripts/brand/resume.manifest.json (a hash
// of everything the PDF is made from, checked by scripts/tests/resume.test.mjs
// so the PDF can never go stale). Output is committed; re-run when the resume
// data or its look changes. Playwright is not a project dependency, so run it
// in the Playwright image, from the repo root (Node 24 there loads resume.ts):
//   docker run --rm --init -v "$PWD":/w -w /tmp mcr.microsoft.com/playwright:v1.64.0-noble \
//     bash -c 'npm i --silent playwright@1.64.0 && cp /w/scripts/brand/resume-pdf.mjs /w/scripts/lib/resume.mjs . \
//       && sed -i "s#../lib/resume.mjs#./resume.mjs#" resume-pdf.mjs && node resume-pdf.mjs /w'
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { MANIFEST_PATH, PDF_PATH, loadResume, resumeHash, resumeHtml } from "../lib/resume.mjs";

const repo = process.argv[2] ?? process.cwd();
const { resume } = await loadResume(repo);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${join(repo, "scripts/brand/resume.html")}`);
await page.evaluate((html) => {
  document.getElementById("resume").innerHTML = html;
}, resumeHtml(resume));
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((i) => i.complete));

// One page, or the ATS (and the reader) gets a broken second page.
const tall = await page.evaluate(() => document.documentElement.scrollHeight);
await page.pdf({ path: join(repo, PDF_PATH), format: "Letter", preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
await writeFile(join(repo, MANIFEST_PATH), `${JSON.stringify({ hash: await resumeHash(repo) }, null, 2)}\n`);
await browser.close();
console.log(`resume: ${PDF_PATH} (content height ${tall}px)`);
