// Lighthouse gate (Phase 2 P9): runs Lighthouse (phone) on every page of the
// LIVE site after a deploy, 3 runs per page, and fails on the median if a
// budget in scripts/lib/lighthouse.mjs is broken. Caller rolls back on exit 1.
//
//   node scripts/lighthouse.mjs <site_url> <build_dir> [staging|prod] [runs]
//
// Pages = every built page (same list as check-seo.mjs), project pages
// sampled (samplePages, Phase 5 P5.2b); budgets are hard
// only for indexable pages, noindex ones (e.g. /styleguide) just warn. Chrome:
// CHROME_PATH is set in the CI image (ci/Dockerfile).
// Staging is noindex + Disallow on purpose, so the one SEO audit that checks
// "can be indexed" is skipped there (prod robots are checked by check-seo).
import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { gatePage, isFlake, medianSummary, samplePages, summarize } from "./lib/lighthouse.mjs";

const [url, build, env = "staging", runsArg = "3"] = process.argv.slice(2);
if (!url || !build) {
  console.error("usage: lighthouse.mjs <site_url> <build_dir> [staging|prod] [runs]");
  process.exit(2);
}
const runs = Number(runsArg);
const site = url.replace(/\/$/, "");

const SKIP = new Set(["404.html", "_not-found.html"]);
const files = (await readdir(build, { recursive: true }))
  .filter((f) => f.endsWith(".html") && !SKIP.has(f) && !f.startsWith("_next"))
  .sort();
const all = [];
for (const f of files) {
  const html = await readFile(join(build, f), "utf8");
  all.push({
    path: f === "index.html" ? "/" : "/" + f.replace(/\.html$/, ""),
    indexable: !/<meta name="robots" content="[^"]*noindex/.test(html),
    bytes: html.length,
  });
}
// One-template pages are sampled (see samplePages); the rest all run.
const pages = samplePages(all);
if (pages.length < all.length) console.log(`lighthouse: ${pages.length} of ${all.length} pages (template pages sampled)`);

// Chrome runs as root in a locked-down container (no user namespaces):
// --no-sandbox is required. It only ever loads our own site.
const CHROME_FLAGS = "--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu";
const run = promisify(execFile);
const tmp = await mkdtemp(join(tmpdir(), "lighthouse-"));

async function lighthouse(path, i) {
  const out = join(tmp, `${path.replaceAll("/", "_") || "_"}-${i}.json`);
  const args = [
    site + path,
    "--quiet",
    "--output=json",
    `--output-path=${out}`,
    `--chrome-flags=${CHROME_FLAGS}`,
  ];
  if (env === "staging") args.push("--skip-audits=is-crawlable");
  // A Lighthouse flake (it failed to measure) gets up to 2 more tries; a
  // slow or broken page still fails, because its scores come back bad.
  for (let attempt = 1; ; attempt++) {
    try {
      await run("node_modules/.bin/lighthouse", args, { maxBuffer: 1 << 24 });
      return summarize(JSON.parse(await readFile(out, "utf8")));
    } catch (err) {
      if (!isFlake(err) || attempt === 3) throw err;
      console.log(`  retry ${path} run ${i}: ${err.stderr.trim().split("\n")[0].slice(0, 120)}`);
    }
  }
}

let failed = false;
const pct = (n) => Math.round(n * 100);
console.log(`lighthouse: ${pages.length} pages x ${runs} runs, phone, ${site} (${env})`);
for (const { path, indexable } of pages) {
  const results = [];
  for (let i = 1; i <= runs; i++) results.push(await lighthouse(path, i));
  const s = medianSummary(results);
  const { fails, warns } = gatePage(s, { indexable });
  console.log(
    `${path.padEnd(14)} perf ${pct(s.performance)} · a11y ${pct(s.accessibility)} · best ${pct(s.bestPractices)} · seo ${pct(s.seo)}` +
      ` · LCP ${Math.round(s.lcpMs)} ms · TBT ${Math.round(s.tbtMs)} ms · CLS ${s.cls.toFixed(3)} · ${s.requests} requests` +
      `   (perf runs: ${results.map((r) => pct(r.performance)).join("/")})`,
  );
  for (const w of warns) console.log(`  WARN  ${path}: ${w}`);
  for (const f of fails) console.log(`  FAIL  ${path}: ${f}`);
  if (fails.length) failed = true;
}
await rm(tmp, { recursive: true, force: true });
console.log(failed ? "lighthouse: FAIL" : "lighthouse: PASS");
process.exit(failed ? 1 : 0);
