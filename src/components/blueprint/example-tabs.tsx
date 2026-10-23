import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";
import { BlueprintCard } from "./card";
import { EXAMPLES } from "./examples";

// 6 example blueprints behind industry tabs (Phase 3b B6), no JavaScript:
// real radio inputs (keyboard + screen readers: "Choose an industry"),
// labels styled as tabs, and CSS shows the card of the checked one
// (examples.css). All 6 cards are in the HTML, so search engines and AI
// assistants read every example. One instance per page (fixed ids).
export function ExampleTabs() {
  return (
    <fieldset className="bpx">
      <legend className="sr-only">Choose an industry</legend>
      {EXAMPLES.map((e, i) => (
        <input
          key={e.key}
          type="radio"
          name="bpx"
          id={`bpx-${e.key}`}
          data-key={e.key}
          defaultChecked={i === 0}
          className="bpx-radio"
        />
      ))}
      <div className="bpx-tabs">
        {EXAMPLES.map((e) => (
          <label key={e.key} htmlFor={`bpx-${e.key}`} data-key={e.key} className="bpx-tab">
            <span aria-hidden="true">{e.icon}</span> {e.label}
          </label>
        ))}
      </div>
      <div className="bpx-panels">
        {EXAMPLES.map((e) => (
          <div key={e.key} data-key={e.key} className="bpx-panel">
            <BlueprintCard bp={e.bp} example />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
