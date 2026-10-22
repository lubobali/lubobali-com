import { BookCall } from "@/components/book-call";
import { buttonVariants } from "@/components/ui/button";
import { CHAPTER_ORDER, CHAPTERS } from "@/lib/projects/model";
import type { SiteEntry } from "@/lib/search/site-index";

// The result tiles of Explore (explore-panel.tsx). Lubo 2026-10-22: "All
// projects" first and easy to spot, the cards must not all look the same:
// one big "All projects" card, tiles with a number (stories, projects),
// quiet rows for the rest. Styles: explore.css.

export type Tile = { item: Pick<SiteEntry, "title" | "subtitle" | "href" | "number" | "group">; matched: readonly string[] };

type HitProps = { hit: Tile; onPick: () => void; onKey: (e: React.KeyboardEvent, el: HTMLElement) => void };

// "All projects": the one big card on top (Lubo: first and easy to spot),
// the finish-line card style with its moving edge light (edge-card.css).

export function Featured({ hit: { item, matched }, onPick, onKey }: HitProps) {
  return (
    <a
      data-hit
      href={item.href}
      onClick={onPick}
      onKeyDown={(e) => onKey(e, e.currentTarget)}
      className="explore-featured edge-card flex shrink-0 items-center justify-between gap-5 rounded-2xl px-5 py-5 sm:px-7"
    >
      <span className="flex min-w-0 flex-col gap-2">
        <span className="text-2xl font-semibold sm:text-3xl">{item.title}</span>
        <span className="text-muted-foreground">{item.subtitle}</span>
        <span className="flex flex-wrap gap-2 pt-1">
          {CHAPTER_ORDER.map((c) => (
            <span key={c} data-chapter={c} className="pj-chip rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
              {CHAPTERS[c]}
            </span>
          ))}
        </span>
        {matched.length > 0 && <span className="explore-matched text-xs">matched: {matched.join(", ")}</span>}
      </span>
      <span aria-hidden="true" className="explore-featured-arrow grid size-12 shrink-0 place-items-center rounded-full text-xl">
        →
      </span>
    </a>
  );
}

// One result tile (rows on phones, a grid per group on wider screens). A
// page that is not built yet is plain text, not a link. Stories show their
// headline number.
export function Hit({ hit: { item, matched }, onPick, onKey }: HitProps) {
  const body = (
    <>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-semibold">{item.title}</span>
        <span className="text-sm text-muted-foreground">{item.subtitle}</span>
        {item.number && (
          <span className="flex items-baseline gap-2 pt-1">
            <span className="explore-number text-2xl font-semibold tabular-nums">{item.number.value}</span>
            <span className="text-xs text-muted-foreground">{item.number.label}</span>
          </span>
        )}
        {matched.length > 0 && <span className="explore-matched text-xs">matched: {matched.join(", ")}</span>}
      </span>
      {item.href && (
        <span aria-hidden="true" className="explore-arrow shrink-0">
          →
        </span>
      )}
    </>
  );
  const cls = "explore-hit flex h-full items-start justify-between gap-3 rounded-xl px-3.5 py-3";
  if (!item.href) return <div className={cls}>{body}</div>;
  return (
    <a data-hit href={item.href} onClick={onPick} onKeyDown={(e) => onKey(e, e.currentTarget)} className={cls}>
      {body}
    </a>
  );
}

// Nothing found (Lubo 2026-10-22): never a dead end. Their words go with
// them into the Blueprint box.
export function NotBuilt({ q }: { q: string }) {
  return (
    <div className="explore-none edge-card flex shrink-0 flex-col items-center gap-4 rounded-2xl px-5 py-7 text-center">
      <p className="text-xl font-semibold text-balance sm:text-2xl">I haven&apos;t built this one yet, but I can.</p>
      <p className="flex flex-wrap items-center justify-center gap-3">
        <a href={`/blueprint?idea=${encodeURIComponent(q)}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Describe it <span aria-hidden="true">→</span> free AI blueprint
        </a>
        <BookCall size="lg" />
      </p>
    </div>
  );
}
