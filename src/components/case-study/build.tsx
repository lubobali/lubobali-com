import "./case-study.css";
import "./story.css";
import { Part } from "./sections";
import type { CaseStudy } from "@/lib/case-studies/types";

// How it was built (Phase 4 C3): the 3 hard problems for everyone, then
// "For engineers", closed by default, with the architecture drawn as
// layers (real HTML text, lines in CSS: case-study.css .cs-layers).

export function HardProblems({ cs }: { cs: CaseStudy }) {
  if (!cs.problems?.length) return null;
  return (
    <Part id="hard-problems" title={`${cs.problems.length} hard problems I solved`}>
      <ol className="grid gap-6 md:grid-cols-3">
        {cs.problems.map((p, i) => (
          <li key={p.problem} className="cs-card cs-problem flex flex-col gap-4 rounded-2xl p-6 sm:p-7">
            <span className="cs-num text-4xl font-semibold tabular-nums" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-xl font-semibold text-balance">{p.problem}</h3>
            <p className="text-muted-foreground">{p.decision}</p>
            <p className="cs-result mt-auto pt-4 text-sm font-medium">{p.result}</p>
          </li>
        ))}
      </ol>
    </Part>
  );
}

export function ForEngineers({ cs }: { cs: CaseStudy }) {
  const e = cs.engineers;
  if (!e) return null;
  return (
    <details className="cs-card cs-engineers rounded-2xl p-6 sm:p-8">
      <summary className="cursor-pointer text-lg font-semibold">For engineers: how it is built</summary>
      <div className="mt-6 flex flex-col gap-8">
        <p className="max-w-3xl text-muted-foreground">{e.intro}</p>
        {e.layers && (
          <ol className="cs-layers flex flex-col gap-3" aria-label="Architecture, from the user down to the data">
            {e.layers.map((l) => (
              <li key={l.name} className="cs-layer grid gap-3 rounded-xl p-4 sm:grid-cols-[7rem_1fr] sm:items-center">
                <span className="cs-when text-xs font-semibold tracking-wide uppercase">{l.name}</span>
                <ul className="flex flex-wrap gap-2">
                  {l.parts.map((part) => (
                    <li key={part} className="cs-part rounded-lg px-3 py-1.5 text-sm">
                      {part}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
        <ul className="flex max-w-3xl flex-col gap-3">
          {e.decisions.map((d) => (
            <li key={d} className="cs-decision pl-5 text-muted-foreground">
              {d}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
