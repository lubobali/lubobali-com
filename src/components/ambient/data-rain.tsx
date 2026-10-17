import { readFileSync } from "node:fs";
import { join } from "node:path";

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

export function DataRain({ className = "" }: { className?: string }) {
  const layers = Object.entries(tiles());
  // No preload on purpose: the rain fades in (globals.css), so it is not
  // the LCP element, and early tile downloads only slowed the simulated
  // phone LCP (Lighthouse counts every request started before first paint).
  return (
    <div aria-hidden className={`ambient ambient-rain ${className}`}>
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
