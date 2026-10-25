// node --test scripts/tests/csp.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { buildPolicy, checkPage, injectPolicy, inlineHashes } from "../lib/csp.mjs";

const sha = (s) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;
const BOOT = "(self.__next_f=self.__next_f||[]).push([0])";
const page = (extraHead = "", body = "") =>
  `<!DOCTYPE html><html><head><meta charSet="utf-8"/><link rel="stylesheet" href="/a.css"/>${extraHead}</head>` +
  `<body><script src="/_next/a.js" async=""></script><script>${BOOT}</script>` +
  `<script type="application/ld+json">{"name":"x"}</script>${body}</body></html>`;

test("inlineHashes: inline scripts + <style> elements, not src scripts or JSON-LD", () => {
  const html = page("<style>p{color:red}</style>", "<script>self.__next_f.push([1])</script>");
  const { scripts, styles } = inlineHashes(html);
  assert.deepEqual(scripts, [sha(BOOT), sha("self.__next_f.push([1])")]);
  assert.deepEqual(styles, [sha("p{color:red}")]);
});

test("inlineHashes: duplicates are listed once", () => {
  const html = page("", `<script>${BOOT}</script>`);
  assert.equal(inlineHashes(html).scripts.length, 1);
});

test("buildPolicy: strict scripts, no unsafe-inline for scripts", () => {
  const policy = buildPolicy(page());
  assert.match(policy, new RegExp(`script-src 'self' ${sha(BOOT).replace(/[+/]/g, "\\$&")}`));
  assert.doesNotMatch(policy.match(/script-src[^;]*/)[0], /unsafe/);
  assert.match(policy, /style-src-attr 'unsafe-inline'/);
  assert.match(policy, /object-src 'none'/);
  // Things a <meta> policy can't do live in the nginx header instead.
  assert.doesNotMatch(policy, /frame-ancestors|report-uri|report-to|sandbox/);
});

test("injectPolicy: meta goes right after <meta charSet>, before any script/style", () => {
  const html = injectPolicy(page());
  const meta = html.indexOf('http-equiv="Content-Security-Policy"');
  assert.ok(meta > html.indexOf('charSet="utf-8"'));
  assert.ok(meta < html.indexOf("<link"));
  assert.ok(meta < html.indexOf("<script"));
  assert.deepEqual(checkPage(html), []);
});

test("injectPolicy: refuses a page without <meta charSet> or with a policy already", () => {
  assert.throws(() => injectPolicy("<html><head></head></html>"), /charSet/);
  assert.throws(() => injectPolicy(injectPolicy(page())), /already/);
});

test("checkPage: no policy, a changed script, or late meta all fail", () => {
  assert.match(checkPage(page()).join(), /no CSP meta/);
  const tampered = injectPolicy(page()).replace(BOOT, "alert(1)");
  assert.match(checkPage(tampered).join(), /not allowed by the policy/);
  const late = page().replace("</head>", `<meta http-equiv="Content-Security-Policy" content="${buildPolicy(page())}"/></head>`);
  assert.match(checkPage(late).join(), /must come before/);
});

// Phase 8 T3: the visit tracker may send to exactly one more origin.
const TRACKER = '<script id="lubo-track" data-endpoint="https://staging.lubot.ai/api/track-click">(function(){})()</script>';

test("buildPolicy: no tracker = connect-src 'self' only", () => {
  assert.match(buildPolicy(page()), /connect-src 'self';/);
});

test("buildPolicy: the tracker's endpoint origin, and nothing more, joins connect-src", () => {
  assert.match(buildPolicy(page("", TRACKER)), /connect-src 'self' https:\/\/staging\.lubot\.ai;/);
});

test("checkPage: connect-src must match the tracker on the page", () => {
  const good = injectPolicy(page("", TRACKER));
  assert.deepEqual(checkPage(good), []);
  const widened = good.replace("connect-src 'self' https://staging.lubot.ai", "connect-src 'self' https://staging.lubot.ai https://evil.example");
  assert.match(checkPage(widened).join(), /connect-src/);
  const stale = injectPolicy(page()).replace("</body>", `${TRACKER}</body>`);
  assert.match(checkPage(stale).join(), /connect-src/);
});

test("a tracker endpoint that is not https is refused", () => {
  assert.throws(() => buildPolicy(page("", TRACKER.replace("https://", "http://"))), /tracker/);
});
