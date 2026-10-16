import { readFileSync } from "node:fs";
import { join } from "node:path";
import { absoluteUrl } from "@/lib/site";

// Manifest built by scripts/build-images.mjs before `next build` (not
// committed). Server-only: read at build time.
export type ImageSource = { src: string; width: number };
export type ImageEntry = {
  width: number;
  height: number;
  sources: { avif: ImageSource[]; webp: ImageSource[] };
};

let manifest: Record<string, ImageEntry> | undefined;

export function getImage(name: string): ImageEntry {
  manifest ??= JSON.parse(
    readFileSync(join(process.cwd(), "src/generated/images.json"), "utf8"),
  ) as Record<string, ImageEntry>;
  const image = manifest[name];
  if (!image) throw new Error(`unknown image "${name}"`);
  return image;
}

/** WebP fallback: first width >= 960, else the largest. Every browser and
 * crawler can read it. */
export function fallbackSource(image: ImageEntry): ImageSource {
  return image.sources.webp.find((s) => s.width >= 960) ?? image.sources.webp.at(-1)!;
}

/** Absolute URL of the photo, for JSON-LD and other machine readers. */
export const imageUrl = (name: string) => absoluteUrl(fallbackSource(getImage(name)).src);
