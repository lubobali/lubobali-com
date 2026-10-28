// A note's own fingerprint (Phase 9 P9.7, Lubo picked concept C): contour
// rings bent by waves seeded from the note's name + date, so every note
// gets its own shape and the same note always gets the same one. Colour =
// topic; one bright dot per digit of the note's big number. Pure and
// deterministic: drawn inline on the page and into the share card.
import type { Cluster } from "./note";

export const CLUSTER_HUE: Record<Cluster, string> = {
  "data-pipelines": "#38bdf8", // sky
  agents: "#9f8ef4", // violet
  rag: "#8ccaf0", // ice
  mcp: "#2dd4bf", // teal
  "ai-cost": "#c6f36d", // lime
};

export type FingerprintOptions = {
  id: string; // prefix for the SVG ids: two drawings on one page never clash
  cx: number;
  cy: number;
  scale: number;
  hue: string;
  dots: number;
  rings?: number;
  points?: number;
};

/** FNV-1a then xorshift32: a tiny seeded random, the same on every machine. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/** SVG markup (defs + rings + dots) for one note's fingerprint. */
export function fingerprint(seed: string, o: FingerprintOptions): string {
  const rand = seeded(seed);
  const rings = o.rings ?? 24;
  const points = o.points ?? 40;
  const waves = [1, 2, 3, 5].map((k) => ({ k, a: ((0.02 + rand() * 0.07) / k) * 2, p: rand() * 6.2832, d: (rand() - 0.5) * 0.35 }));
  const at = (i: number, t: number): [number, number] => {
    const r = (16 + i * 13) * o.scale;
    let k = 1;
    for (const w of waves) k += w.a * Math.sin(w.k * t + w.p + i * w.d);
    return [Math.round(o.cx + r * k * Math.cos(t) * 1.18), Math.round(o.cy + r * k * Math.sin(t))];
  };
  const paths: string[] = [];
  for (let i = 0; i < rings; i++) {
    const pts = Array.from({ length: points }, (_, s) => at(i, (s / points) * 6.2832));
    // A smooth closed curve: through the midpoints, each point a control point.
    const mid = (a: number[], b: number[]) => `${Math.round((a[0] + b[0]) / 2)} ${Math.round((a[1] + b[1]) / 2)}`;
    let d = `M${mid(pts[points - 1], pts[0])}`;
    pts.forEach((p, s) => (d += `Q${p[0]} ${p[1]} ${mid(p, pts[(s + 1) % points])}`));
    const opacity = (0.85 - i * (0.6 / rings)).toFixed(2);
    paths.push(`<path d="${d}Z" stroke-width="${i % 5 === 0 ? 1.6 : 0.9}" stroke-opacity="${opacity}"/>`);
  }
  const dots = Array.from({ length: o.dots }, (_, j) => {
    const [x, y] = at(Math.min(5 + j * 5, rings - 1), rand() * 6.2832);
    return `<circle cx="${x}" cy="${y}" r="4.5" fill="${o.hue}"/><circle cx="${x}" cy="${y}" r="11" fill="none" stroke="${o.hue}" stroke-opacity=".5"/>`;
  });
  return (
    `<defs><linearGradient id="${o.id}-grad" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#3a6ae0"/><stop offset=".55" stop-color="${o.hue}"/><stop offset="1" stop-color="#f8fafc"/>` +
    `</linearGradient></defs><g fill="none" stroke="url(#${o.id}-grad)">${paths.join("")}</g>${dots.join("")}`
  );
}
