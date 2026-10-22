import type { ProjectPicture } from "@/lib/projects/model";

// Brand-card pictures about before vs after (P5.6 batch 2): big drops,
// counted dots, and raw rows split into clean + held back. Real facts only
// (plans docs/phase-5-facts.md). Styles: brand-kit-2.css (.bc-*).

type Drops = Extract<ProjectPicture, { kind: "drops" }>;
type Tally = Extract<ProjectPicture, { kind: "tally" }>;
type Medallion = Extract<ProjectPicture, { kind: "medallion" }>;

// Before (struck through, dim) → after (lit), and how much it dropped.
export function DropsArt({ picture }: { picture: Drops }) {
  return (
    <ul className="flex flex-col gap-4">
      {picture.rows.map((r) => (
        <li key={r.label} className="bc-drop-row flex flex-col gap-1.5">
          <span className="bc-label">{r.label}</span>
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <s className="bc-before tabular-nums">{r.before}</s>
            <span aria-hidden="true" className="bc-arrow-sm">
              →
            </span>
            <span className="bc-after tabular-nums">{r.after}</span>
            <span className="bc-cut">{r.cut}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// One dot per item, before (dim) above after (lit), row by row.
export function TallyArt({ picture }: { picture: Tally }) {
  const dots = (n: number, lit: boolean) =>
    Array.from({ length: n }, (_, i) => <span key={i} className="bc-tally-dot" data-lit={lit || undefined} />);
  return (
    <ul className="flex flex-col gap-4">
      {picture.rows.map((r) => (
        <li key={r.label} className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-3">
            <span className="bc-gate-label">{r.label}</span>
            <span className="bc-muted text-sm tabular-nums">
              {r.before} → <span className="bc-total text-sm">{r.after}</span>
            </span>
          </span>
          <span className="flex flex-wrap gap-1" aria-hidden="true">
            {dots(r.before, false)}
          </span>
          <span className="flex min-h-2.5 flex-wrap gap-1" aria-hidden="true">
            {dots(r.after, true)}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Raw rows → clean + held back (they add up: nothing lost) → the result.
export function MedallionArt({ picture }: { picture: Medallion }) {
  const { raw, clean, held, gold } = picture;
  return (
    <div className="flex flex-col items-stretch gap-3">
      <div className="bc-layer" data-tier="raw">
        <span className="bc-gate-label">{raw.label}</span>
        <span className="bc-big tabular-nums">{raw.count}</span>
      </div>
      <span aria-hidden="true" className="bc-arrow text-center">
        ↓
      </span>
      <div className="grid grid-cols-2 gap-3">
        <div className="bc-layer" data-tier="clean">
          <span className="bc-gate-label">{clean.label}</span>
          <span className="bc-big tabular-nums">{clean.count}</span>
        </div>
        <div className="bc-layer" data-tier="held">
          <span className="bc-gate-label">{held.label}</span>
          <span className="bc-big tabular-nums">{held.count}</span>
          <span className="bc-muted text-xs">{held.detail}</span>
        </div>
      </div>
      <span aria-hidden="true" className="bc-arrow pl-[25%] text-left">
        ↓
      </span>
      <div className="bc-layer w-1/2" data-tier="gold">
        <span className="bc-gate-label">{gold.label}</span>
        <span className="bc-muted text-xs">{gold.detail}</span>
      </div>
    </div>
  );
}
