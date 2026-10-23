import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";
import { Diagram } from "./diagram";
import { Locked } from "./locked";
import { Players } from "./players";
import { CallQuestions, Risks } from "./risks";
import { Gauge, Timeline, TimeSaved } from "./stats";
import type { Blueprint } from "./types";

// The AI Project Blueprint card (Phase 3b B5): Lubo's way top to bottom —
// why -> today vs with your AI -> who's involved -> the 3 numbers -> risks
// -> 3 questions for the call -> the locked "how" + Book a call. Same award
// edge as the service cards. Works as a server component (examples, no JS)
// and inside the tool (client). `example` = a sample, labelled as such.
// Styles: blueprint.css + blueprint-flow.css, bundled via globals.css.
export function BlueprintCard({ bp, example = false }: { bp: Blueprint; example?: boolean }) {
  const d = bp.draft;
  return (
    <article className="award-card bp-card rounded-3xl" aria-label={`AI blueprint: ${d.app_name}`}>
      <header className="bp-head">
        <p className="bp-eyebrow">
          AI blueprint{example ? " · example" : ""}
          <span className="bp-pattern">{bp.pattern.title}</span>
        </p>
        <h3 className="bp-title">{d.app_name}</h3>
        <p className="bp-why">{d.why.problem}</p>
        <p className="bp-goal">
          <span className="bp-label">Goal</span> {d.why.goal}
        </p>
      </header>

      <Diagram bp={bp} />
      <Players bp={bp} />

      <div className="bp-stats" data-cols={bp.time_saved ? 3 : 2}>
        <Gauge bp={bp} />
        <Timeline bp={bp} />
        <TimeSaved bp={bp} />
      </div>

      <div className="bp-two">
        <Risks bp={bp} />
        <CallQuestions bp={bp} />
      </div>

      <Locked bp={bp} />
    </article>
  );
}
