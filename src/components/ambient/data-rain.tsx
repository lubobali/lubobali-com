import { readFileSync } from "node:fs";
import { join } from "node:path";
import { preload } from "react-dom";

// "Data rain": columns of real-looking code/data fragments rising from
// bottom to top (Matrix style). The tiles are static SVG files made at
// build time (scripts/build-rain.mjs, pattern in scripts/lib/rain.mjs),
// cached for a year under /img/; the characters are NOT page text (search
// + AI bots never read them). Animation is CSS (globals.css, .ambient-rain),
// transform only; static when the OS asks for reduced motion. No pause
// button on purpose (Lubo, Phase 3 H3): the rain always moves otherwise.

type Tile = { src: string; width: number; height: number };

// Manifest written by build-rain.mjs before `next build`. Server-only.
function tiles(): Record<string, Tile> {
  return JSON.parse(readFileSync(join(process.cwd(), "src/generated/rain.json"), "utf8"));
}

export function DataRain() {
  const layers = Object.entries(tiles());
  // The rain is the biggest thing on screen, so Chrome counts it as the
  // Largest Contentful Paint. Preload (a <link> in <head>) starts the tile
  // downloads with the CSS instead of after it (measured in H3: LCP 2.4 s
  // without). Far layer first: it paints the largest area.
  for (const [name, t] of layers) {
    preload(t.src, { as: "image", fetchPriority: name === "far" ? "high" : "auto" });
  }
  return (
    <div aria-hidden className="ambient ambient-rain">
      {layers.map(([name, t]) => (
        <div
          key={name}
          className={`ambient-rain-layer ambient-rain-${name}`}
          style={{
            backgroundImage: `url("${t.src}")`,
            backgroundSize: `${t.width}px ${t.height}px`,
            height: `calc(100% + ${t.height}px)`,
            ["--rain-shift" as string]: `-${t.height}px`,
          }}
        />
      ))}
    </div>
  );
}
