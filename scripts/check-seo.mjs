// Post-build SEO + AI-discovery check on the static export (Phase 2 P7).
// Reads the HTML exactly as bots get it (no JS). Fails the build if a page
// lost its title/description/canonical/social tags or its readable text
// (AI-bot test: one <h1>, <main>, name + job title), the home page's
// JSON-LD is broken, or robots.txt / sitemap.xml / llms.txt / the social
// image are wrong. Usage: node scripts/check-seo.mjs out
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  ORIGIN,
  checkBlueprintTarget,
  checkBotText,
  checkJsonLd,
  checkLlmsTxt,
  assetPath,
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
const PAGE_TEXT = {
  "/blueprint": [
    "Get your free AI blueprint", // Phase 3b B6
    "See what you'd get",
    "3 questions I'd ask you on our call",
    "One residual payout desk", // payments example (all 6 cards are in the HTML)
    "One job billing app", // construction example
    "One client desk for the firm", // law firm example
  ],
  "/": [
    "Senior AI & Data Platform Engineer",
    "I build AI that works on your real data, in production.", // hero headline (Phase 3 H1)
    "Available for new AI projects now.",
    "Read the transcript", // intro video + transcript (Phase 3 H9b)
    "And that's exactly what I fix.",
    "Featured by Neon (Databricks)", // proof strip (Phase 3 H5)
    "Inside LuBot's database-per-tenant architecture",
    "12,000+",
    "What I do", // service cards (Phase 3 H6)
    "Get your free AI blueprint", // Blueprint tool (Phase 3b B5); examples load on click, all 6 are on /blueprint
    "AI agents that do the work", // H12: 4 cards
    "Data that's ready for AI",
    "Answers you can trust",
    "AI bills that stay small",
    "Selected work", // case study previews (Phase 3 H7)
    "GraphGuard-AI",
    "HelloPayments",
    "Built with", // H8 wheel: names are link text, not only logos
    "AWS, used in LuBot.ai",
    "PyTorch, used in GraphGuard-AI",
    "How it works", // H9
    "Every 2 weeks: update + invoice",
    "You own 100% of what I build",
    "Building LuBot.ai.",
    "LuBot is one of the best projects in the bootcamp, ready to make money.", // H10
    "Zach Wilson",
    "What people say",
    "Tell me your problem.", // final CTA (H11)
    "Available for new AI projects now",
    "data@lubobali.com",
  ],
};

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
    fail(path, checkBlueprintTarget(html)); // public pages (not /styleguide)
  }
  if (path === "/") home = page;
  fail(path, checkPage(page, path));
  // The share image must be in the build, or the LinkedIn preview breaks.
  const img = assetPath(page.metas["og:image"]);
  if (img && !existsSync(join(out, img))) fail(path, [`og:image file missing in the build: ${img}`]);
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
