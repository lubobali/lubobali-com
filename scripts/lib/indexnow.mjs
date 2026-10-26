// Pure helpers for scripts/indexnow.mjs (Phase 8 L8): after a green
// production deploy, tell IndexNow (Bing, Yandex, ...) which pages are new
// or changed, so they re-read them in minutes instead of days. Google does
// not use IndexNow; it keeps reading the sitemap.
import { createHash } from "node:crypto";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// The key file in public/: 32 hex characters + ".txt", holding its own name.
// Public on purpose: it only lets someone ask for OUR pages to be re-read.
const KEY_FILE = /^([0-9a-f]{32})\.txt$/;

/** The static-export file behind a sitemap URL: "/" -> index.html, "/a/b" -> a/b.html. */
export function pageFile(url) {
  const path = new URL(url).pathname.replace(/^\/|\/$/g, "");
  return path === "" ? "index.html" : `${path}.html`;
}

/** Every <loc> in sitemap.xml, in order. */
export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/**
 * What a search engine reads on the page: title, meta tags, canonical and
 * the visible text. Scripts and styles are left out, so a rebuild of the
 * same page (new build id, new chunk names) keeps the same fingerprint.
 */
export function pageFingerprint(html) {
  const head = [
    ...(html.match(/<title>[^<]*<\/title>/g) ?? []),
    // name= / property= metas only: the CSP meta (http-equiv) gets new script
    // hashes on every build and means nothing to a search engine.
    ...(html.match(/<meta\s[^>]*\b(?:name|property)="[^>]*>/g) ?? []),
    ...(html.match(/<link\s[^>]*rel="canonical"[^>]*>/g) ?? []),
  ];
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<head[\s\S]*?<\/head>/, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(head.join("\n")).update("\n\n").update(text).digest("hex");
}

/** URLs whose fingerprint is new or differs from the last successful send. */
export function changedUrls(sent, now) {
  return Object.keys(now).filter((url) => sent[url] !== now[url]);
}

/** The one key file name in a folder listing -> the key. */
export function findKey(names) {
  const keys = names.map((n) => n.match(KEY_FILE)?.[1]).filter(Boolean);
  if (keys.length === 0) throw new Error("no IndexNow key file (public/<32 hex>.txt)");
  if (keys.length > 1) throw new Error(`${keys.length} IndexNow key files in public/: keep one`);
  return keys[0];
}

/** The JSON body IndexNow expects. */
export function payload(origin, key, urls) {
  return { host: new URL(origin).host, key, keyLocation: `${origin}/${key}.txt`, urlList: urls };
}
