// node --test scripts/tests/seo.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkJsonLd,
  checkLlmsTxt,
  checkPage,
  checkRobots,
  checkSitemap,
  parsePage,
  pngSize,
} from "../lib/seo.mjs";

const GOOD_HEAD = `<head><title>Lubo Bali</title>
<meta name="description" content="Senior AI &amp; Data Platform Engineer. Solo-built LuBot.ai, featured by Neon."/>
<link rel="canonical" href="https://lubobali.com/"/>
<meta property="og:title" content="Lubo Bali"/>
<meta property="og:description" content="x"/>
<meta property="og:url" content="https://lubobali.com/"/>
<meta property="og:type" content="profile"/>
<meta property="og:image" content="https://lubobali.com/og.png"/>
<meta name="twitter:card" content="summary_large_image"/></head>`;

const person = {
  "@type": "Person",
  "@id": "https://lubobali.com/#person",
  name: "Lubo Bali",
  url: "https://lubobali.com/",
  jobTitle: "AI & Data Platform Engineer",
  description: "x",
  image: "https://lubobali.com/img/a.webp",
  knowsAbout: ["RAG"],
  sameAs: ["https://github.com/lubobali"],
};
const ld = (graph) => JSON.stringify({ "@context": "https://schema.org", "@graph": graph });

test("parsePage reads title, metas, links, JSON-LD and decodes &amp;", () => {
  const page = parsePage(
    GOOD_HEAD + `<script type="application/ld+json">{"a":1}</script>`,
  );
  assert.equal(page.title, "Lubo Bali");
  assert.match(page.metas.description, /AI & Data/);
  assert.equal(page.links.canonical, "https://lubobali.com/");
  assert.deepEqual(page.jsonLd, ['{"a":1}']);
});

test("checkPage: a complete page passes", () => {
  assert.deepEqual(checkPage(parsePage(GOOD_HEAD), "/"), []);
});

test("checkPage: wrong canonical, short description, missing og:image fail", () => {
  const html = GOOD_HEAD.replace('href="https://lubobali.com/"', 'href="https://staging.lubobali.com/"')
    .replace(/content="Senior[^"]*"/, 'content="short"')
    .replace(/<meta property="og:image"[^>]*>/, "");
  const problems = checkPage(parsePage(html), "/");
  assert.equal(problems.length, 3, problems.join("\n"));
});

test("checkPage: root URL with or without the slash is the same URL", () => {
  const html = GOOD_HEAD.replaceAll('"https://lubobali.com/"', '"https://lubobali.com"');
  assert.deepEqual(checkPage(parsePage(html), "/"), []);
  const other = GOOD_HEAD.replace('href="https://lubobali.com/"', 'href="https://lubobali.com/about"');
  assert.equal(checkPage(parsePage(other), "/").length, 1);
});

test("checkPage: noindex pages are skipped", () => {
  const page = parsePage(`<meta name="robots" content="noindex, nofollow"/>`);
  assert.deepEqual(checkPage(page, "/styleguide"), []);
});

test("checkJsonLd: valid Person graph passes", () => {
  assert.deepEqual(checkJsonLd([ld([person])]), []);
});

test("checkJsonLd: raw '<', bad JSON, no Person, dangling @id fail", () => {
  assert.match(checkJsonLd(['{"a":"</script>"}'])[0], /raw '<'/);
  assert.match(checkJsonLd(["{nope"])[0], /not valid JSON/);
  assert.match(checkJsonLd([ld([])]).join(), /no Person/);
  const org = { "@type": "Organization", founder: { "@id": "https://lubobali.com/#nobody" } };
  assert.match(checkJsonLd([ld([person, org])]).join(), /dangling/);
  assert.match(checkJsonLd([]).join(), /want 1/);
});

test("checkJsonLd: http sameAs and missing fields fail", () => {
  const bad = { ...person, sameAs: ["http://x.com/a"], knowsAbout: [] };
  const problems = checkJsonLd([ld([bad])]);
  assert.equal(problems.length, 2, problems.join("\n"));
});

test("checkRobots: open + sitemap passes, Disallow: / fails", () => {
  const ok = "User-agent: *\nAllow: /\n\nSitemap: https://lubobali.com/sitemap.xml\n";
  assert.deepEqual(checkRobots(ok), []);
  assert.match(checkRobots(ok.replace("Allow: /", "Disallow: /")).join(), /blocks the whole site/);
  assert.match(checkRobots("User-agent: *\nAllow: /\n").join(), /sitemap/);
  // Field names are case-insensitive (Next writes "User-Agent").
  assert.deepEqual(checkRobots(ok.replace("User-agent", "User-Agent")), []);
  assert.match(checkRobots(ok.replace("Allow: /", "disallow: /")).join(), /blocks/);
});

test("checkSitemap: must list exactly the indexable pages", () => {
  const xml = "<url><loc>https://lubobali.com/</loc></url>";
  assert.deepEqual(checkSitemap(xml, ["/"]), []);
  assert.equal(checkSitemap(xml + "<loc>https://lubobali.com/styleguide</loc>", ["/"]).length, 1);
  assert.equal(checkSitemap(xml, ["/", "/about"]).length, 1);
});

test("checkLlmsTxt: needs H1, summary and a site link", () => {
  assert.deepEqual(checkLlmsTxt("# Lubo Bali\n\n> Engineer.\n\n- https://lubobali.com/\n"), []);
  assert.equal(checkLlmsTxt("hello").length, 3);
});

test("pngSize reads the IHDR size, rejects non-PNG", () => {
  const buf = Buffer.alloc(24);
  Buffer.from("89504e470d0a1a0a", "hex").copy(buf);
  buf.writeUInt32BE(1200, 16);
  buf.writeUInt32BE(630, 20);
  assert.deepEqual(pngSize(buf), { width: 1200, height: 630 });
  assert.equal(pngSize(Buffer.from("GIF89a")), null);
});
