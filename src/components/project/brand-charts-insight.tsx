import type { ProjectPicture } from "@/lib/projects/model";

// Brand-card pictures, batch 4 (P5.6): two numbers head to head, planned vs
// delivered, a scale with its sweet spot, and assumptions vs what the data
// showed. Real facts only (plans docs/phase-5-facts.md). Styles:
// brand-kit-4.css (.bc-*).

type Versus = Extract<ProjectPicture, { kind: "versus" }>;
type Gap = Extract<ProjectPicture, { kind: "gap" }>;
type Range = Extract<ProjectPicture, { kind: "range" }>;
type Myths = Extract<ProjectPicture, { kind: "myths" }>;

const fmt = (n: number) => n.toLocaleString("en-US");

// Two numbers side by side; the one that wins is lit.
export function VersusArt({ picture }: { picture: Versus }) {
  const side = (s: { value: string; label: string }, win: boolean) => (
    <div className="bc-vs-side flex flex-col gap-1" data-win={win || undefined}>
      <span className="bc-vs-value tabular-nums">{s.value}</span>
      <span className="bc-muted text-sm">{s.label}</span>
    </div>
  );
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      {side(picture.left, picture.winner === "left")}
      <span aria-hidden="true" className="bc-vs">
        vs
      </span>
      {side(picture.right, picture.winner === "right")}
    </div>
  );
}

// Planned vs delivered on one scale; the missing part drawn as a ghost.
export function GapArt({ picture }: { picture: Gap }) {
  const max = Math.max(picture.planned.value, picture.actual.value);
  const bar = (s: { label: string; value: number }, kind: string) => (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-baseline justify-between gap-3">
        <span className="bc-label">{s.label}</span>
        <span className="bc-total tabular-nums">
          {fmt(s.value)} {picture.unit}
        </span>
      </p>
      <span className="bc-race-track flex h-5 overflow-hidden rounded-full" aria-hidden="true">
        <span className="bc-gap-bar h-full rounded-full" data-kind={kind} style={{ width: `${(s.value / max) * 100}%` }} />
      </span>
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      {bar(picture.planned, "planned")}
      {bar(picture.actual, "actual")}
      <p className="bc-back text-sm">{picture.note}</p>
    </div>
  );
}

// A scale with the sweet spot marked.
export function RangeArt({ picture }: { picture: Range }) {
  const span = picture.max - picture.min;
  const at = (v: number) => `${((v - picture.min) / span) * 100}%`;
  return (
    <div className="flex flex-col gap-3">
      <div className="bc-scale relative h-10 rounded-xl" aria-hidden="true">
        <span className="bc-band-hot absolute inset-y-0 rounded-lg" style={{ left: at(picture.low), width: `${((picture.high - picture.low) / span) * 100}%` }} />
      </div>
      <p className="bc-muted flex justify-between text-xs tabular-nums" aria-hidden="true">
        <span>
          {picture.unit} {picture.min}
        </span>
        <span>{picture.max}</span>
      </p>
      <p className="text-sm">
        <span className="bc-total text-sm tabular-nums">
          {picture.unit} {picture.low}–{picture.high}
        </span>{" "}
        <span className="bc-muted">{picture.label}</span>
      </p>
    </div>
  );
}

// What people assumed (struck) vs what the data showed (lit).
export function MythsArt({ picture }: { picture: Myths }) {
  return (
    <ul className="flex flex-col gap-3">
      {picture.rows.map((r) => (
        <li key={r.assumed} className="bc-myth flex flex-col gap-1">
          <span className="bc-muted text-sm">
            <span className="bc-label">Assumed</span> <s className="bc-myth-was">{r.assumed}</s>
          </span>
          <span className="text-sm">
            <span className="bc-label">Data</span> <span className="bc-myth-is">{r.found}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
