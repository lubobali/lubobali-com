// node --test scripts/tests/seo.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assetPath,
  checkBotText,
  checkJsonLd,
  checkLlmsTxt,
  hasPhone,
  checkShareImage,
  checkPage,
  checkRobots,
  checkSitemap,
  parsePage,
  pngSize,
} from "../lib/seo.mjs";

const GOOD_HEAD = `<head><title>Lubo Bali</title>
<meta name="description" content="Senior Data &amp; AI Platform Engineer. Solo-built LuBot.ai, featured by Neon."/>
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
  jobTitle: "Data & AI Platform Engineer",
  description: "x",
  image: "https://lubobali.com/img/a.webp",
  knowsAbout: ["RAG"],
  sameAs: ["https://github.com/lubobali"],
  makesOffer: [{ "@type": "Offer", itemOffered: { "@type": "Service", name: "AI agents & RAG" } }],
};
const ld = (graph) => JSON.stringify({ "@context": "https://schema.org", "@graph": graph });

test("parsePage reads title, metas, links, JSON-LD and decodes &amp;", () => {
  const page = parsePage(
    GOOD_HEAD + `<script type="application/ld+json">{"a":1}</script>`,
  );
  assert.equal(page.title, "Lubo Bali");
  assert.match(page.metas.description, /Data & AI/);
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

test("checkJsonLd: Person must offer named services (makesOffer)", () => {
  const { makesOffer, ...noOffer } = person;
  assert.ok(makesOffer);
  assert.match(checkJsonLd([ld([noOffer])]).join(), /Person missing makesOffer/);
  const unnamed = { ...person, makesOffer: [{ "@type": "Offer", itemOffered: { "@type": "Service" } }] };
  assert.match(checkJsonLd([ld([unnamed])]).join(), /Offer 1 has no named Service/);
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

const LLMS_OK =
  "# Lubo Bali\n\n> Engineer.\n\n## Contact\n\n- https://calendly.com/x\n\n## What I do\n\n- a\n\n## Selected work\n\n- b\n\n## How it works\n\n1. c\n\n## Resume\n\n- https://lubobali.com/resume\n- https://lubobali.com/lubo-bali-resume.pdf\n\n- https://lubobali.com/\n";

test("checkLlmsTxt: needs H1, summary, site link, hire sections, booking link", () => {
  assert.deepEqual(checkLlmsTxt(LLMS_OK), []);
  assert.equal(checkLlmsTxt("hello").length, 10);
});

test("checkLlmsTxt: names the missing section and the missing booking link", () => {
  const p = checkLlmsTxt(LLMS_OK.replace("## Selected work\n", "").replace("https://calendly.com/x", "x"));
  assert.ok(p.some((m) => m.includes("'## Selected work'")));
  assert.ok(p.some((m) => m.includes("booking link")));
});

test("checkLlmsTxt: needs the Resume section with the page and the PDF (P6.9)", () => {
  const p = checkLlmsTxt(LLMS_OK.replace("## Resume\n", "").replace("/lubo-bali-resume.pdf", "/x.pdf"));
  assert.ok(p.some((m) => m.includes("'## Resume'")));
  assert.ok(p.some((m) => m.includes("resume PDF")));
});

test("hasPhone: finds the number in any spacing, not other digits", () => {
  assert.equal(hasPhone("call 555-123-4567", "555-123-4567"), true);
  assert.equal(hasPhone("(555) 123 4567", "555-123-4567"), true);
  assert.equal(hasPhone("5551234567", "555-123-4567"), true);
  assert.equal(hasPhone("12,000+ tests, 260,000+ lines", "555-123-4567"), false);
});

test("checkLlmsTxt: rejects invisible layout characters", () => {
  assert.equal(checkLlmsTxt(LLMS_OK.replace("Engineer.", "Mar⁠–⁠Aug 2026")).length, 1);
});

test("pngSize reads the IHDR size, rejects non-PNG", () => {
  const buf = Buffer.alloc(24);
  Buffer.from("89504e470d0a1a0a", "hex").copy(buf);
  buf.writeUInt32BE(1200, 16);
  buf.writeUInt32BE(630, 20);
  assert.deepEqual(pngSize(buf), { width: 1200, height: 630 });
  assert.equal(pngSize(Buffer.from("GIF89a")), null);
});

test("checkBotText: name, one h1 and <main> in raw HTML pass", () => {
  const html = `<body><main><h1>Lubo Bali</h1><p>Senior Data &amp; AI Platform Engineer</p></main></body>`;
  assert.deepEqual(checkBotText(html, ["Lubo Bali"]), []);
  assert.deepEqual(checkBotText(html, ["Lubo Bali", "Senior Data & AI Platform Engineer"]), []);
});

test("checkBotText: HTML entities are decoded like a bot reads them", () => {
  // React writes ' as &#x27;; bots see the apostrophe.
  const html = `<main><h1>Hi</h1><a>Inside LuBot&#x27;s &quot;DB&quot; &lt;3 &#39;x&#39;</a></main>`;
  assert.deepEqual(checkBotText(html, [`Inside LuBot's "DB" <3 'x'`]), []);
});

