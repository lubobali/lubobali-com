import type { CaseStudy } from "@/lib/case-studies/types";

// One real laundering ring, drawn (Phase 4 C4): there is no product screen
// yet, so the first screen shows the idea itself. Accounts sit on a circle,
// money flows clockwise and comes back; a light travels the loop (hidden
// for reduced motion). Real text in the SVG; styles: case-study.css .cs-ring.
const C = 200; // centre of the drawing (viewBox widened for the side ids)
const R = 128; // radius of the ring

const at = (deg: number, r = R) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: +(C + r * Math.cos(a)).toFixed(1), y: +(C + r * Math.sin(a)).toFixed(1) };
};

export function Ring({ ring }: { ring: NonNullable<CaseStudy["ring"]> }) {
  const n = ring.hops.length;
  const step = 360 / n;
  const gap = 14; // degrees kept clear around each account dot
  const arcs = ring.hops.map((_, i) => {
    const a = at(i * step + gap);
    const b = at((i + 1) * step - gap);
    return `M${a.x},${a.y} A${R},${R} 0 0 1 ${b.x},${b.y}`;
  });
  const loop = `M${C},${C - R} A${R},${R} 0 1 1 ${C - 0.01},${C - R}Z`;
  const label = `A laundering ring: ${ring.hops
    .map((h, i) => `${h.from} sends ${h.amount} to ${ring.hops[(i + 1) % n].from}`)
    .join(", ")}. The money ends where it started.`;
  return (
    <figure className="cs-screen flex flex-col gap-3">
      <div className="cs-screen-frame cs-ring rounded-2xl p-4 sm:p-6">
        <svg viewBox="-30 0 460 400" role="img" aria-label={label} className="mx-auto block h-auto w-full max-w-md">
          <defs>
            <marker id="cs-ring-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M1,1 L9,5 L1,9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </marker>
          </defs>
          <circle className="cs-ring-halo" cx={C} cy={C} r={R} fill="none" />
          {arcs.map((d) => (
            <path key={d} d={d} className="cs-ring-arc" fill="none" markerEnd="url(#cs-ring-arrow)" />
          ))}
          {ring.hops.map((h, i) => {
            const dot = at(i * step);
            const amt = at(i * step + step / 2, R + 34);
            // Account ids sit outside the ring, away from the centre text.
            const id = at(i * step, R + 24);
            const anchor = id.x < C - 1 ? "end" : id.x > C + 1 ? "start" : "middle";
            return (
              <g key={h.from}>
                <circle cx={dot.x} cy={dot.y} r="9" className="cs-ring-node" />
                <text x={id.x} y={id.y + 4} textAnchor={anchor} className="cs-ring-id">
                  {h.from}
                </text>
                <text x={amt.x} y={amt.y + 5} textAnchor="middle" className="cs-ring-amount">
                  {h.amount}
                </text>
              </g>
            );
          })}
          <text x={C} y={C - 6} textAnchor="middle" className="cs-ring-centre">
            {n} ordinary transfers
          </text>
          <text x={C} y={C + 18} textAnchor="middle" className="cs-ring-centre cs-ring-centre--strong">
            1 laundering ring
          </text>
          <circle r="5" className="cs-ring-light">
            <animateMotion dur="6s" repeatCount="indefinite" path={loop} />
          </circle>
        </svg>
      </div>
      <figcaption className="cs-screen-caption text-xs tracking-wide">{ring.caption}</figcaption>
    </figure>
  );
}
