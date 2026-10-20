import type { Blueprint } from "./types";

// Risks named for THEIR data (never solved here: the fix is for the call),
// and the 3 questions Lubo would ask on the call.

export function Risks({ bp }: { bp: Blueprint }) {
  return (
    <section className="bp-block" aria-labelledby="bp-risks">
      <h4 id="bp-risks" className="bp-label">
        Risks to watch
      </h4>
      <ul className="bp-risks">
        {bp.draft.risks.map((r) => (
          <li key={r.title} data-severity={r.severity}>
            <span className="bp-risk-tag">{r.severity === "fix_first" ? "Fix first" : "Watch"}</span>
            {r.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CallQuestions({ bp }: { bp: Blueprint }) {
  return (
    <section className="bp-block" aria-labelledby="bp-questions">
      <h4 id="bp-questions" className="bp-label">
        3 questions I&apos;d ask you on our call
      </h4>
      <ol className="bp-questions">
        {bp.draft.questions_for_call.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
    </section>
  );
}
