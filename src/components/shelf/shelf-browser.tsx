"use client";

import { type ReactNode, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { CHAPTER_ORDER, type Chapter } from "@/lib/projects/model";
import type { SiteGroup } from "@/lib/search/site-index";
import { useSiteSearch } from "@/lib/search/use-site-search";
import { countOptions, type Lens, matchesFilters, readShelfUrl, type ShelfFilters, type ShelfState, shelfUrl } from "@/lib/projects/shelf";
import { FilterMenu } from "./filter-menu";
import { type Card, CardGrid, Chapters, NotBuiltYet } from "./shelf-results";

// The /projects shelf (Phase 5 P5.4, agreed with Lubo 2026-10-22): one
// search box with "Try" words (like Explore), 2 filters (Industry, Tech)
// with live counts, then the stories + the 3 chapters, or one ranked list
// while searching. State lives in the URL, so a CEO can send the view to a
// partner. Every card is server HTML (cards prop): this only picks which
// to show. Styles: shelf.css.

export type ShelfEntry = { id: string; chapter?: Chapter; industries: readonly string[]; tech: readonly string[] };
const EMPTY: ShelfState = { filters: { industry: [], tech: [] }, q: "" };
const SHELF_GROUPS: readonly SiteGroup[] = ["stories", "projects"];

export function ShelfBrowser(props: {
  intro: ReactNode;
  stack: ReactNode;
  stories: ReactNode;
  entries: readonly ShelfEntry[];
  cards: Record<string, ReactNode>;
  options: ShelfFilters;
  tryWords: readonly string[];
}) {
  const { entries, cards, options } = props;
  const [state, setState] = useState<ShelfState>(EMPTY);
  const [opened, setOpened] = useState<readonly Chapter[]>([]);
  const { load, run, ready } = useSiteSearch(SHELF_GROUPS);

  useEffect(() => {
    const shared = readShelfUrl(window.location.search, options);
    if (shared.q) load();
    // A shared link: show its view after the first paint (the HTML shows all).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (shelfUrl(shared)) setState(shared);
  }, [options, load]);
  useEffect(() => {
    const { pathname, hash } = window.location;
    window.history.replaceState(null, "", pathname + shelfUrl(state) + hash);
  }, [state]);

  // Filter clicks glide (View Transitions); typing never waits on motion.
  const update = (next: ShelfState, glide: boolean) => {
    const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!glide || !d.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) setState(next);
    else d.startViewTransition(() => flushSync(() => setState(next)));
  };
  const toggle = (lens: Lens, v: string) => {
    const picked = state.filters[lens];
    const next = picked.includes(v) ? picked.filter((x) => x !== v) : [...picked, v];
    update({ ...state, filters: { ...state.filters, [lens]: next } }, true);
  };

  const q = state.q.trim();
  const result = q ? run(q) : null;
  const searching = result !== null;
  const full = result && !result.close ? result.hits : [];
  const byId = new Map(entries.map((e) => [e.id, e]));
  const fits = (id: string) => {
    const e = byId.get(id);
    return Boolean(e && matchesFilters(e, state.filters));
  };
  const filtersOn = state.filters.industry.length + state.filters.tech.length > 0;
  const projects = entries.filter((e) => e.chapter);
  const found = searching ? new Set(full.map((h) => h.id)) : undefined;

  const shown: Card[] = full.filter((h) => fits(h.id));
  const closest: Card[] = result?.close ? result.hits.filter((h) => fits(h.id)) : [];
  const groups = CHAPTER_ORDER.map((chapter) => ({
    chapter,
    list: projects.filter((e) => e.chapter === chapter && matchesFilters(e, state.filters)).map((e) => ({ id: e.id })),
  }));
  const inChapters = groups.reduce((n, g) => n + g.list.length, 0);
  const status = searching
    ? `${shown.length} ${shown.length === 1 ? "match" : "matches"}`
    : filtersOn
      ? `${inChapters} of ${projects.length} projects`
      : `${projects.length} projects`;

  return (
    <div className="flex flex-col gap-16" data-active={q !== "" || filtersOn || undefined}>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div className="flex min-w-0 flex-col gap-6">
          {props.intro}
          <div className="shelf-search flex items-center gap-3 rounded-2xl px-4" onPointerEnter={load}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={state.q}
              maxLength={100}
              onFocus={load}
              onChange={(e) => update({ ...state, q: e.target.value }, false)}
              placeholder="Your problem, industry or tool…"
              aria-label="Search projects"
              className="h-14 min-w-0 flex-1 bg-transparent text-lg outline-none"
            />
          </div>
          {props.tryWords.length > 0 && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Try:
              {props.tryWords.map((t) => (
                <button key={t} type="button" onClick={() => (load(), update({ ...state, q: t }, false))} className="cs-chip rounded-full px-3 py-1">
                  {t}
                </button>
              ))}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <FilterMenu
              groups={(["industry", "tech"] as const).map((lens) => ({
                lens,
                label: lens === "industry" ? "Industry" : "Tech",
                options: options[lens],
                counts: countOptions(projects, state.filters, lens, found),
                picked: state.filters[lens],
              }))}
              onToggle={toggle}
            />
            {(q !== "" || filtersOn) && (
              <button type="button" onClick={() => update(EMPTY, true)} className="shelf-clear text-sm font-medium underline-offset-4 hover:underline">
                Clear all
              </button>
            )}
          </div>
          <p className="shelf-total text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {q && !ready ? "Searching…" : q ? `${status} for “${q}”` : status}
          </p>
        </div>
        <div className="shelf-stack-wrap">{props.stack}</div>
      </div>

      {searching ? (
        <section aria-label="Search results" className="flex flex-col gap-10">
          {shown.length > 0 && <CardGrid list={shown} cards={cards} />}
          {shown.length === 0 && full.length > 0 && <p className="text-center text-muted-foreground">Nothing with these filters. Try Clear all.</p>}
          {full.length === 0 && (
            <>
              <NotBuiltYet q={q} />
              {closest.length > 0 && (
                <div className="flex flex-col gap-5">
                  <h2 className="text-xl font-semibold">Closest I&apos;ve built</h2>
                  <CardGrid list={closest} cards={cards} />
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <>
          {!filtersOn && props.stories}
          <Chapters
            groups={groups}
            cards={cards}
            open={(c) => filtersOn || opened.includes(c)}
            onToggle={(c) => setOpened(opened.includes(c) ? opened.filter((x) => x !== c) : [...opened, c])}
          />
        </>
      )}
    </div>
  );
}
