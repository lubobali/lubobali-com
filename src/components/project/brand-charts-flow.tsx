import "./brand-card.css";
import "./brand-kit-2.css";
import "./brand-kit-3.css";
import "./brand-kit-4.css";
import "./brand-kit.css";
import "./project.css";
import type { ProjectPicture } from "@/lib/projects/model";

// Brand-card pictures about how work moves (P5.6): a loop of agents, a
// funnel, a live stream, two systems side by side, and the plain step
// strip. Real facts only (plans docs/phase-5-facts.md). Styles:
// brand-card.css (.bc-*).

type Loop = Extract<ProjectPicture, { kind: "loop" }>;
type Funnel = Extract<ProjectPicture, { kind: "funnel" }>;
type Stream = Extract<ProjectPicture, { kind: "stream" }>;
type Reconcile = Extract<ProjectPicture, { kind: "reconcile" }>;
type Flow = Extract<ProjectPicture, { kind: "flow" }>;

// Agents on a ring passing the work around; the answer time in the middle.
export function LoopArt({ picture }: { picture: Loop }) {
  const n = picture.agents.length;
  const at = (i: number) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: 100 + 74 * Math.cos(a), y: 100 + 74 * Math.sin(a) };
  };
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[13rem_1fr]">
      <span className="relative mx-auto grid size-52 place-items-center">
        <svg aria-hidden="true" viewBox="0 0 200 200" className="bc-loop absolute inset-0 size-full">
          <circle cx="100" cy="100" r="74" className="bc-loop-ring" />
          <circle cx="100" cy="100" r="74" className="bc-loop-run" />
          {picture.agents.map((_, i) => {
            const p = at(i);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="15" className="bc-loop-node" />
                <text x={p.x} y={p.y + 5} textAnchor="middle" className="bc-loop-n">
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
        <span className="flex flex-col items-center text-center">
          <span className="bc-big">{picture.center.value}</span>
          <span className="bc-muted max-w-[7rem] text-xs">{picture.center.label}</span>
        </span>
      </span>
      <ol className="flex flex-col gap-3">
        {picture.agents.map((a, i) => (
          <li key={a.label} className="grid grid-cols-[1.75rem_1fr] gap-2">
            <span className="bc-num">{i + 1}</span>
            <span className="flex flex-col">
              <span className="bc-gate-label">{a.label}</span>
              <span className="bc-muted text-sm">{a.detail}</span>
            </span>
          </li>
        ))}
        <li className="bc-back text-sm">
          <span aria-hidden="true">↺ </span>
          {picture.back}
        </li>
      </ol>
    </div>
  );
}

// Many in at the top, few worth it out at the bottom.
export function FunnelArt({ picture }: { picture: Funnel }) {
  const n = picture.stages.length;
  return (
    <ol className="flex flex-col items-center gap-2">
      {picture.stages.map((s, i) => (
        <li key={s.label} className="flex w-full flex-col items-center gap-1">
          <span className="bc-band" data-last={i === n - 1 || undefined} style={{ width: `${100 - (i * 62) / (n - 1)}%` }}>
            {s.label}
          </span>
          <span className="bc-muted text-center text-xs">{s.detail}</span>
        </li>
      ))}
    </ol>
  );
}

// Live items with their clocks (coloured like profit and loss), flowing on
// into a history that fills itself.
export function StreamArt({ picture }: { picture: Stream }) {
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
      <ul className="flex min-w-0 flex-col gap-2">
        {picture.items.map((t) => (
          <li key={t.label} className="bc-row flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-sm">{t.label}</span>
            <span className="bc-age tabular-nums" data-state={t.state}>
              {t.age}
            </span>
          </li>
        ))}
      </ul>
      <div className="bc-history flex flex-col gap-1.5">
        <span className="bc-gate-label">
          <span aria-hidden="true" className="bc-arrow-sm">→ </span>
          {picture.into.label}
        </span>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} aria-hidden="true" className="bc-history-row" style={{ opacity: 1 - i * 0.16 }} />
        ))}
        <span className="bc-muted text-xs">{picture.into.detail}</span>
      </div>
    </div>
  );
}

// The same rows in two systems: one side finds them all, the other only a
// share; the rest went missing without a single error.
export function ReconcileArt({ picture }: { picture: Reconcile }) {
  const rows = 12;
  const found = Math.round(rows * (1 - picture.missingShare));
  const side = (label: string, note: string, ok: number) => (
    <div className="flex flex-col gap-2">
      <span className="bc-label">{label}</span>
      <span className="flex flex-col gap-1.5" aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => (
          <span key={i} className="bc-cell" data-missing={i >= ok || undefined} />
        ))}
      </span>
      <span className="bc-muted text-sm">{note}</span>
    </div>
  );
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
      {side(picture.left.label, picture.left.note, rows)}
      <span aria-hidden="true" className="bc-arrow self-center">
        →
      </span>
      {side(picture.right.label, picture.right.note, found)}
    </div>
  );
}

// The plain step strip, for a project without its own picture yet.
export function FlowArt({ picture }: { picture: Flow }) {
  return (
    <ol className="flex flex-col gap-3">
      {picture.steps.map((s, i) => (
        <li key={s.label} className="grid grid-cols-[1.75rem_1fr] gap-2">
          <span className="bc-num">{i + 1}</span>
          <span className="flex flex-col">
            <span className="bc-gate-label">{s.label}</span>
            <span className="bc-muted text-sm">{s.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
