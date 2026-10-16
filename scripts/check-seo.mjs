// Post-build SEO + AI-discovery check on the static export (Phase 2 P7).
// Reads the HTML exactly as bots get it (no JS). Fails the build if a page
// lost its title/description/canonical/social tags or its readable text
// (AI-bot test: one <h1>, <main>, name + job title), the home page's
// JSON-LD is broken, or robots.txt / sitemap.xml / llms.txt / the social
// image are wrong. Usage: node scripts/check-seo.mjs out
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  ORIGIN,
  checkBotText,
  checkJsonLd,
  checkLlmsTxt,
  checkPage,
  checkRobots,
  checkSitemap,
  parsePage,
  pngSize,
} from "./lib/seo.mjs";

const out = process.argv[2] ?? "out";
const problems = [];
const fail = (where, list) => list.forEach((p) => problems.push(`${where}: ${p}`));

// AI-bot test: what must be readable text on every indexable page, and
// extra phrases per page. Keep in sync with src/lib/site.ts.
const NAME = "Lubo Bali";
const PAGE_TEXT = { "/": ["Senior AI & Data Platform Engineer"] };

// out/index.html -> "/", out/about.html -> "/about" (one URL style, no
// trailing slash). Error pages are not real pages.
const SKIP = new Set(["404.html", "_not-found.html"]);
const files = (await readdir(out, { recursive: true }))
  .filter((f) => f.endsWith(".html") && !SKIP.has(f) && !f.startsWith("_next"));
const indexable = [];
let home;
for (const file of files) {
  const path = file === "index.html" ? "/" : "/" + file.replace(/\.html$/, "");
  const html = await readFile(join(out, file), "utf8");
  const page = parsePage(html);
  if (!/noindex/.test(page.metas.robots ?? "")) {
    indexable.push(path);
    fail(`${path} (AI-bot text)`, checkBotText(html, [NAME, ...(PAGE_TEXT[path] ?? [])]));
  }
  if (path === "/") home = page;
  fail(path, checkPage(page, path));
}
if (!home) fail("/", ["no index.html"]);
else {
  fail("/ JSON-LD", checkJsonLd(home.jsonLd));
  // The social image must exist in the build at 1200x630.
  const og = home.metas["og:image"];
  if (og?.startsWith(ORIGIN + "/")) {
    const file = join(out, og.slice(ORIGIN.length).split("?")[0]);
    const size = pngSize(await readFile(file).catch(() => Buffer.alloc(0)));
    if (!size) fail("og:image", [`${relative(".", file)} missing or not a PNG`]);
    else if (size.width !== 1200 || size.height !== 630) {
      fail("og:image", [`is ${size.width}x${size.height}, want 1200x630`]);
    }
  }
}

const text = (f) => readFile(join(out, f), "utf8").catch(() => null);
const robots = await text("robots.txt");
const sitemap = await text("sitemap.xml");
const llms = await text("llms.txt");
if (robots === null) fail("robots.txt", ["missing"]);
else fail("robots.txt", checkRobots(robots));
if (sitemap === null) fail("sitemap.xml", ["missing"]);
else fail("sitemap.xml", checkSitemap(sitemap, indexable));
if (llms === null) fail("llms.txt", ["missing"]);
else fail("llms.txt", checkLlmsTxt(llms));

if (problems.length) {
  problems.forEach((p) => console.log(`FAIL  ${p}`));
  console.log(`seo: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`seo: ok (${files.length} pages, ${indexable.length} indexable: ${indexable.join(" ")})`);
