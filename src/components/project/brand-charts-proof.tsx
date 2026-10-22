import type { ReactNode } from "react";
import type { ProjectPicture } from "@/lib/projects/model";

// Brand-card pictures, batch 3 (P5.6): matches with their scores, a chat
// whose numbers come from tool calls, a time bar, a partition grid, data
// quality rules, and sessions split by a gap. Real facts only (plans
// docs/phase-5-facts.md). Styles: brand-kit-3.css (.bc-*).

type Matches = Extract<ProjectPicture, { kind: "matches" }>;
type Chat = Extract<ProjectPicture, { kind: "chat" }>;
type Timeline = Extract<ProjectPicture, { kind: "timeline" }>;
type Grid = Extract<ProjectPicture, { kind: "grid" }>;
type Rules = Extract<ProjectPicture, { kind: "rules" }>;
type Sessions = Extract<ProjectPicture, { kind: "sessions" }>;

// The question asked, what came back, and how close the match was.
export function MatchesArt({ picture }: { picture: Matches }) {
  return (
    <ul className="flex flex-col gap-3">
      {picture.rows.map((r) => (
        <li key={r.question} className="bc-match flex flex-col gap-1.5">
          <span className="bc-question text-base">“{r.question}”</span>
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="bc-arrow-sm">
              →
            </span>
            <span className="bc-muted min-w-0 flex-1 text-sm">{r.found}</span>
            <span className="bc-score tabular-nums">{r.score.toFixed(3)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// The answer with the numbers that came from tools lit up.
function lit(text: string, highlights: readonly string[]): ReactNode[] {
  if (highlights.length === 0) return [text];
  const re = new RegExp(`(${highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return text.split(re).map((part, i) => (highlights.includes(part) ? <mark key={i} className="bc-lit">{part}</mark> : part));
}
export function ChatArt({ picture }: { picture: Chat }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="bc-bubble self-end">{picture.question}</p>
      <p className="flex flex-wrap items-center gap-1.5">
        {picture.calls.map((c) => (
          <span key={c} className="bc-call">
            {c}
          </span>
        ))}
      </p>
      <p className="bc-bubble bc-bubble--answer">{lit(picture.answer, picture.highlights)}</p>
    </div>
  );
}

// Steps on one bar, sized by time; the total at the end.
export function TimelineArt({ picture }: { picture: Timeline }) {
  const total = picture.steps.reduce((n, s) => n + s.value, 0);
  return (
    <div className="flex flex-col gap-3">
      <span className="bc-timeline flex h-10 overflow-hidden rounded-xl" aria-hidden="true">
        {picture.steps.map((s, i) => (
          <span key={s.label} className="bc-seg h-full" data-i={i % 7} style={{ width: `${(s.value / total) * 100}%` }} />
        ))}
      </span>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {picture.steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden="true" className="bc-seg bc-swatch" data-i={i % 7} />
            <span className="bc-muted">
              {s.label} <span className="bc-total text-sm tabular-nums">{s.value} {picture.unit}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="bc-big tabular-nums">
        {total} {picture.unit} <span className="bc-muted text-sm font-normal">in total</span>
      </p>
    </div>
  );
}

// Partitions as a grid; a query for one row reads only that row.
export function GridArt({ picture }: { picture: Grid }) {
  const cells = picture.rows.length * picture.cols.length;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `4rem repeat(${picture.cols.length}, minmax(0, 1fr))` }} aria-hidden="true">
        <span />
        {picture.cols.map((c) => (
          <span key={c} className="bc-label text-center">
            {c}
          </span>
        ))}
        {picture.rows.map((r) => [
          <span key={r} className="bc-ticker text-center" data-lit={r === picture.lit || undefined}>
            {r}
          </span>,
          ...picture.cols.map((c) => <span key={`${r}-${c}`} className="bc-cell-box" data-lit={r === picture.lit || undefined} />),
        ])}
      </div>
      <p className="bc-muted text-sm">
        A query for <span className="bc-total text-sm">{picture.lit}</span> reads {picture.cols.length} of {cells} partitions.
      </p>
    </div>
  );
}

// Rules as written, each one a passing check.
export function RulesArt({ picture }: { picture: Rules }) {
  return (
    <ul className="bc-rules flex flex-col gap-2">
      {picture.rules.map((r) => (
        <li key={r} className="flex items-center gap-3">
          <span aria-hidden="true" className="bc-tick">
            ✓
          </span>
          <code className="bc-code">{r}</code>
        </li>
      ))}
    </ul>
  );
}

// Events on a line, split into sessions wherever the gap is long enough.
export function SessionsArt({ picture }: { picture: Sessions }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex flex-wrap items-center gap-2" aria-hidden="true">
        {picture.sessions.map((n, si) => (
          <span key={si} className="flex items-center gap-2">
            {si > 0 && <span className="bc-gap">{picture.gap} gap</span>}
            <span className="bc-session flex gap-1">
              {Array.from({ length: n }, (_, i) => (
                <span key={i} className="bc-tally-dot" data-lit />
              ))}
            </span>
          </span>
        ))}
      </p>
      <p className="bc-muted text-sm">
        {picture.sessions.length} sessions from one visitor: a new session starts after {picture.gap} of quiet.
      </p>
    </div>
  );
}
