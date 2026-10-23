import "./shelf.css";
import Link from "next/link";
import type { CaseStudy } from "@/lib/case-studies/types";
import { CHAPTERS, type Project } from "@/lib/projects/model";

// The cards of /projects (Phase 5 P5.4). Server-drawn, so every card is in
// the raw HTML for people without JS, Google and AI agents. Lubo: no
// pictures, nothing cluttered, "very easy to stop on": what it is, the one
// number, one line. Light = .edge-card (the finish-line card style), the
// beam moves only on the card under the pointer. Styles: shelf.css.

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link
      href={`/projects/${p.slug}`}
      data-chapter={p.chapter}
      data-beam="hover"
      className="shelf-card edge-card flex h-full flex-col gap-3 rounded-3xl p-6"
    >
      <span className="pj-chip self-start rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
        {CHAPTERS[p.chapter]}
      </span>
      <h3 className="text-xl font-semibold text-balance">{p.name}</h3>
      <span className="flex flex-col">
        <span className="pj-number text-3xl font-semibold tabular-nums">{p.number.value}</span>
        <span className="text-sm text-muted-foreground">{p.number.label}</span>
      </span>
      <span className="text-muted-foreground">{p.oneLine}</span>
      <span className="shelf-tools mt-auto pt-2 text-xs tracking-wide">{p.tech.slice(0, 3).join(" · ")}</span>
    </Link>
  );
}

// A story in the search results: same size as a project card.
export function StoryCard({ c }: { c: CaseStudy }) {
  const n = c.numbers?.[0];
  return (
    <Link href={`/work/${c.slug}`} data-beam="hover" className="shelf-card shelf-card--story edge-card flex h-full flex-col gap-3 rounded-3xl p-6">
      <span className="shelf-story-chip self-start rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
        Full story
      </span>
      <h3 className="text-xl font-semibold text-balance">{c.name}</h3>
      {n && (
        <span className="flex flex-col">
          <span className="pj-number text-3xl font-semibold tabular-nums">{n.value}</span>
          <span className="text-sm text-muted-foreground">{n.label}</span>
        </span>
      )}
      <span className="text-muted-foreground">{c.title}</span>
    </Link>
  );
}

// The 3 stories, big, above the chapters (bento: the first one wide).
export function StoryTiles({ stories }: { stories: readonly CaseStudy[] }) {
  return (
    <section aria-labelledby="stories" className="flex flex-col gap-6">
      <h2 id="stories" className="text-2xl font-semibold sm:text-3xl">
        The full stories
      </h2>
      <ul className="grid gap-5 lg:grid-cols-2">
        {stories.map((c, i) => (
          <li key={c.slug} className={i === 0 ? "lg:col-span-2" : undefined}>
            <Link
              href={`/work/${c.slug}`}
              className={`shelf-story edge-card flex h-full flex-col gap-4 rounded-3xl p-7 sm:p-9 ${i === 0 ? "lg:flex-row lg:items-end lg:justify-between" : ""}`}
            >
              <span className="flex flex-col gap-3">
                <span className="text-sm font-medium tracking-wide text-award">{c.name}</span>
                <span className="text-2xl font-semibold text-balance sm:text-3xl">{c.title}</span>
                <span className="max-w-xl text-muted-foreground">{c.problem}</span>
                <span className="shelf-read pt-1 font-medium">
                  Read the story <span aria-hidden="true">→</span>
                </span>
              </span>
              {c.numbers?.[0] && (
                <span className={`mt-auto flex shrink-0 flex-col ${i === 0 ? "lg:items-end lg:text-right" : ""}`}>
                  <span className="shelf-story-number text-5xl font-semibold tabular-nums">{c.numbers[0].value}</span>
                  <span className="max-w-[16rem] text-sm text-muted-foreground">{c.numbers[0].label}</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
