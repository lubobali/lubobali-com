import "./case-study.css";
import "./story.css";
import { Part } from "./sections";
import type { CaseStudy } from "@/lib/case-studies/types";

// Results and the road ahead (Phase 4 C4, GraphGuard): a fair contest as
// bars (real HTML text, bar width = value / total) and an honest roadmap
// (done / now / later). Styles: story.css .cs-bar, .cs-road.

export function Contest({ cs }: { cs: CaseStudy }) {
  const c = cs.contest;
  if (!c) return null;
  return (
    <Part id="the-contest" title={c.title}>
      <p className="max-w-3xl text-lg text-muted-foreground">{c.intro}</p>
      <ol className="cs-card flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
        {c.rows.map((r) => (
          <li key={r.name} className={`cs-bar-row grid gap-2 sm:grid-cols-[15rem_1fr_6rem] sm:items-center sm:gap-6 ${r.winner ? "cs-bar-row--win" : ""}`}>
            <span className="font-medium">{r.name}</span>
            <span className="cs-bar-track h-3 overflow-hidden rounded-full" aria-hidden="true">
              <span className="cs-bar block h-full rounded-full" style={{ "--w": `${(r.value / c.total) * 100}%` } as React.CSSProperties} />
            </span>
            <span className="cs-bar-value text-sm tabular-nums sm:text-right">
              <strong className="text-lg">{r.value}</strong> of {c.total} <span className="sr-only">{c.unit}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="max-w-3xl text-sm text-muted-foreground">{c.note}</p>
    </Part>
  );
}

const STATUS = { done: "Done", now: "In progress", later: "Planned" } as const;

export function Roadmap({ cs }: { cs: CaseStudy }) {
  if (!cs.roadmap?.length) return null;
  return (
    <Part id="whats-next" title="What's next">
      <ol className="cs-road grid gap-4 md:grid-cols-5">
        {cs.roadmap.map((s) => (
          <li key={s.name} className={`cs-road-step cs-road-step--${s.status} flex flex-col gap-2 rounded-2xl p-5`}>
            <span className="cs-road-status text-xs font-semibold tracking-wide uppercase">{STATUS[s.status]}</span>
            <h3 className="font-semibold text-balance">{s.name}</h3>
            <p className="text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </Part>
  );
}
