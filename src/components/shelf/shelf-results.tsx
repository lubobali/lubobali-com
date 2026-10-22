import type { ReactNode } from "react";
import { BookCall } from "@/components/book-call";
import { buttonVariants } from "@/components/ui/button";
import { CHAPTERS, type Chapter } from "@/lib/projects/model";

// What the shelf shows under its controls (shelf-browser.tsx decides which
// cards): the 3 chapters while browsing, one ranked list while searching,
// and never a dead end when nothing fits. Each card glides to its new
// place when filters change (view-transition-name per card).

export type Card = { id: string; matched?: readonly string[] };
const vtName = (id: string) => `card-${id.replace(/[^a-z0-9]/gi, "-")}`;

export function CardGrid({ list, cards }: { list: readonly Card[]; cards: Record<string, ReactNode> }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(({ id, matched }) => (
        <li key={id} className="flex flex-col gap-2" style={{ viewTransitionName: vtName(id) }}>
          {cards[id]}
          {matched && matched.length > 0 && <p className="shelf-matched px-2 text-xs">matched: {matched.join(", ")}</p>}
        </li>
      ))}
    </ul>
  );
}

export function Chapters({ groups, cards }: { groups: readonly { chapter: Chapter; list: readonly Card[] }[]; cards: Record<string, ReactNode> }) {
  return groups.map(({ chapter, list }) =>
    list.length === 0 ? null : (
      <section key={chapter} id={`chapter-${chapter}`} data-chapter={chapter} aria-labelledby={`chapter-${chapter}-title`} className="flex scroll-mt-24 flex-col gap-6">
        <h2 id={`chapter-${chapter}-title`} className="flex items-baseline gap-3 text-2xl font-semibold sm:text-3xl">
          {CHAPTERS[chapter]}
          <span className="shelf-count text-base font-medium tabular-nums">{list.length}</span>
        </h2>
        <CardGrid list={list} cards={cards} />
      </section>
    ),
  );
}

// Lubo 2026-10-22: "I haven't built this one yet, but I can." Their words
// go with them into the Blueprint box (/blueprint?idea=...).
export function NotBuiltYet({ q }: { q: string }) {
  return (
    <div className="shelf-none edge-card flex flex-col items-center gap-5 rounded-3xl px-6 py-10 text-center">
      <p className="text-2xl font-semibold text-balance sm:text-3xl">I haven&apos;t built this one yet, but I can.</p>
      <p className="max-w-xl text-muted-foreground">Describe it and get a free AI blueprint in about a minute, or tell me on a call.</p>
      <p className="flex flex-wrap items-center justify-center gap-3">
        <a href={`/blueprint?idea=${encodeURIComponent(q)}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Describe it <span aria-hidden="true">→</span> free AI blueprint
        </a>
        <BookCall size="lg" />
      </p>
    </div>
  );
}
