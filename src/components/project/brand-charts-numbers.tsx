import type { ProjectPicture } from "@/lib/projects/model";

// Brand-card pictures about numbers (P5.6): big number tiles, a dot per
// group of items, and a rising ladder of bars. Real facts only (plans
// docs/phase-5-facts.md). Styles: brand-card.css (.bc-*).

type Kpis = Extract<ProjectPicture, { kind: "kpis" }>;
type Dots = Extract<ProjectPicture, { kind: "dots" }>;
type Bars = Extract<ProjectPicture, { kind: "chart" }>;

const fmt = (n: number) => n.toLocaleString("en-US");

// Big number tiles, plus one share as a ring or small bars by group.
export function KpisArt({ picture }: { picture: Kpis }) {
  const C = 2 * Math.PI * 30;
  const max = picture.bars ? Math.max(...picture.bars.items.map((b) => b.value)) : 0;
  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(${picture.tiles.length}, minmax(0, 1fr))` }}>
        {picture.tiles.map((t) => (
          <li key={t.label} className="bc-tile flex flex-col gap-1">
            <span className="bc-big tabular-nums">{t.value}</span>
            <span className="bc-muted text-xs">{t.label}</span>
          </li>
        ))}
      </ul>
      {picture.ring && (
        <p className="flex items-center gap-4">
          <span className="relative grid shrink-0 place-items-center" data-top>
            <svg aria-hidden="true" viewBox="0 0 72 72" className="bc-ring size-20 -rotate-90">
              <circle cx="36" cy="36" r="30" className="bc-ring-track" />
              <circle cx="36" cy="36" r="30" className="bc-ring-value" strokeDasharray={`${(picture.ring.value / 100) * C} ${C}`} />
            </svg>
            <span className="bc-ring-n absolute tabular-nums">{picture.ring.value}%</span>
          </span>
          <span className="bc-muted text-sm">{picture.ring.label}</span>
        </p>
      )}
      {picture.bars && (
        <div className="flex flex-col gap-2.5">
          <span className="bc-label">{picture.bars.title}</span>
          <ul className="flex flex-col gap-2">
            {picture.bars.items.map((b) => (
              <li key={b.label} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm" data-top={b.value === max || undefined}>
                <span className="bc-muted">{b.label}</span>
                <span className="bc-race-track h-2.5 rounded-full" aria-hidden="true">
                  <span className="bc-mini-bar block h-full rounded-full" style={{ width: `${(b.value / max) * 100}%` }} />
                </span>
                <span className="bc-total text-sm tabular-nums">
                  {picture.bars?.prefix}
                  {fmt(Math.round(b.value))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// One dot per `per` items, by group; lit groups glow. A legend gives the
// real counts.
export function DotsArt({ picture }: { picture: Dots }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="bc-dots flex flex-wrap gap-1" aria-hidden="true">
        {picture.groups.flatMap((g, gi) =>
          Array.from({ length: Math.round(g.count / picture.per) }, (_, i) => (
            <span key={`${gi}-${i}`} className="bc-dot-cell" data-group={gi} data-lit={g.lit || undefined} />
          )),
        )}
      </p>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {picture.groups.map((g, gi) => (
          <li key={g.label} className="flex items-center gap-2">
            <span aria-hidden="true" className="bc-dot-cell" data-group={gi} data-lit={g.lit || undefined} />
            <span className="bc-muted">
              {g.label} <span className="bc-total text-sm tabular-nums">{fmt(g.count)}</span>
            </span>
          </li>
        ))}
        <li className="bc-muted">1 dot = {picture.per} emails</li>
      </ul>
    </div>
  );
}

// A ladder: one column per group, rising; the top one lit.
export function LadderArt({ picture }: { picture: Bars }) {
  const max = Math.max(...picture.bars.map((b) => b.value));
  return (
    <ul className="grid h-60 items-end gap-3" style={{ gridTemplateColumns: `repeat(${picture.bars.length}, minmax(0, 1fr))` }}>
      {picture.bars.map((b) => (
        <li key={b.label} className="flex h-full flex-col items-center justify-end gap-2 text-center" data-top={b.value === max || undefined}>
          <span className="bc-total tabular-nums">
            {fmt(b.value)}
            {picture.unit}
          </span>
          <span className="bc-col w-full rounded-t-lg" style={{ height: `${(b.value / max) * 70}%` }} aria-hidden="true" />
          <span className="flex flex-col">
            <span className="text-sm">{b.label}</span>
            {b.note && <span className="bc-muted text-xs">{b.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
