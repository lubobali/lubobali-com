import "./resume.css";
import Link from "next/link";
import { DataRain } from "@/components/ambient/data-rain";
import { BookCall } from "@/components/book-call";
import { buttonVariants } from "@/components/ui/button";
import { industriesLabel, systemCount } from "@/lib/about";
import { storyPath } from "@/lib/case-studies";
import { FIT_TERMS } from "@/lib/fit/terms";
import { fitSources } from "@/lib/fit";
import { matchFit } from "@/lib/fit/match";
import { resume, resumePdfPath } from "@/lib/resume";
import { resumePage } from "@/lib/resume-page";
import { site } from "@/lib/site";
import { FitBox } from "./fit-box";

// /resume sections (Phase 6, P6.7). Top: the fit box (client island, the
// only JavaScript here). Below, not a copy of the PDF (Lubo 2026-10-24):
// the career as a journey with one proof number per step, skills counted
// from real work, and the full text folded (people skim, bots read it all).
// Same cards and lighter to darker journey as /about. Styles: resume.css.

const eyebrow = "text-sm font-semibold tracking-wide text-award uppercase";

export function ResumeHero() {
  return (
    <section id="fit" aria-labelledby="resume-title" className="relative scroll-mt-20 overflow-hidden">
      <DataRain />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-80 -left-80 size-[60rem] rounded-full bg-[radial-gradient(closest-side,var(--glow-brand),transparent)]"
      />
      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-12 pb-8 sm:px-6 lg:pt-20 lg:pb-10">
        <p className={eyebrow}>{resumePage.eyebrow}</p>
        <h1 id="resume-title" className="text-hero font-semibold text-balance">
          {resumePage.heading}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">{resumePage.sub}</p>
        <FitBox
          sources={fitSources}
          systems={systemCount}
          industries={industriesLabel}
          availability={site.availability}
          bookUrl={site.bookCall.url}
        />
        <div className="flex flex-wrap gap-3">
          <a href={resumePdfPath} className={buttonVariants({ variant: "outline", size: "xl" })} download>
            {resumePage.pdfLabel}
          </a>
          <BookCall />
        </div>
      </div>
    </section>
  );
}

export function ResumeJourney() {
  return (
    <section id="experience" aria-labelledby="cv-journey" className="flex scroll-mt-20 flex-col gap-8">
      <h2 id="cv-journey" className="text-3xl font-semibold text-balance sm:text-4xl">
        {resumePage.journeyHeading}
      </h2>
      <ol className="cv-journey">
        {resumePage.journey.map((step, i) => {
          const story = "story" in step ? storyPath(step.story) : undefined;
          return (
            <li key={step.company} className="cv-step edge-card rounded-3xl p-6" data-beam="hover" data-step={i}>
              <span className="cv-years tabular-nums">{step.years}</span>
              <h3 className="text-lg font-semibold">{step.company}</h3>
              <p className="cv-role">{step.role}</p>
              <p className="cv-figure">{step.value}</p>
              <p className="text-sm text-muted-foreground">{step.label}</p>
              {story && (
                <Link href={story} prefetch={false} className="cv-story mt-auto">
                  {resumePage.storyLink} →
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// Skills counted from the proof the fit box uses (lib/fit), so a new
// project grows its bars the day it's added. Tech only, broadest first.
const SKILL_KINDS = new Set(["ai", "data", "cloud", "app", "analytics"]);
// LLMs and prompting are proven by the same AI projects as AI agents: one bar, not three.
const NOT_BARS = new Set(["llm", "prompting"]);
const query = (t: (typeof FIT_TERMS)[number]) => t.short?.[0] ?? t.aliases[0];
const SKILLS_SHOWN = 12;
const skillBars = FIT_TERMS.filter((t) => SKILL_KINDS.has(t.kind) && !NOT_BARS.has(t.id) && query(t))
  .map((t) => ({ term: t, count: matchFit(query(t), FIT_TERMS, fitSources).needs.find((n) => n.id === t.id)?.proof.length ?? 0 }))
  .filter((b) => b.count > 0)
  .sort((a, b) => b.count - a.count)
  .slice(0, SKILLS_SHOWN);
const shortLabel = (label: string) => label.replace(/\s*\(.*\)$/, "");

export function ResumeSkillsEducation() {
  const max = skillBars[0]?.count ?? 1;
  return (
    <section aria-label="Skills and education" className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">{resumePage.skillsMapHeading}</h2>
          <p className="text-muted-foreground">{resumePage.skillsMapHint}</p>
        </div>
        <ul className="cv-bars">
          {skillBars.map(({ term, count }) => (
            <li key={term.id}>
              <a href={`/resume?fit=${encodeURIComponent(query(term))}#fit`} className="cv-bar">
                <span className="cv-bar-name">{shortLabel(term.label)}</span>
                <span className="cv-bar-track" aria-hidden="true">
                  <span className="cv-bar-fill" style={{ inlineSize: `${Math.round((count / max) * 100)}%` }} />
                </span>
                <span className="cv-bar-count tabular-nums">{count}</span>
              </a>
            </li>
          ))}
        </ul>
        <Link href="/projects" prefetch={false} className={`${buttonVariants({ variant: "outline", size: "lg" })} w-fit`}>
          {resumePage.projectsLink}
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">{resumePage.educationHeading}</h2>
        <ul className="flex flex-col gap-5">
          {resume.education.map((e) => (
            <li key={e.degree} className="flex flex-col gap-1 border-t border-award/25 pt-4">
              <span className="font-semibold">{e.degree}</span>
              <span className="text-muted-foreground">
                {e.school}
                {e.dates && ` · ${e.dates}`}
              </span>
              {"verify" in e && (
                <span className="cv-verify">
                  Verified:{" "}
                  {e.verify.map((v) => (
                    <a key={v.url} href={v.url} target="_blank" rel="noopener">
                      {v.label}
                      <span className="sr-only"> credential (opens in a new tab)</span>
                    </a>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// The whole resume as text, folded: people skim the journey, Google and AI
// assistants still read every line (it's in the HTML).
export function ResumeFullText() {
  return (
    <details className="cv-full">
      <summary>{resumePage.fullResume}</summary>
      <div className="flex flex-col gap-8 pt-6">
        {resume.jobs.map((j) => (
          <div key={j.company} className="flex flex-col gap-2">
            <h3 className="font-semibold">
              {j.company} · {j.title} <span className="font-normal text-muted-foreground">· {j.dates}</span>
            </h3>
            <ul className="cv-bullets">
              {j.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">Tech: {j.stack}</p>
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">{resumePage.skillsHeading}</h3>
          {resume.skills.map((g) => (
            <p key={g.label} className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{g.label}:</span> {g.items}
            </p>
          ))}
        </div>
        <a href={resumePdfPath} className={`${buttonVariants({ variant: "outline", size: "lg" })} w-fit`} download>
          {resumePage.pdfLabel}
        </a>
      </div>
    </details>
  );
}
