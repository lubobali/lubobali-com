// Pure helpers for scripts/check-seo.mjs (no deps, regex on our own build
// output — not a general HTML parser). Each check returns a list of problems;
// an empty list means OK.

export const ORIGIN = "https://lubobali.com";

// The entities our build output uses, decoded so text and lengths are what
// a reader (and Google) sees: "&quot;" is one character, not six.
const ENTITIES = { "#x27": "'", "#39": "'", quot: '"', lt: "<", gt: ">" };
const decodeEntities = (s) =>
  s.replace(/&(#x27|#39|quot|lt|gt);/g, (_, e) => ENTITIES[e]).replaceAll("&amp;", "&"); // &amp; last: "&amp;lt;" stays "&lt;"

const attr = (tag, name) => {
  const v = tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  return v === undefined ? undefined : decodeEntities(v);
};

/** All <meta>/<link> tags + title + JSON-LD blocks found in a page. */
export function parsePage(html) {
  const metas = {};
  for (const tag of html.match(/<meta\s[^>]*>/g) ?? []) {
    const key = attr(tag, "name") ?? attr(tag, "property");
    if (key && !(key in metas)) metas[key] = attr(tag, "content");
  }
  const links = {};
  for (const tag of html.match(/<link\s[^>]*>/g) ?? []) {
    const rel = attr(tag, "rel");
    if (rel && !(rel in links)) links[rel] = attr(tag, "href");
  }
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const jsonLd = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);
  return { metas, links, title, jsonLd };
}

const isNoindex = (page) => /noindex/.test(page.metas.robots ?? "");

// Compare URLs, not strings: "https://lubobali.com" and
// "https://lubobali.com/" are the same URL (empty path = "/").
const sameUrl = (a, b) => {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return false;
  }
};

/** One indexable page: title, description, canonical, social tags. */
export function checkPage(page, path) {
  const p = [];
  const want = ORIGIN + path;
  if (isNoindex(page)) return p; // noindex pages need no SEO tags
  if (!page.title) p.push("missing <title>");
  const d = page.metas.description ?? "";
  if (d.length < 50 || d.length > 160) p.push(`description is ${d.length} chars, want 50-160`);
  if (!sameUrl(page.links.canonical, want)) p.push(`canonical is ${page.links.canonical}, want ${want}`);
  if (!sameUrl(page.metas["og:url"], want)) p.push(`og:url is ${page.metas["og:url"]}, want ${want}`);
  for (const k of ["og:title", "og:description", "og:image", "og:type", "twitter:card"]) {
    if (!page.metas[k]) p.push(`missing ${k}`);
  }
  const img = page.metas["og:image"];
  if (img && !img.startsWith(ORIGIN + "/")) p.push(`og:image not absolute on ${ORIGIN}: ${img}`);
  if (page.metas["twitter:card"] && page.metas["twitter:card"] !== "summary_large_image") {
    p.push(`twitter:card is ${page.metas["twitter:card"]}, want summary_large_image`);
  }
  return p;
}

/** JSON-LD on the home page: valid JSON, safe to inline, Person entity. */
export function checkJsonLd(blocks) {
  if (blocks.length !== 1) return [`want 1 JSON-LD block, found ${blocks.length}`];
  const raw = blocks[0];
  // A literal "<" could close the <script> early (e.g. "</script>").
  if (raw.includes("<")) return ["JSON-LD contains a raw '<' (must be \\u003c)"];
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return [`JSON-LD is not valid JSON: ${e.message}`];
  }
  const p = [];
  if (data["@context"] !== "https://schema.org") p.push("JSON-LD @context is not https://schema.org");
  const graph = data["@graph"] ?? [];
  const person = graph.find((n) => n["@type"] === "Person");
  if (!person) return [...p, "JSON-LD has no Person"];
  for (const k of ["name", "url", "jobTitle", "image", "description", "knowsAbout", "sameAs", "makesOffer"]) {
    if (!person[k] || (Array.isArray(person[k]) && !person[k].length)) p.push(`Person missing ${k}`);
  }
  // What Lubo offers (Phase 3 H6): every Offer names its Service.
  (person.makesOffer ?? []).forEach((o, i) => {
    if (o.itemOffered?.["@type"] !== "Service" || !o.itemOffered.name) p.push(`Offer ${i + 1} has no named Service`);
  });
  if (person.url !== ORIGIN + "/") p.push(`Person url is ${person.url}, want ${ORIGIN}/`);
  for (const u of [person.image?.url ?? person.image, ...(person.sameAs ?? [])]) {
    if (typeof u !== "string" || !u.startsWith("https://")) p.push(`not an https URL: ${u}`);
  }
  // Every {"@id": ...} reference must point to a node in the graph.
  const ids = new Set(graph.map((n) => n["@id"]).filter(Boolean));
  const refs = JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g);
  for (const [, id] of refs) if (!ids.has(id)) p.push(`dangling @id reference: ${id}`);
  return p;
}

