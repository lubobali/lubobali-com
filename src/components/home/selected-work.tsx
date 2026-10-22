import Link from "next/link";
import { storyPath } from "@/lib/case-studies";
import { work } from "@/lib/work";
import { WorkArt } from "./work-art";

// Selected work (Phase 3 H7): LuBot, HelloPayments, GraphGuard-AI.
// Wide cards, one under another (different rhythm from the 3 award cards
// above). Each card has its own tone, light beam and moving picture, and
// the middle one is mirrored on desktop (Lubo: all 3 should look different).
// Data: src/lib/work.ts. Styles: globals.css .work-*.
export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20"
    >
      <h2 id="work-title" className="text-3xl font-semibold text-balance sm:text-4xl">
        Selected work
      </h2>
      <ul className="mt-10 flex flex-col gap-6">
        {work.map((w) => {
          // "Read the story" first once the case study is published (C6b).
          const story = storyPath(w.id);
          const links = [...(story ? [{ label: "Read the story", url: story }] : []), ...w.links];
          return (
            <li
              key={w.name}
              id={w.id}
              data-tone={w.tone}
              className="work-card scroll-mt-24 grid gap-6 rounded-2xl p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12"
            >
              <div className="flex min-w-0 flex-col gap-3">
                <h3 className="text-2xl font-semibold">{w.name}</h3>
                <p className="text-sm font-medium tracking-wide text-award">{w.role}</p>
                <p className="text-muted-foreground">{w.summary}</p>
                <ul aria-label="Tech stack" className="flex flex-wrap gap-2 pt-1">
                  {w.stack.map((t) => (
                    <li key={t} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                      {t}
                    </li>
                  ))}
                </ul>
                {links.length > 0 && (
                  <p className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm font-medium">
                    {links.map((l) => (
                      <a key={l.url} href={l.url} className="text-link underline-offset-4 hover:underline">
                        {l.label} <span aria-hidden="true">→</span>
                      </a>
                    ))}
                  </p>
                )}
              </div>
              <div className="work-side flex min-w-0 flex-col gap-6 lg:border-l lg:border-border lg:pl-12">
                <WorkArt art={w.art} />
                <ul aria-label={`${w.name} results`} className="flex flex-col gap-4">
                  {w.highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="work-check mt-0.5 shrink-0"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-10 flex justify-center">
        <Link href="/projects" className="work-all inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold">
          See all projects <span aria-hidden="true">→</span>
        </Link>
      </p>
    </section>
  );
}
