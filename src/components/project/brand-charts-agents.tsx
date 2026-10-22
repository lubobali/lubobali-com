import type { ProjectPicture } from "@/lib/projects/model";

// Brand-card pictures about agents at work (P5.6 batch 2): a week of
// scheduled posts, an agent's read/write tools, a question's two roads,
// and named items by group. Real facts only (plans docs/phase-5-facts.md).
// Styles: brand-kit-2.css (.bc-*).

type Week = Extract<ProjectPicture, { kind: "week" }>;
type Toolbox = Extract<ProjectPicture, { kind: "toolbox" }>;
type Fork = Extract<ProjectPicture, { kind: "fork" }>;
type Sectors = Extract<ProjectPicture, { kind: "sectors" }>;

// 7 days, each with its post slots.
export function WeekArt({ picture }: { picture: Week }) {
  return (
    <div className="flex flex-col gap-4">
      <ol className="grid grid-cols-7 gap-1.5">
        {picture.days.map((d) => (
          <li key={d.day} className="bc-day flex flex-col items-center gap-1.5">
            <span className="bc-label">{d.day}</span>
            {d.posts.map((p, i) => (
              <span key={i} className="bc-slot" title={p}>
                <span className="sr-only">{p}</span>
              </span>
            ))}
          </li>
        ))}
      </ol>
      <p className="bc-back text-sm">{picture.note}</p>
    </div>
  );
}

// What the agent can read, what it can write, around one store.
export function ToolboxArt({ picture }: { picture: Toolbox }) {
  const col = (label: string, tools: readonly string[], kind: string) => (
    <div className="flex flex-col gap-2">
      <span className="bc-label">
        {label} · {tools.length}
      </span>
      <ul className="flex flex-col gap-1.5">
        {tools.map((t) => (
          <li key={t} className="bc-tool text-sm" data-kind={kind}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {col("Reads", picture.read, "read")}
        {col("Writes", picture.write, "write")}
      </div>
      <p className="bc-store text-center">{picture.center}</p>
    </div>
  );
}

// One question, two roads, one answer.
export function ForkArt({ picture }: { picture: Fork }) {
  const box = (s: { label: string; detail: string }, tier: string) => (
    <div className="bc-layer" data-tier={tier}>
      <span className="bc-gate-label">{s.label}</span>
      <span className="bc-muted text-xs">{s.detail}</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="bc-question text-center">“{picture.question}”</p>
      <span aria-hidden="true" className="bc-arrow text-center">
        ↙ ↘
      </span>
      <div className="grid grid-cols-2 gap-3">
        {box(picture.left, "clean")}
        {box(picture.right, "raw")}
      </div>
      <span aria-hidden="true" className="bc-arrow text-center">
        ↘ ↙
      </span>
      {box(picture.end, "gold")}
    </div>
  );
}

// Named items by group, plus a few headline stats.
export function SectorsArt({ picture }: { picture: Sectors }) {
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-2.5">
        {picture.groups.map((g) => (
          <li key={g.name} className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
            <span className="bc-label">{g.name}</span>
            <span className="flex flex-wrap gap-1.5">
              {g.items.map((t) => (
                <span key={t} className="bc-ticker tabular-nums">
                  {t}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(${picture.stats.length}, minmax(0, 1fr))` }}>
        {picture.stats.map((s) => (
          <li key={s.label} className="bc-tile flex flex-col gap-1">
            <span className="bc-big tabular-nums">{s.value}</span>
            <span className="bc-muted text-xs">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
