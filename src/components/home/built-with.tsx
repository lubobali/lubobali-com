import { storyPath } from "@/lib/case-studies";
import { projectName, tech } from "@/lib/tech";
import { LOGOS } from "./tech-logos";

// Built with (Phase 3 H8, Lubo): the real tool logos on a slowly turning
// dial, LB logo in the middle. Each logo links to the story of the project
// it was used in (the home card while a story is unpublished); hover/focus shows "name → project" in the middle. No JavaScript:
// the middle is a checkbox label (click = stop/start), hover or keyboard
// focus also stops it, reduced motion = still. Every name is real text in
// the link (bots + screen readers read all 13). overflow-x-clip: the turning
// ring's square corners would scroll the phone sideways. Styles: .tech-*.
export function BuiltWith() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      className="relative mx-auto grid w-full max-w-6xl items-center justify-center overflow-x-clip gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,24rem)_auto] lg:gap-14 lg:py-12"
    >
      <div className="relative flex max-w-md flex-col gap-4">
        {/* Soft navy behind the text: the rain moves around it (Lubo). */}
        <div aria-hidden="true" className="rain-clear absolute -inset-x-10 -inset-y-10 bg-background" />
        <h2 id="stack-title" className="relative text-3xl font-semibold text-balance sm:text-4xl">
          Built with
        </h2>
        <p className="relative text-balance text-muted-foreground">
          A few of the tools I build with. Pick one to see a project I used it in.
        </p>
      </div>
      <div className="tech-wheel" style={{ ["--n" as string]: tech.length }}>
        <input id="tech-wheel-stop" type="checkbox" className="tech-wheel-toggle sr-only" />
        <div aria-hidden="true" className="tech-wheel-bezel" />
        <ul className="tech-wheel-ring" aria-label="Tools I build with">
          {tech.map((t, i) => {
            const logo = LOGOS[t.logo];
            return (
              <li key={t.name} className="tech-wheel-slot" style={{ ["--i" as string]: i }}>
                <a href={storyPath(t.project) ?? `#${t.project}`} className="tech-coin" data-logo={t.logo}>
                  <svg
                    aria-hidden="true"
                    viewBox={logo.viewBox}
                    dangerouslySetInnerHTML={{ __html: logo.body }}
                  />
                  <span className="sr-only">{`${t.name}, used in ${projectName(t.project)}`}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <label htmlFor="tech-wheel-stop" className="tech-wheel-hub">
          <span aria-hidden="true" className="tech-wheel-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/lb-logo-lg.webp" alt="" width={229} height={240} loading="lazy" decoding="async" />
          </span>
          <span className="sr-only">Stop or start the turning tool wheel</span>
        </label>
        <div aria-hidden="true" className="tech-wheel-labels">
          {tech.map((t) => (
            <p key={t.name} className="tech-wheel-label">
              <span>{t.name}</span>
              <span className="text-award">{projectName(t.project)} →</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
