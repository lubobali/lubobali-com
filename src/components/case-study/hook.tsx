import type { CaseStudy } from "@/lib/case-studies/types";
import { Ring } from "./ring";
import { Screen } from "./screen";

// The first screen (Phase 4 C2): enough even if they stop here. Research:
// buyers finish a case study that gives the problem in their words, what
// you did and one real number, fast (plans docs/phase-4-research.md §1).
export function Hook({ cs }: { cs: CaseStudy }) {
  return (
    <header className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col gap-5">
      {cs.badge && (
        <a href={cs.badge.url} className="cs-badge self-start rounded-full px-4 py-1.5 text-sm font-medium">
          <span aria-hidden="true">★ </span>
          {cs.badge.label} <span aria-hidden="true">↗</span>
        </a>
      )}
      <p className="text-sm font-semibold tracking-wide text-award uppercase">{cs.eyebrow}</p>
      <h1 className="text-4xl font-semibold text-balance sm:text-6xl">
        <span className="sr-only">{cs.name}: </span>
        {cs.title}
      </h1>
      <p className="max-w-3xl text-xl text-balance text-foreground sm:text-2xl">{cs.problem}</p>
      <p className="max-w-3xl text-lg text-muted-foreground">{cs.promise}</p>
      {cs.numbers && (
        <ul className="cs-numbers mt-2 grid grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-8">
          {cs.numbers.map((n) => (
            <li key={n.label} className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tabular-nums text-foreground sm:text-4xl">{n.value}</span>{" "}
              <span className="text-sm text-muted-foreground">{n.label}</span>
            </li>
          ))}
        </ul>
      )}
      {cs.links && cs.links.length > 0 && (
        <p className="flex flex-wrap gap-x-6 gap-y-2">
          {cs.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              className="font-medium text-link underline decoration-link/50 underline-offset-4 hover:decoration-link"
            >
              {l.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </p>
      )}
      </div>
      {cs.hero && <Screen shot={cs.hero} priority sizes="(min-width: 1024px) 50vw, 100vw" />}
      {!cs.hero && cs.ring && <Ring ring={cs.ring} />}
    </header>
  );
}
