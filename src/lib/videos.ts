import { readFileSync } from "node:fs";
import { join } from "node:path";

// Manifest built by scripts/build-videos.mjs before `next build` (not
// committed). Server-only: read at build time.
export type VideoEntry = { src: string; poster: string; width: number; height: number };

let manifest: Record<string, VideoEntry> | undefined;

export function getVideo(name: string): VideoEntry {
  manifest ??= JSON.parse(
    readFileSync(join(process.cwd(), "src/generated/videos.json"), "utf8"),
  ) as Record<string, VideoEntry>;
  const video = manifest[name];
  if (!video) throw new Error(`unknown video "${name}"`);
  return video;
}
