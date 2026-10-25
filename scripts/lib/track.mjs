// Visit tracker build step (Phase 8 T3). After `next build`, before the CSP
// step: puts scripts/lib/track.js inside every page, right before </body>,
// as <script id="lubo-track" data-endpoint="TRACK_URL">. Inline on purpose:
// zero extra requests (the home page is at the 20-request budget), and the
// CSP step then allows it by hash and adds exactly the endpoint's origin to
// connect-src (scripts/lib/csp.mjs).
import { readFileSync } from "node:fs";

const SOURCE = new URL("./track.js", import.meta.url);

/** The tracker as shipped: comment lines and indentation removed. */
export function trackerSource(source = readFileSync(SOURCE, "utf8")) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//") && !line.startsWith("/*"))
    .join("\n");
}

/** TRACK_URL: not set = no tracker; set but wrong = the build fails. */
export function trackEndpoint(value) {
  if (!value) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`TRACK_URL is not a URL: ${value}`);
  }
  if (url.protocol !== "https:" || url.pathname !== "/api/track-click" || url.search || url.hash)
    throw new Error(`TRACK_URL must be https://<host>/api/track-click, got: ${value}`);
  return url.href;
}

export function injectTracker(html, endpoint, source = trackerSource()) {
  if (html.includes('id="lubo-track"')) throw new Error("page already has the tracker");
  const at = html.lastIndexOf("</body>");
  if (at === -1) throw new Error("no </body> to put the tracker before");
  const tag = `<script id="lubo-track" data-endpoint="${endpoint}">${source}</script>`;
  return html.slice(0, at) + tag + html.slice(at);
}
