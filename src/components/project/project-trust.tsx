import "./brand-card.css";
import "./brand-kit-2.css";
import "./brand-kit-3.css";
import "./brand-kit-4.css";
import "./brand-kit.css";
import "./project.css";
import { ANATOMY, type Anatomy, type Project, proofItems } from "@/lib/projects/model";

// Three ways a project proves it, not claims it (Phase 5, Lubo after the
// GTC Berlin keynote: "show CEOs I'm riding the AI wave"). Styles: .pj-*.

// "Proof you can check": built from the real links (proofItems), so it can
// never say more than the page can show.
export function ProofLine({ p }: { p: Project }) {
  const items = proofItems(p);
  if (items.length === 0) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <span className="text-muted-foreground">Proof you can check:</span>
      {items.map((i) => (
        <span key={i} className="pj-proof inline-flex items-center gap-1.5">
          <span aria-hidden="true">✓</span>
          {i}
        </span>
      ))}
    </p>
  );
}

// "Hope isn't security": only on projects with real guardrails, with the how.
export function SafeMark({ p }: { p: Project }) {
  if (!p.safe) return null;
  return (
    <section aria-labelledby="safe" className="pj-safe edge-card flex flex-col gap-3 rounded-3xl p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="pj-shield size-10 shrink-0">
        <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col gap-1">
        <h2 id="safe" className="text-xl font-semibold">
          Safe by design
        </h2>
        <p className="text-lg text-muted-foreground">{p.safe}</p>
      </div>
    </section>
  );
}

// What this agent is made of: the same 5 parts every AI agent has. The
// parts sit on one line, like a harness holding the model, knowledge and
// tools together; on phones they stack.
export function AgentAnatomy({ p }: { p: Project }) {
  if (!p.anatomy) return null;
  const parts = Object.entries(ANATOMY) as [keyof Anatomy, string][];
  return (
    <section aria-labelledby="anatomy" className="flex flex-col gap-6">
      <div className="flex max-w-3xl flex-col gap-2">
        <h2 id="anatomy" className="text-2xl font-semibold sm:text-3xl">
          How this agent is built
        </h2>
        <p className="text-lg text-muted-foreground">
          Every AI agent has the same five parts. Here is what each one is in {p.name}, so you can judge any agent the
          same way.
        </p>
      </div>
      <ol className="pj-anatomy grid gap-3 lg:grid-cols-5">
        {parts.map(([key, label], i) => (
          <li key={key} className="pj-part edge-card flex flex-col gap-2 rounded-2xl p-5">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
              <span className="pj-part-n grid size-6 place-items-center rounded-full text-xs tabular-nums" aria-hidden="true">
                {i + 1}
              </span>
              {label}
            </span>
            <span className="text-muted-foreground">{p.anatomy?.[key]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
