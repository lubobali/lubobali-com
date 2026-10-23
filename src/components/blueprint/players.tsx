import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";
import { initials, POWER } from "./format";
import type { Blueprint } from "./types";

// Who's involved (Lubo's way, step 3): every player with their role, their
// power (decides / approves / does the work ...) and, only when the
// visitor said it, their money share. Round badges, platinum ring.
export function Players({ bp }: { bp: Blueprint }) {
  return (
    <section className="bp-block" aria-labelledby="bp-players">
      <h4 id="bp-players" className="bp-label">
        Who&apos;s involved
      </h4>
      <ul className="bp-players">
        {bp.draft.players.map((p) => (
          <li key={p.role} className="bp-player" data-power={p.power}>
            <span className="bp-avatar" aria-hidden="true">
              {initials(p.role)}
            </span>
            <span className="bp-player-text">
              <span className="bp-player-role">{p.role}</span>
              <span className="bp-player-power">
                {POWER[p.power]}
                {p.money_share ? ` · ${p.money_share}` : ""}
              </span>
              <span className="bp-player-does">{p.does}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
