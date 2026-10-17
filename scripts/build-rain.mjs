// Writes the data-rain tiles as static files (Phase 3 H3): before, each page
// carried them as data: URIs in the HTML (and again in the RSC payload).
// public/img/rain-<layer>-<width>.<hash>.svg -> photo-style name under /img/,
//                                        so nginx caches it for a year
// src/generated/rain.json             -> sizes + URLs for data-rain.tsx
// Runs after build-images.mjs (which empties public/img/).
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { COL, LAYERS, rainSvg } from "./lib/rain.mjs";

const ROOT = new URL("..", import.meta.url);
await mkdir(new URL("public/img/", ROOT), { recursive: true });
await mkdir(new URL("src/generated/", ROOT), { recursive: true });

const manifest = {};
for (const layer of LAYERS) {
  const svg = rainSvg(layer);
  const hash = createHash("sha256").update(svg).digest("hex").slice(0, 8);
  const name = `rain-${layer.name}-${layer.cols * COL}.${hash}.svg`; // same pattern as photos (nginx 1-year cache)
  await writeFile(new URL(`public/img/${name}`, ROOT), svg);
  manifest[layer.name] = { src: `/img/${name}`, width: layer.cols * COL, height: layer.height };
  console.log(`${(svg.length / 1024).toFixed(0).padStart(5)} KB  ${name}`);
}
await writeFile(new URL("src/generated/rain.json", ROOT), JSON.stringify(manifest, null, 2) + "\n");
console.log(`rain: ${LAYERS.length} tiles`);
