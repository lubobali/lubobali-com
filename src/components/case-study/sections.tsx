import { FlowDiagram } from "@/components/blueprint/diagram";
import { QuoteCard } from "@/components/home/testimonials";
import { testimonials } from "@/lib/testimonials";
import { Screen } from "./screen";
import type { CaseStudy } from "@/lib/case-studies/types";

// The middle of a case study (Phase 4 C2). Each part draws only when its
// data is filled in, so a draft or a mystery page simply has fewer parts.

export function Part({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <h2 id={id} className="text-3xl font-semibold text-balance sm:text-4xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function BeforeAfter({ cs }: { cs: CaseStudy }) {
  if (!cs.flow) return null;
  return (
    <Part id="before-after" title="Before and after">
      <FlowDiagram {...cs.flow} />
    </Part>
  );
}

// "A day with Alex" (Lubo: numbers mean nothing alone, tell stories): a
// vertical timeline, each moment = what happens + the build behind it.
export function Day({ cs }: { cs: CaseStudy }) {
  if (!cs.day) return null;
  return (
    <Part id="a-day" title={cs.day.title ?? `A day with ${cs.name.replace(/\.ai$/, "")}`}>
      <p className="max-w-3xl text-lg text-muted-foreground">{cs.day.intro}</p>
      <ol className="cs-day flex flex-col gap-16 lg:gap-24">
        {cs.day.moments.map((m, i) => (
          <li key={m.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="cs-moment flex flex-col gap-3">
              <span className="cs-when text-sm font-semibold tracking-wide uppercase">{m.when}</span>
              <h3 className="text-2xl font-semibold text-balance sm:text-3xl">{m.title}</h3>
              <p className="text-lg text-muted-foreground">{m.text}</p>
              {m.behind && (
                <p className="cs-behind text-sm">
                  <span className="text-muted-foreground">Behind this: </span>
                  {m.behind}
                </p>
              )}
            </div>
            {/* Pictures alternate sides on wide screens: a calmer rhythm. */}
            <div className={i % 2 ? "lg:order-first" : undefined}>
              {m.shot && (
                <div className={m.shot.narrow ? "mx-auto max-w-xs" : undefined}>
                  <Screen shot={m.shot} sizes="(min-width: 1024px) 45vw, 100vw" />
                </div>
              )}
              {m.fix && (
                <div className="cs-fix flex flex-col gap-3 rounded-2xl p-6 sm:p-8">
                  <span className="cs-fix-label text-xs font-semibold tracking-wide uppercase">How it&apos;s solved</span>
                  <p className="text-lg text-foreground">{m.fix}</p>
                </div>
              )}
              {m.chips && (
                <ul className="cs-chips flex flex-wrap gap-3" aria-label="Suggested next questions">
                  {m.chips.map((c) => (
                    <li key={c} className="cs-chip rounded-full px-4 py-2 text-sm">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Part>
  );
}

// The full build (Lubo: "show it in the full spectrum what I built").
export function Stats({ cs }: { cs: CaseStudy }) {
  if (!cs.stats?.length) return null;
  return (
    <Part id="by-the-numbers" title="The full build, by the numbers">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
        {cs.stats.map((s) => (
          <li key={s.label} className="flex flex-col gap-1 bg-background p-5 sm:p-6">
            <span className="text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">{s.value}</span>{" "}
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>
    </Part>
  );
}

export function UseCases({ cs }: { cs: CaseStudy }) {
  if (!cs.useCases?.length) return null;
  return (
    <Part id="use-cases" title="What you can do with it">
      <ul className="grid gap-6 md:grid-cols-3">
        {cs.useCases.map((u) => (
          <li key={u.title} className="cs-card flex flex-col gap-3 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">{u.title}</h3>
            <p className="text-muted-foreground">{u.text}</p>
            {u.learns && <p className="cs-learns text-sm">{u.learns}</p>}
          </li>
        ))}
      </ul>
    </Part>
  );
}

// What makes the problem hard, in the reader's words (mystery pages show
// the difficulty, never the solution's details).
export function Challenges({ cs }: { cs: CaseStudy }) {
  if (!cs.challenges?.length) return null;
  return (
    <Part id="why-hard" title="Why this is hard">
      <ul className="grid gap-6 md:grid-cols-3">
        {cs.challenges.map((c) => (
          <li key={c.title} className="cs-card cs-challenge flex flex-col gap-3 rounded-2xl p-6 sm:p-7">
            <h3 className="text-xl font-semibold text-balance">{c.title}</h3>
            <p className="text-muted-foreground">{c.text}</p>
          </li>
        ))}
      </ul>
    </Part>
  );
}

// Mystery pages (client work): ideas only, and the secrecy is the hook.
export function Ideas({ cs }: { cs: CaseStudy }) {
  if (!cs.ideas?.length) return null;
  return (
    <Part id="ideas" title="What I built">
      <ol className="grid gap-6 md:grid-cols-3">
        {cs.ideas.map((idea, i) => (
          <li key={idea.title} className="cs-card cs-problem flex flex-col gap-3 rounded-2xl p-6 sm:p-7">
            <span className="cs-num text-4xl font-semibold tabular-nums" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-xl font-semibold text-balance">{idea.title}</h3>
            <p className="text-muted-foreground">{idea.text}</p>
          </li>
        ))}
      </ol>
      <p className="cs-secret text-lg">
        The details stay private, like they will for your project. <strong>Ask me on a call how it works.</strong>
      </p>
    </Part>
  );
}

// A testimonial by name (one source: src/lib/testimonials.ts, same
// permission gate as the home page). Missing name = nothing rendered.
export function Quote({ cs }: { cs: CaseStudy }) {
  const t = testimonials.find((q) => q.name === cs.quote);
  if (!t) return null;
  return (
    <div className="award-card quote-card mx-auto w-full max-w-4xl rounded-2xl">
      <QuoteCard t={t} />
    </div>
  );
}

export function Facts({ cs }: { cs: CaseStudy }) {
  return (
    <dl className={`grid gap-6 border-y border-border py-8 sm:grid-cols-3 ${cs.next ? "lg:grid-cols-4" : ""}`}>
      <div className="flex flex-col gap-1">
        <dt className="text-sm text-muted-foreground">My role</dt>
        <dd className="font-medium">{cs.role}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-sm text-muted-foreground">When</dt>
        <dd className="font-medium">{cs.when}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-sm text-muted-foreground">Built with</dt>
        <dd className="font-medium">{cs.stack.join(" · ")}</dd>
      </div>
      {cs.next && (
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Next</dt>
          <dd className="font-medium">{cs.next}</dd>
        </div>
      )}
    </dl>
  );
}
