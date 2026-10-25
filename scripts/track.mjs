// node scripts/track.mjs out   (part of `pnpm build`, before csp.mjs inject)
// Puts the visit tracker inside every page when TRACK_URL is set (Phase 8
// T3). See scripts/lib/track.mjs.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { injectTracker, trackEndpoint, trackerSource } from "./lib/track.mjs";

const out = process.argv[2] ?? "out";
const endpoint = trackEndpoint(process.env.TRACK_URL);
if (!endpoint) {
  console.log("track: TRACK_URL not set, no tracker");
  process.exit(0);
}
const source = trackerSource();
const pages = (await readdir(out, { recursive: true })).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const path = join(out, file);
  await writeFile(path, injectTracker(await readFile(path, "utf8"), endpoint, source));
}
console.log(`track: tracker (${source.length} bytes) -> ${new URL(endpoint).origin}, ${pages.length} pages`);