/** Text a no-JavaScript reader sees: tags, scripts, styles removed. */
export function visibleText(html) {
  const stripped = html.replace(/<(script|style|noscript|head)\b[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ");
  return decodeEntities(stripped).replace(/\s+/g, " ");
}

/** "AI-bot test": AI crawlers don't run JavaScript, so the page's real
 * text must be in the raw HTML: one <h1>, a <main>, and the given phrases
 * (e.g. name, job title) as visible text — not only in meta/JSON-LD. */
export function checkBotText(html, phrases) {
  const p = [];
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) p.push(`want 1 <h1>, found ${h1}`);
  if (!/<main[\s>]/.test(html)) p.push("no <main> element");
  const text = visibleText(html);
  for (const phrase of phrases) {
    if (!text.includes(phrase)) p.push(`missing text "${phrase}" in raw HTML`);
  }
  return p;
}

/** Production robots.txt: open to crawlers, links the sitemap. */
export function checkRobots(txt) {
  const p = [];
  if (!txt.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) p.push("robots.txt does not link the sitemap");
  if (/^Disallow:\s*\/\s*$/im.test(txt)) p.push("robots.txt blocks the whole site");
  if (!/^User-agent:\s*\*/im.test(txt)) p.push("robots.txt has no User-agent: * group");
  return p;
}

/** Sitemap: exactly the indexable pages, absolute prod URLs. */
export function checkSitemap(xml, indexablePaths) {
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).href);
  const want = indexablePaths.map((path) => new URL(ORIGIN + path).href).sort();
  const got = [...urls].sort();
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    return [`sitemap lists ${JSON.stringify(got)}, want ${JSON.stringify(want)}`];
  }
  return [];
}

/** llms.txt (llmstxt.org): H1 name, blockquote summary, links to the site. */
export function checkLlmsTxt(txt) {
  const p = [];
  if (!/^# Lubo Bali\n/.test(txt)) p.push("llms.txt must start with '# Lubo Bali'");
  if (!/^> .+/m.test(txt)) p.push("llms.txt has no '> summary' line");
  if (!txt.includes(ORIGIN)) p.push(`llms.txt does not link ${ORIGIN}`);
  // H12: AI assistants should learn how to hire Lubo, not just who he is.
  for (const h of ["## Contact", "## What I do", "## Selected work", "## How it works"]) {
    if (!txt.includes(`\n${h}\n`)) p.push(`llms.txt has no '${h}' section`);
  }
  if (!/https:\/\/calendly\.com\//.test(txt)) p.push("llms.txt has no booking link");
  if (/[⁠ ]/.test(txt)) p.push("llms.txt has invisible layout characters");
  return p;
}

/** PNG width/height from the IHDR header. */
/** The header's "Free AI blueprint" button links to #blueprint (Lubo
 * 2026-10-22: "does not work from other pages"), so every page needs it. */
export function checkBlueprintTarget(html) {
  return /\sid="blueprint"/.test(html) ? [] : ['no id="blueprint": the header\'s "Free AI blueprint" button does nothing here'];
}

export function pngSize(buf) {
  const sig = "89504e470d0a1a0a";
  if (buf.subarray(0, 8).toString("hex") !== sig) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** A URL on our own origin -> its file path inside the build folder
 * ("https://lubobali.com/share/x.jpg" -> "share/x.jpg"), else null. */
export function assetPath(url) {
  if (!url?.startsWith(ORIGIN + "/")) return null;
  return url.slice(ORIGIN.length + 1).split(/[?#]/)[0];
}
