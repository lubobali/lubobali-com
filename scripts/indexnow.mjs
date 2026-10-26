// After a green production deploy: tell IndexNow (Bing, Yandex, ...) which
// pages are new or changed since the last successful send (Phase 8 L8).
// The first send = every sitemap page. A page counts as changed when what a
// search engine reads changed (scripts/lib/indexnow.mjs pageFingerprint).
// The list of what was sent lives next to the releases, never served.
// Usage: node scripts/indexnow.mjs out <state.json> <site origin> [--dry-run]
// Exit 1 = not sent (CI only warns: a deploy never fails over this).
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  INDEXNOW_ENDPOINT,
  changedUrls,
  findKey,
  pageFile,
  pageFingerprint,
  payload,
  sitemapUrls,
} from "./lib/indexnow.mjs";

const [out, stateFile, origin] = process.argv.slice(2);
const dryRun = process.argv.includes("--dry-run");
if (!out || !stateFile || !origin?.startsWith("https://")) {
  console.error("usage: node scripts/indexnow.mjs out <state.json> <https://site> [--dry-run]");
  process.exit(2);
}

const key = findKey(await readdir(out));
const now = {};
for (const url of sitemapUrls(await readFile(join(out, "sitemap.xml"), "utf8"))) {
  if (!url.startsWith(`${origin}/`) && url !== origin) throw new Error(`sitemap URL off-site: ${url}`);
  now[url] = pageFingerprint(await readFile(join(out, pageFile(url)), "utf8"));
}
const sent = JSON.parse(await readFile(stateFile, "utf8").catch(() => "{}"));
const urls = changedUrls(sent, now);
if (urls.length === 0) {
  console.log("indexnow: no page changed, nothing to send");
  process.exit(0);
}
console.log(`indexnow: ${urls.length} new or changed page(s):\n  ${urls.join("\n  ")}`);
if (dryRun) process.exit(0);

let res;
try {
  res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload(origin, key, urls)),
    signal: AbortSignal.timeout(15_000),
  });
} catch (err) {
  console.error(`indexnow: not sent (${err.name}); next deploy tries again`);
  process.exit(1);
}
// 200 = sent, 202 = accepted, key check pending. Anything else: try next time.
if (res.status !== 200 && res.status !== 202) {
  console.error(`indexnow: refused, HTTP ${res.status}; next deploy tries again`);
  process.exit(1);
}
const tmp = `${stateFile}.tmp`;
await writeFile(tmp, `${JSON.stringify(now, null, 1)}\n`);
await rename(tmp, stateFile);
console.log(`indexnow: sent, HTTP ${res.status}`);
