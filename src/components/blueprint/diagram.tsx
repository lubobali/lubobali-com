import { duration } from "./format";
import type { Blueprint } from "./types";

// Before -> After (Phase 3b B5, Lubo: "luxury and self-explanatory"):
// a stranger gets it in 5 seconds, no legend. Left "Today": their real
// steps, the app each one uses, pain points marked. Right "With your AI":
// one glowing app and the new steps, with data dots flowing down.
// Real HTML text (readable, translatable, zoomable); lines and dots are
// CSS. Styles: blueprint.css (.bp-flow ...).
export function Diagram({ bp }: { bp: Blueprint }) {
  const { old_flow, new_flow, app_name } = bp.draft;
  const t = bp.time_saved;
  return (
    <div className="bp-flow">
      <section className="bp-panel bp-panel--today" aria-label="How it works today">
        <header className="bp-panel-head">
          <span className="bp-panel-title">Today</span>
          {t && <span className="bp-time">{duration(t.before_minutes)} a week</span>}
        </header>
        <ol className="bp-steps">
          {old_flow.map((s, i) => (
            <li key={i} className="bp-step" data-pain={s.pain || undefined} style={{ "--i": i } as React.CSSProperties}>
              <span className="bp-step-label">{s.label}</span>
              <span className="bp-step-meta">
                {s.tool}
                {s.minutes && s.per ? ` · ${duration(s.minutes)} a ${s.per}` : ""}
              </span>
              {s.pain && <span className="bp-pain">pain point</span>}
            </li>
          ))}
        </ol>
      </section>

      <div className="bp-bridge" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <section className="bp-panel bp-panel--new" aria-label="With your AI">
        <header className="bp-panel-head">
          <span className="bp-panel-title">With your AI</span>
          {t && (
            <span className="bp-time bp-time--new">
              ~{duration(t.after_minutes)} a week <small>estimate</small>
            </span>
          )}
        </header>
        <p className="bp-app">
          <span className="bp-app-core" aria-hidden="true" />
          {app_name}
        </p>
        <ol className="bp-steps bp-steps--new">
          {new_flow.map((s, i) => (
            <li key={i} className="bp-step" style={{ "--i": i } as React.CSSProperties}>
              <span className="bp-step-label">{s.label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