test("checkBotText: text only in scripts/meta does not count", () => {
  // AI bots read text, not JSON-LD or React's script payload.
  const html = `<head><title>Lubo Bali</title></head><body><main><h1>Hello</h1>
    <script>self.__next_f.push("Lubo Bali")</script>
    <script type="application/ld+json">{"name":"Lubo Bali"}</script></main></body>`;
  assert.match(checkBotText(html, ["Lubo Bali"]).join(), /missing text "Lubo Bali"/);
});

test("checkBotText: no h1, two h1s, or no <main> fail", () => {
  assert.match(checkBotText("<main><p>Lubo Bali</p></main>", ["Lubo Bali"]).join(), /want 1 <h1>, found 0/);
  assert.match(checkBotText("<main><h1>A</h1><h1>Lubo Bali</h1></main>", ["Lubo Bali"]).join(), /found 2/);
  assert.match(checkBotText("<div><h1>Lubo Bali</h1></div>", ["Lubo Bali"]).join(), /no <main>/);
});

// Found in P5.6 batch 3: quotes in a description were counted as "&quot;"
// (6 characters each), so a 157-character description failed the 160 cap.
// Google reads the decoded text, so the check does too.
test("parsePage decodes HTML entities in meta content (quotes count as 1)", () => {
  const page = parsePage('<meta name="description" content="Ask &quot;will it rain&quot; &amp; it&#x27;s found"/>');
  assert.equal(page.metas.description, 'Ask "will it rain" & it\'s found');
});

// P5.7: every page's share image must exist in the build (a missing file =
// a broken LinkedIn preview).
test("assetPath maps a share image URL on our origin to its file in the build", () => {
  assert.equal(assetPath("https://lubobali.com/share/mergeai.jpg"), "share/mergeai.jpg");
  assert.equal(assetPath("https://lubobali.com/og.png?v=2"), "og.png");
  assert.equal(assetPath("https://example.com/x.png"), null);
});

test("checkShareImage: /resume must use its own card on LinkedIn and X", () => {
  const card = "https://lubobali.com/share/resume.jpg";
  assert.deepEqual(checkShareImage({ metas: { "og:image": card, "twitter:image": card } }, "/resume"), []);
  assert.equal(checkShareImage({ metas: { "og:image": "https://lubobali.com/og.png" } }, "/resume").length, 2);
  assert.deepEqual(checkShareImage({ metas: {} }, "/about"), []);
});

// ---- Notes (Phase 9 P9.6) ----
import { checkNotePage, checkFeed } from "../lib/seo.mjs";

const notePage = (ld, rss = true) =>
  parsePage(`<head><title>T</title><link rel="canonical" href="https://lubobali.com/notes/x"/>${
    rss ? '<link rel="alternate" type="application/rss+xml" title="Notes" href="https://lubobali.com/notes/feed.xml"/>' : ""
  }<script type="application/ld+json">${JSON.stringify(ld)}</script></head><h1>Hello</h1>`);
const goodLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [] },
    {
      "@type": "BlogPosting",
      headline: "Hello",
      datePublished: "2026-11-02",
      mainEntityOfPage: "https://lubobali.com/notes/x",
      author: { "@id": "https://lubobali.com/#person" },
    },
  ],
};

test("a note page needs its BlogPosting, matching the h1 and the canonical URL, and the RSS link", () => {
  assert.deepEqual(checkNotePage(notePage(goodLd), "/notes/x", "Hello"), []);
  assert.ok(checkNotePage(notePage(goodLd, false), "/notes/x", "Hello").some((p) => p.includes("RSS")));
  const g = structuredClone(goodLd);
  g["@graph"][1].headline = "Other";
  assert.ok(checkNotePage(notePage(g), "/notes/x", "Hello").some((p) => p.includes("headline")));
  const noPost = { ...goodLd, "@graph": [goodLd["@graph"][0]] };
  assert.ok(checkNotePage(notePage(noPost), "/notes/x", "Hello").some((p) => p.includes("BlogPosting")));
});

test("the feed lists every note page and nothing else", () => {
  const xml = `<rss version="2.0"><channel><item><link>https://lubobali.com/notes/x</link></item></channel></rss>`;
  assert.deepEqual(checkFeed(xml, ["/notes/x"]), []);
  assert.ok(checkFeed(xml, ["/notes/x", "/notes/y"]).some((p) => p.includes("/notes/y")));
  assert.ok(checkFeed("not xml", ["/notes/x"]).some((p) => p.includes("rss")));
});
