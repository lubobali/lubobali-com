import { duration, readinessLabel, splitReason } from "./format";
import type { Blueprint } from "./types";

// The 3 numbers, all computed by code (never by the AI): data readiness
// (a platinum dial), the timeline in 1-week rounds, and time saved (only
// from the visitor's own number; "after" is marked as an estimate).

export function Gauge({ bp }: { bp: Blueprint }) {
  const { score, reasons } = bp.readiness;
  return (
    <figure className="bp-stat">
      <figcaption className="bp-label">Data readiness</figcaption>
      <div className="bp-gauge" style={{ "--score": score } as React.CSSProperties}>
        <svg viewBox="0 0 120 66" aria-hidden="true">
          <path className="bp-gauge-track" d="M10 60 A50 50 0 0 1 110 60" pathLength={100} />
          <path className="bp-gauge-value" d="M10 60 A50 50 0 0 1 110 60" pathLength={100} />
        </svg>
        <p className="bp-gauge-num">
          {score}
          <span>/100</span>
        </p>
      </div>
      <p className="bp-ready-label">{readinessLabel(score)}</p>
      <ul className="bp-reasons">
        {reasons.map((r) => {
          const { good, text } = splitReason(r);
          return (
            <li key={r} data-good={good || undefined}>
              <span className="sr-only">{good ? "Good: " : "To fix: "}</span>
              {text}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

export function Timeline({ bp }: { bp: Blueprint }) {
  const { label, rounds } = bp.timeline;
  return (
    <figure className="bp-stat">
      <figcaption className="bp-label">
        Timeline <strong className="bp-stat-big">{label}</strong>
      </figcaption>
      <ol className="bp-rounds">
        {rounds.map((r, i) => (
          <li key={r.label} style={{ "--i": i } as React.CSSProperties}>
            <span className="bp-round-week">Week {i + 1}</span>
            <span className="bp-round-label">{r.label}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function TimeSaved({ bp }: { bp: Blueprint }) {
  const t = bp.time_saved;
  if (!t) return null;
  const after = Math.max(4, Math.round((t.after_minutes / t.before_minutes) * 100));
  return (
    <figure className="bp-stat">
      <figcaption className="bp-label">Time each week</figcaption>
      <div className="bp-bars">
        <p>
          <span className="bp-bar-name">Today</span>
          <span className="bp-bar bp-bar--before" style={{ "--w": "100%" } as React.CSSProperties} />
          <span className="bp-bar-value">{duration(t.before_minutes)}</span>
        </p>
        <p>
          <span className="bp-bar-name">With your AI</span>
          <span className="bp-bar bp-bar--after" style={{ "--w": `${after}%` } as React.CSSProperties} />
          <span className="bp-bar-value">~{duration(t.after_minutes)}</span>
        </p>
      </div>
      <p className="bp-note">From your own numbers. &ldquo;With your AI&rdquo; is an estimate.</p>
    </figure>
  );
}
