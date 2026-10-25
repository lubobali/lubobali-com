// Strict Content-Security-Policy for the static export (Phase 2 P10).
//
// Next.js puts small inline scripts in every page. A static site can't use
// nonces, so we allow exactly those scripts by their sha256 hash, per page,
// in a <meta> policy written into each HTML file after the build. The hash
// and the HTML ship together in one release, so they can't drift apart.
// A <meta> policy can't set frame-ancestors / reporting: those stay in the
// nginx header (snippets/lubobali-headers.conf).
import { createHash } from "node:crypto";

const sha256 = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;

// Inline <script> without src, except JSON-LD (data, never executed).
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;
const STYLE_ELEMENT = /<style[^>]*>([\s\S]*?)<\/style>/g;
const META = /<meta http-equiv="Content-Security-Policy" content="([^"]*)"\/>/;
// The visit tracker (Phase 8 T3, scripts/lib/track.mjs) names where it sends.
const TRACKER = /<script id="lubo-track" data-endpoint="([^"]+)"/;

/** sha256 sources for every inline script and <style> element, in order, once each. */
export function inlineHashes(html) {
  const hashes = (re) => [...new Set([...html.matchAll(re)].map((m) => sha256(m[1])))];
  return { scripts: hashes(INLINE_SCRIPT), styles: hashes(STYLE_ELEMENT) };
}

/** connect-src: same origin, plus the tracker's endpoint origin when the
 * page has the tracker. Only https is accepted. */
export function connectSources(html) {
  const endpoint = html.match(TRACKER)?.[1];
  if (!endpoint) return "'self'";
  const url = new URL(endpoint);
  if (url.protocol !== "https:") throw new Error(`tracker endpoint must be https: ${endpoint}`);
  return `'self' ${url.origin}`;
}

export function buildPolicy(html) {
  const { scripts, styles } = inlineHashes(html);
  const list = (hashes) => (hashes.length ? " " + hashes.join(" ") : "");
  return [
    "default-src 'self'",
    `script-src 'self'${list(scripts)}`,
    `style-src 'self'${list(styles)}`,
    // style="..." attributes: Motion's start state and the data-rain
    // backgrounds. Can't run code; low risk on a site with no user input.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    // Same origin (the /api/ Blueprint tool) + the visit tracker's one
    // LuBot origin when the page has it (Phase 8 T3).
    `connect-src ${connectSources(html)}`,
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/** Insert the page's policy right after <meta charSet>, so it applies to
 * every script and style that follows. */
export function injectPolicy(html) {
  if (META.test(html)) throw new Error("page already has a CSP meta tag");
  const charset = '<meta charSet="utf-8"/>';
  const at = html.indexOf(charset);
  if (at === -1) throw new Error('no <meta charSet="utf-8"/> to anchor the CSP meta');
  const meta = `<meta http-equiv="Content-Security-Policy" content="${buildPolicy(html)}"/>`;
  return html.slice(0, at + charset.length) + meta + html.slice(at + charset.length);
}

/** Problems with one built page (empty = OK). */
export function checkPage(html) {
  const m = html.match(META);
  if (!m) return ["no CSP meta tag"];
  const p = [];
  const before = html.slice(0, m.index);
  if (/<script|<style|<link/.test(before)) p.push("CSP meta must come before every script, style and link");
  const policy = m[1];
  const scriptSrc = policy.match(/script-src([^;]*)/)?.[1] ?? "";
  if (/unsafe-inline|unsafe-eval|\*/.test(scriptSrc)) p.push(`script-src is not strict: ${scriptSrc.trim()}`);
  const { scripts, styles } = inlineHashes(html);
  for (const h of scripts) if (!scriptSrc.includes(h)) p.push(`inline script ${h} is not allowed by the policy`);
  const connectSrc = (policy.match(/connect-src ([^;]*)/)?.[1] ?? "").trim();
  if (connectSrc !== connectSources(html)) p.push(`connect-src is "${connectSrc}", the page needs "${connectSources(html)}"`);
  const styleSrc = policy.match(/style-src ([^;]*)/)?.[1] ?? "";
  for (const h of styles) if (!styleSrc.includes(h)) p.push(`<style> ${h} is not allowed by the policy`);
  return p;
}
