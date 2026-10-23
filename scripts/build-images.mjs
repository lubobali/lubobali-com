// Build-time image pipeline (static export has no image optimizer).
// assets/photos/* (originals, not served) -> public/img/<slug>-<w>.<hash>.{avif,webp}
// <hash> = fingerprint of photo + settings + sharp version, so a changed
// photo gets a new URL and /img/ can be cached for a year (nginx).
// + src/generated/images.json (width/height/srcsets for <Picture>).
// Never upscales. Metadata (EXIF/GPS) is stripped. Fails if the hero
// is over budget at mobile width.
// Usage: node scripts/build-images.mjs   (runs before `next build`)
// IMAGE_CACHE=<dir>: reuse a file with the same name from <dir> (CI points
// it at the live release's /img/). The name holds the fingerprint, so the
// same name = the same bytes; only new or changed pictures are encoded
// (Phase 5 P5.2b: encoding was 33 of the 43 s build, before 35+ projects).
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url);
const SRC = new URL("assets/photos/", ROOT);
const OUT = new URL("public/img/", ROOT);
const MANIFEST = new URL("src/generated/images.json", ROOT);
const CACHE = process.env.IMAGE_CACHE;

// Original file -> public name (SEO-friendly, no spaces).
const PHOTOS = {
  "DSC04525.JPG": "lubo-bali-portrait", // home hero
  // About (Phase 6, Lubo picked 2026-10-22): the gray-suit portrait with its
  // white studio background swapped to the site navy (edge-only fill, so the
  // white collar stays), and the basketball photo (dark studio, no edit).
  "lubo-about-navy.jpg": "lubo-bali-about",
  "DSC04614.jpg": "lubo-bali-basketball",
  "DSC05154 copy 2.jpg": "lubo-bali-headshot", // contact
  // Testimonial avatar (H10): Zach's LinkedIn photo, cropped to 240 px
  // (shown at 64 px, so 240 covers 3x screens). Used with his OK.
  "zach-wilson.png": "zach-wilson",
  "matthew-hamann.png": "matthew-hamann", // same, from his LinkedIn photo
  // "Ask Lubo" chat avatar (Phase 6 P6.8): head and shoulders cropped to
  // 240 px from lubo-about-navy.jpg (shown at ~44 px).
  "lubo-avatar.png": "lubo-bali-avatar",
  // LuBot case study (Phase 4): real lubot.ai screens, demo data, taken
  // 2026-10-20 at 2x as a visitor (no browser bar, no trial badge).
  "lubot-stock-chart.png": "lubot-stock-chart",
  "lubot-ai-noticed.png": "lubot-ai-noticed",
  "lubot-portfolio.png": "lubot-portfolio",
  // Project pages (Phase 5): screens from Lubo's own public repos only
  // (Framer's stock photos are never reused).
  "mergeai-dashboard.png": "mergeai-dashboard", // github.com/lubobali/mergeAI screenshots/
  "ticketdesk-app.png": "ticketdesk-app", // github.com/lubobali/TicketDesk-AI screenshots/01-app.png (example data)
  // Lubo's public Tableau dashboard (made-up data), static image from Tableau Public.
  "cvs-contractor-dashboard.png": "cvs-contractor-dashboard",
};
const WIDTHS = [400, 640, 960, 1280, 1920, 2560];
const FORMATS = {
  avif: { quality: 60, effort: 4 },
  webp: { quality: 80, effort: 4 },
};
const HERO = "lubo-bali-portrait";
const HERO_MOBILE_WIDTH = 640;
const HERO_BUDGET = 200 * 1024; // bytes, per format, at mobile width

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await mkdir(new URL("src/generated/", ROOT), { recursive: true });

const manifest = {};
const rows = [];
let failed = false;
let reused = 0;

for (const [file, slug] of Object.entries(PHOTOS)) {
  const input = await readFile(new URL(encodeURIComponent(file), SRC));
  // rotate() applies the EXIF orientation before metadata is dropped.
  const meta = await sharp(input).rotate().metadata();
  const [w0, h0] =
    (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  const widths = WIDTHS.filter((w) => w < w0);
  widths.push(w0); // always include the original width, never upscale

  const entry = { width: w0, height: h0, sources: {} };
  for (const [fmt, options] of Object.entries(FORMATS)) {
    entry.sources[fmt] = [];
    const hash = createHash("sha256")
      .update(input)
      .update(JSON.stringify([fmt, options, sharp.versions.sharp, sharp.versions.vips]))
      .digest("hex")
      .slice(0, 8);
    for (const w of widths) {
      const name = `${slug}-${w}.${hash}.${fmt}`;
      const path = new URL(name, OUT);
      const cached = CACHE && (await copyFile(`${CACHE}/${name}`, path).then(() => true, () => false));
      if (cached) reused++;
      else await sharp(input).rotate().resize({ width: w })[fmt](options).toFile(path.pathname);
      const bytes = (await stat(path)).size;
      entry.sources[fmt].push({ src: `/img/${name}`, width: w });
      rows.push([name, bytes]);
      if (slug === HERO && w === Math.min(HERO_MOBILE_WIDTH, w0) && bytes > HERO_BUDGET) {
        console.log(`FAIL  ${name} is ${(bytes / 1024).toFixed(0)} KB > ${HERO_BUDGET / 1024} KB budget`);
        failed = true;
      }
    }
  }
  manifest[slug] = entry;
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
for (const [name, bytes] of rows) {
  console.log(`${(bytes / 1024).toFixed(0).padStart(5)} KB  ${name}`);
}
console.log(failed ? "images: over budget" : `images: ${rows.length} files (${reused} reused), hero within budget`);
process.exit(failed ? 1 : 0);
