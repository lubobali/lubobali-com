// node --test scripts/tests/indexnow.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import {
  INDEXNOW_ENDPOINT,
  changedUrls,
  findKey,
  pageFile,
  pageFingerprint,
  payload,
  sitemapUrls,
} from "../lib/indexnow.mjs";

const page = (body, extra = "") => `<html><head><title>About — Lubo Bali</title>
<meta name="description" content="Who Lubo is."/>${extra}
<script src="/_next/static/chunks/a1b2.js"></script></head>
<body><main><h1>About</h1><p>Data &amp; AI engineer.</p></main>${body}</body></html>`;

test("each sitemap URL maps to its file in the static export", () => {
  assert.equal(pageFile("https://lubobali.com/"), "index.html");
  assert.equal(pageFile("https://lubobali.com"), "index.html");
  assert.equal(pageFile("https://lubobali.com/about"), "about.html");
  assert.equal(pageFile("https://lubobali.com/projects/briefme-ai"), "projects/briefme-ai.html");
});

test("reads every <loc> from the sitemap", () => {
  const xml = `<urlset><url><loc>https://lubobali.com/</loc></url>
<url><loc>https://lubobali.com/about</loc></url></urlset>`;
  assert.deepEqual(sitemapUrls(xml), ["https://lubobali.com/", "https://lubobali.com/about"]);
});

test("a rebuild of the same page has the same fingerprint (scripts and build ids ignored)", () => {
  const a = page(`<script>self.__next_f.push([1,"build-1"])</script>`);
  const b = page(`<script>self.__next_f.push([1,"build-2"])</script>`).replace("a1b2", "c3d4");
  assert.equal(pageFingerprint(a), pageFingerprint(b));
});

test("the CSP meta (new script hashes each build) does not change the fingerprint", () => {
  const csp = (h) => `<meta http-equiv="Content-Security-Policy" content="script-src 'sha256-${h}='"/>`;
  assert.equal(pageFingerprint(page("", csp("aaa"))), pageFingerprint(page("", csp("bbb"))));
});

test("new words, a new title or a new description change the fingerprint", () => {
  const base = pageFingerprint(page(""));
  assert.notEqual(pageFingerprint(page("<p>Updated Oct 26</p>")), base);
  assert.notEqual(pageFingerprint(page("").replace("About —", "About me —")), base);
  assert.notEqual(pageFingerprint(page("").replace("Who Lubo is.", "Who Lubo is now.")), base);
});

test("only pages that are new or changed since the last send are sent", () => {
  const sent = { "https://lubobali.com/": "h1", "https://lubobali.com/about": "h2", "https://lubobali.com/old": "h9" };
  const now = { "https://lubobali.com/": "h1", "https://lubobali.com/about": "h3", "https://lubobali.com/new": "h4" };
  assert.deepEqual(changedUrls(sent, now), ["https://lubobali.com/about", "https://lubobali.com/new"]);
  assert.deepEqual(changedUrls({}, now).length, 3); // first send = every page
  assert.deepEqual(changedUrls(now, now), []);
});

test("the key file is found by its shape; none or two is an error", () => {
  const key = "0123456789abcdef0123456789abcdef";
  assert.equal(findKey([`${key}.txt`, "llms.txt", "og.png"]), key);
  assert.throws(() => findKey(["llms.txt"]), /no IndexNow key file/);
  assert.throws(() => findKey([`${key}.txt`, `${"f".repeat(32)}.txt`]), /2 IndexNow key files/);
});

test("the site carries exactly one key file, and it holds its own name", () => {
  const key = findKey(readdirSync(new URL("../../public/", import.meta.url)));
  assert.equal(readFileSync(new URL(`../../public/${key}.txt`, import.meta.url), "utf8").trim(), key);
});

test("the message names the host, the key and where the key lives", () => {
  const key = "0123456789abcdef0123456789abcdef";
  assert.match(INDEXNOW_ENDPOINT, /^https:\/\/api\.indexnow\.org\/indexnow$/);
  assert.deepEqual(payload("https://lubobali.com", key, ["https://lubobali.com/about"]), {
    host: "lubobali.com",
    key,
    keyLocation: `https://lubobali.com/${key}.txt`,
    urlList: ["https://lubobali.com/about"],
  });
});

test("CI sends only from production, after Lighthouse, and never fails the deploy", () => {
  const wf = readFileSync(new URL("../../.forgejo/workflows/build-and-deploy.yml", import.meta.url), "utf8");
  const step = wf.slice(wf.indexOf("- name: IndexNow"));
  assert.ok(wf.indexOf("- name: Lighthouse gate") < wf.indexOf("- name: IndexNow"));
  assert.match(step, /if: env\.SITE_ENV == 'prod'/);
  assert.match(step, /indexnow\.mjs out "\$DEPLOY_ROOT\/indexnow-sent\.json" "\$SITE_URL" \|\| echo/);
});
