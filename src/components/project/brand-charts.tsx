import "./brand-card.css";
import "./brand-kit-2.css";
import "./brand-kit-3.css";
import "./brand-kit-4.css";
import "./brand-kit.css";
import "./project.css";
import type { ProjectPicture } from "@/lib/projects/model";

// The brand-card picture kit (P5.6, Lubo 2026-10-22: "a unique chart for
// every project, easy to remember"). Drawn in code from the project's real
// numbers: sharp on every screen, readable by screen readers and bots as
// text. Complete at rest; motion only when the visitor allows it.
// Styles: brand-kit.css (.bc-*).

type Gates = Extract<ProjectPicture, { kind: "gates" }>;
type Race = Extract<ProjectPicture, { kind: "race" }>;
type Rings = Extract<ProjectPicture, { kind: "rings" }>;

// Safety gates: the item falls through each gate; a gate that turns
// unwanted ones away shows a path leaving to the side. Then where it lands.
export function GatesArt({ picture }: { picture: Gates }) {
  return (
    <div className="flex flex-col gap-4">
      <ol className="bc-gates flex flex-col">
        {picture.gates.map((g, i) => (
          <li key={g.label} className="grid grid-cols-[3.25rem_1fr] items-center gap-3">
            <svg aria-hidden="true" viewBox="0 0 52 64" className="bc-gate-art h-16 w-13">
              <line x1="26" y1="0" x2="26" y2="64" className="bc-track" />
              <line x1="6" y1="34" x2="46" y2="34" className="bc-gate" />
              <circle cx="26" cy="16" r="3.5" className="bc-drop" style={{ animationDelay: `${i * 0.6}s` }} />
              {/* Gates turn bad items away, to the side. */}
              {g.turnsAway && <path d="M26 34 Q 34 40 44 54" className="bc-reject" />}
            </svg>
            <span className="flex min-w-0 flex-col">
              <span className="bc-gate-label">{g.label}</span>
              <span className="bc-muted text-sm">{g.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <ul className="flex flex-wrap gap-2 pl-15" aria-label="Where each email lands">
        {picture.outcomes.map((o) => (
          <li key={o} className="bc-pill">
            {o}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Before vs after: two bars on one scale, each made of the same stages,
// so you see which stage shrank. Totals are the sums of the stages.
export function RaceArt({ picture }: { picture: Race }) {
  const before = picture.stages.reduce((n, s) => n + s.before, 0);
  const after = picture.stages.reduce((n, s) => n + s.after, 0);
  const fmt = (n: number) => `${Math.round(n)} ${picture.unit}`;
  const bar = (label: string, total: number, run: "before" | "after") => (
    <div className="flex flex-col gap-2">
      <p className="flex items-baseline justify-between gap-3">
        <span className="bc-label">{label}</span>
        <span className="bc-total tabular-nums">{fmt(total)}</span>
      </p>
      <span className="bc-race-track flex h-5 overflow-hidden rounded-full" aria-hidden="true">
        <span className="bc-race-bar flex h-full" data-run={run} style={{ width: `${(total / before) * 100}%` }}>
          {picture.stages.map((s, i) => (
            <span key={s.label} className="bc-seg h-full" data-i={i % 7} style={{ width: `${(s[run] / total) * 100}%` }} />
          ))}
        </span>
      </span>
    </div>
  );
  return (
    <div className="flex flex-col gap-5">
      {bar("Before", before, "before")}
      {bar("After", after, "after")}
      <ul className="bc-legend grid grid-cols-2 gap-x-5 gap-y-1.5 text-sm sm:grid-cols-3">
        {picture.stages.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden="true" className="bc-seg bc-swatch" data-i={i % 7} />
            <span className="bc-muted">
              {s.label} <span className="tabular-nums">{Math.round(s.before)}→{Math.round(s.after)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Rings: one share per ring, the biggest one lit.
export function RingsArt({ picture }: { picture: Rings }) {
  const max = Math.max(...picture.rings.map((r) => r.value));
  const C = 2 * Math.PI * 30;
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
      {picture.rings.map((r) => (
        <li key={r.label} className="flex flex-col items-center gap-2 text-center" data-top={r.value === max || undefined}>
          <span className="relative grid place-items-center">
            <svg aria-hidden="true" viewBox="0 0 72 72" className="bc-ring size-24 -rotate-90">
              <circle cx="36" cy="36" r="30" className="bc-ring-track" />
              <circle cx="36" cy="36" r="30" className="bc-ring-value" strokeDasharray={`${(r.value / 100) * C} ${C}`} />
            </svg>
            <span className="bc-ring-n absolute tabular-nums">{r.value}%</span>
          </span>
          <span className="bc-muted text-sm">{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
