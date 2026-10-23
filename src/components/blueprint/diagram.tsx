import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";
import type { ReactNode } from "react";
import { duration } from "./format";
import type { Blueprint } from "./types";

// Before -> After (Phase 3b B5, Lubo: "luxury and self-explanatory"):
// a stranger gets it in 5 seconds, no legend. Left: the real steps, the
// app each one uses, pain points marked. Right: one glowing app and the
// new steps, with data dots flowing down. Real HTML text (readable,
// translatable, zoomable); lines and dots are CSS. Styles: blueprint.css
// (.bp-flow ...). FlowDiagram is generic (Phase 4: case studies reuse it);
// Diagram is the blueprint card's adapter.

export type FlowSide = {
  title: string;
  label: string; // aria-label of the panel
  badge?: ReactNode; // e.g. "6 h a week"
  steps: readonly { label: string; meta?: string; pain?: boolean }[];
};

export function FlowDiagram({ before, after, app }: { before: FlowSide; after: FlowSide; app: string }) {
  return (
    <div className="bp-flow">
      <section className="bp-panel bp-panel--today" aria-label={before.label}>
        <header className="bp-panel-head">
          <span className="bp-panel-title">{before.title}</span>
          {before.badge && <span className="bp-time">{before.badge}</span>}
        </header>
        <ol className="bp-steps">
          {before.steps.map((s, i) => (
            <li key={i} className="bp-step" data-pain={s.pain || undefined} style={{ "--i": i } as React.CSSProperties}>
              <span className="bp-step-label">{s.label}</span>
              <span className="bp-step-meta">{s.meta}</span>
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

      <section className="bp-panel bp-panel--new" aria-label={after.label}>
        <header className="bp-panel-head">
          <span className="bp-panel-title">{after.title}</span>
          {after.badge && <span className="bp-time bp-time--new">{after.badge}</span>}
        </header>
        <p className="bp-app">
          <span className="bp-app-core" aria-hidden="true" />
          {app}
        </p>
        <ol className="bp-steps bp-steps--new">
          {after.steps.map((s, i) => (
            <li key={i} className="bp-step" style={{ "--i": i } as React.CSSProperties}>
              <span className="bp-step-label">{s.label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function Diagram({ bp }: { bp: Blueprint }) {
  const { old_flow, new_flow, app_name } = bp.draft;
  const t = bp.time_saved;
  return (
    <FlowDiagram
      app={app_name}
      before={{
        title: "Today",
        label: "How it works today",
        badge: t && `${duration(t.before_minutes)} a week`,
        steps: old_flow.map((s) => ({
          label: s.label,
          meta: s.tool + (s.minutes && s.per ? ` · ${duration(s.minutes)} a ${s.per}` : ""),
          pain: s.pain,
        })),
      }}
      after={{
        title: "With your AI",
        label: "With your AI",
        badge: t && (
          <>
            ~{duration(t.after_minutes)} a week <small>estimate</small>
          </>
        ),
        steps: new_flow,
      }}
    />
  );
}
