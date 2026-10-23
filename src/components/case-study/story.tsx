import "./case-study.css";
import "./story.css";
import { Part } from "./sections";
import type { CaseStudy } from "@/lib/case-studies/types";

// The story parts of a case study without product screens (Phase 4 C4,
// GraphGuard, Lubo: "full story with visuals"): a person's day with the
// alert queue drawn as dots, and the shapes the model learns to see.
// Drawn in SVG at build time: no images, no requests. Styles: story.css.

const COLS = 40;
const CELL = 10;

// Deterministic 0..1 noise (integer hash, no visible stripes), so every
// build draws the same picture.
const noise = (i: number) => {
  let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};

// Which alerts light up. Ranked: a weighted draw (key = u^(1/w)) with the
// weight fading down the queue, so real cases crowd the top and thin out
// smoothly (that is what ranking does). Random: anywhere.
function litAlerts(capacity: number, hits: number, ranked: boolean): number[] {
  if (!ranked) return Array.from({ length: hits }, (_, k) => Math.floor(noise(k + 7) * capacity));
  return Array.from({ length: capacity }, (_, i) => ({ i, key: Math.pow(noise(i + 1), 1 / Math.exp(-i / 260)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, hits)
    .map((a) => a.i);
}

function Alerts({ id, capacity, hits, ranked }: { id: string; capacity: number; hits: number; ranked: boolean }) {
  const rows = Math.ceil(capacity / COLS);
  const lit = litAlerts(capacity, hits, ranked);
  return (
    <svg viewBox={`0 0 ${COLS * CELL} ${rows * CELL}`} className="block h-auto w-full" aria-hidden="true">
      <defs>
        <pattern id={id} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
          <circle cx={CELL / 2} cy={CELL / 2} r="2.2" className="cs-dot" />
        </pattern>
      </defs>
      <rect width={COLS * CELL} height={rows * CELL} fill={`url(#${id})`} />
      <g className="cs-dots-lit">
        {lit.map((i) => (
          <circle key={i} cx={(i % COLS) * CELL + CELL / 2} cy={Math.floor(i / COLS) * CELL + CELL / 2} r="3.4" />
        ))}
      </g>
    </svg>
  );
}

export function Queue({ cs }: { cs: CaseStudy }) {
  const q = cs.queue;
  if (!q) return null;
  const sides = [
    { key: "random", label: "Random order", hits: q.random, ranked: false, strong: false },
    { key: "model", label: `${cs.name}'s order`, hits: q.model, ranked: true, strong: true },
  ];
  const n = q.capacity.toLocaleString("en-US");
  return (
    <Part id="the-queue" title={q.title}>
      <p className="max-w-3xl text-lg text-muted-foreground">{q.intro}</p>
      <ol className="grid gap-8 md:grid-cols-3">
        {q.moments.map((m) => (
          <li key={m.title} className="cs-moment flex flex-col gap-2">
            <span className="cs-when text-sm font-semibold tracking-wide uppercase">{m.when}</span>
            <h3 className="text-xl font-semibold text-balance">{m.title}</h3>
            <p className="text-muted-foreground">{m.text}</p>
          </li>
        ))}
      </ol>
      <div className="grid gap-6 lg:grid-cols-2">
        {sides.map((s) => (
          <figure key={s.key} className={`cs-queue flex flex-col gap-4 rounded-2xl p-5 sm:p-6 ${s.strong ? "cs-queue--strong" : ""}`}>
            <figcaption className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="text-sm font-semibold tracking-wide uppercase">{s.label}</span>
              <span className="sm:text-right">
                <span className="cs-queue-num text-3xl font-semibold tabular-nums sm:text-4xl">{s.hits}</span>
                <span className="text-sm text-muted-foreground"> real of {n}</span>
              </span>
            </figcaption>
            <Alerts id={`cs-dots-${s.key}`} capacity={q.capacity} hits={s.hits} ranked={s.ranked} />
          </figure>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Each dot is one of {q.person}&apos;s {n} alerts, in the order they are worked (left to right, top to bottom). Lit = real laundering.
        The counts are measured; where each lit dot sits is drawn for illustration.
      </p>
    </Part>
  );
}

// Each shape: accounts (x, y) and the transfers between them (from, to).
const SHAPES: Record<string, { nodes: [number, number][]; edges: [number, number][] }> = {
  cycle: { nodes: [[100, 18], [168, 60], [100, 102], [32, 60]], edges: [[0, 1], [1, 2], [2, 3], [3, 0]] },
  "fan-out": { nodes: [[30, 60], [165, 14], [165, 45], [165, 76], [165, 107]], edges: [[0, 1], [0, 2], [0, 3], [0, 4]] },
  "scatter-gather": { nodes: [[24, 60], [100, 18], [100, 60], [100, 102], [176, 60]], edges: [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4]] },
};

function Shape({ kind }: { kind: keyof typeof SHAPES }) {
  const { nodes, edges } = SHAPES[kind];
  const marker = `cs-arrow-${kind}`;
  const pad = 12; // keep arrows off the account dots
  return (
    <svg viewBox="0 0 200 120" className="cs-shape block h-auto w-full" aria-hidden="true">
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M1,1 L9,5 L1,9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </marker>
      </defs>
      {edges.map(([a, b]) => {
        const [x1, y1] = nodes[a];
        const [x2, y2] = nodes[b];
        const len = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / len;
        const uy = (y2 - y1) / len;
        return (
          <line
            key={`${a}-${b}`}
            x1={+(x1 + ux * pad).toFixed(1)}
            y1={+(y1 + uy * pad).toFixed(1)}
            x2={+(x2 - ux * pad).toFixed(1)}
            y2={+(y2 - uy * pad).toFixed(1)}
            className="cs-shape-edge"
            markerEnd={`url(#${marker})`}
          />
        );
      })}
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" className="cs-ring-node" />
      ))}
    </svg>
  );
}

export function Shapes({ cs }: { cs: CaseStudy }) {
  if (!cs.shapes) return null;
  return (
    <Part id="the-shapes" title="The shapes it learns to see">
      <p className="max-w-3xl text-lg text-muted-foreground">{cs.shapes.intro}</p>
      <ul className="grid gap-6 md:grid-cols-3">
        {cs.shapes.items.map((s) => (
          <li key={s.kind} className="cs-card cs-problem flex flex-col gap-3 rounded-2xl p-6">
            <div className="cs-shape-box rounded-xl p-4">
              <Shape kind={s.kind} />
            </div>
            <h3 className="text-xl font-semibold">{s.name}</h3>
            <p className="text-muted-foreground">{s.text}</p>
            <p className="cs-result mt-auto pt-3 text-sm font-medium">{s.count} in the data</p>
          </li>
        ))}
      </ul>
    </Part>
  );
}
