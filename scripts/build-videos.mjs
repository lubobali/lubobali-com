// Build-time video step (Phase 3 H4), same idea as build-images.mjs:
// assets/videos/<name>.mp4 + <name>-poster.webp (not served)
//   -> public/video/<name>.<hash>.mp4 and <name>-poster.<hash>.webp
//   -> src/generated/videos.json (URLs + size for <video>)
// <hash> = content fingerprint, so nginx can cache /video/ for a year.
// Videos are encoded once by hand (ffmpeg, see assets/videos/README.md);
// this script only copies, fingerprints and checks the size budget.
// Optional captions: <name>.en.vtt -> public/video/<name>-captions.<hash>.vtt.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url);
const SRC = new URL("assets/videos/", ROOT);
const OUT = new URL("public/video/", ROOT);
const MB = 1024 * 1024;

// Video name -> pixel size (written into <video width height>, no layout
// shift) + size budget. Autoplay loops download on view: 1.5 MB (research:
// 1-1.5 MB). Click-to-play videos download only after a click
// (preload="none"), so they may be bigger.
const VIDEOS = {
  "lubot-demo-loop": { width: 1024, height: 768, budget: 1.5 * MB },
  // 1080p (Lubo: 720p looked soft full screen), streams from the click on.
  "lubo-intro": { width: 1920, height: 1080, budget: 30 * MB },
};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await mkdir(new URL("src/generated/", ROOT), { recursive: true });

const files = new Set(await readdir(SRC));
const manifest = {};
let failed = false;

async function publish(file) {
  const data = await readFile(new URL(file, SRC));
  const hash = createHash("sha256").update(data).digest("hex").slice(0, 8);
  const name = file.replace(/\.en\.vtt$/, "-captions.vtt").replace(/\.(mp4|webp|vtt)$/, `.${hash}.$1`);
  await copyFile(new URL(file, SRC), new URL(name, OUT));
  return { src: `/video/${name}`, bytes: data.length };
}

for (const [slug, { budget, ...size }] of Object.entries(VIDEOS)) {
  for (const f of [`${slug}.mp4`, `${slug}-poster.webp`]) {
    if (!files.has(f)) throw new Error(`assets/videos/${f} is missing`);
  }
  const video = await publish(`${slug}.mp4`);
  const poster = await publish(`${slug}-poster.webp`);
  const captions = files.has(`${slug}.en.vtt`) ? (await publish(`${slug}.en.vtt`)).src : undefined;
  manifest[slug] = { ...size, src: video.src, poster: poster.src, ...(captions && { captions }) };
  const kb = (b) => `${(b / 1024).toFixed(0)} KB`;
  console.log(`${kb(video.bytes).padStart(8)}  ${video.src}\n${kb(poster.bytes).padStart(8)}  ${poster.src}`);
  if (video.bytes > budget) {
    console.log(`FAIL  ${slug}.mp4 is ${kb(video.bytes)} > ${kb(budget)} budget`);
    failed = true;
  }
}

await writeFile(new URL("src/generated/videos.json", ROOT), JSON.stringify(manifest, null, 2) + "\n");
console.log(failed ? "videos: over budget" : `videos: ${Object.keys(VIDEOS).length} ok`);
process.exit(failed ? 1 : 0);
