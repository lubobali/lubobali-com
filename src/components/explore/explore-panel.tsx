"use client";

import { useEffect, useRef, useState } from "react";
import { BookCall } from "@/components/book-call";
import { buttonVariants } from "@/components/ui/button";
import { exploreGroups, exploreTry, searchExplore } from "@/lib/explore";
import type { SearchHit } from "@/lib/search/engine";
import { useSiteSearch } from "@/lib/search/use-site-search";
import { Featured, Hit, NotBuilt, type Tile } from "./explore-hits";
import { ExploreDebug } from "./explore-debug";

// The Explore panel: a search over Lubo's work that reads like a query
// (Lubo: "something different than the others"): explore("fraud") ->
// 1 match in 0.1 ms, each result says why it matched. Native <dialog>
// (Esc, focus, screen readers). Arrow keys move through the results.
// Phase 5 P5.5: typing searches the whole site (/search-index.json, every
// project too), fetched when the panel opens; until it arrives the small
// built-in list answers. Empty box = the built-in list. Styles: explore.css.
export default function ExplorePanel({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const site = useSiteSearch();
  const { load } = site;
  // The time is measured in the event (not during render), so it is real.
  const [{ query, ms }, setSearch] = useState({ query: "", ms: 0 });
  const setQuery = (q: string) => {
    const t = performance.now();
    if (site.ready) site.run(q);
    else searchExplore(q);
    setSearch({ query: q, ms: performance.now() - t });
  };

  const q = query.trim();
  const result = q && site.ready ? site.run(q) : null;
  const tiles = (hs: readonly SearchHit[]): Tile[] =>
    hs.flatMap((h) => {
      const item = site.entry(h.id);
      return item ? [{ item, matched: h.matched }] : [];
    });
  const hits: Tile[] = result ? (result.close ? [] : tiles(result.hits)) : searchExplore(query);
  const closest: Tile[] = result?.close ? tiles(result.hits) : [];

  useEffect(load, [load]);
  useEffect(() => {
    const d = dialog.current;
    // showModal focuses the [autofocus] element (else the first one, the
    // search box). Mouse/trackpad: start in the search box. Touch: start on
    // the X, because focusing the box opens the keyboard, and on iPad that
    // squeezed the panel to the search bar only (Lubo's iPad mini,
    // 2026-10-29). Touch: the cards show, tap the box to type.
    // iPads can report a fine pointer, but never zero touch points.
    const touch = navigator.maxTouchPoints > 0 || !matchMedia("(pointer: fine)").matches;
    const start = touch ? ".explore-close" : "input";
    d?.querySelector(start)?.setAttribute("autofocus", "");
    d?.showModal();
    document.documentElement.classList.add("explore-open");
    return () => document.documentElement.classList.remove("explore-open");
  }, []);

  const results = () => Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a[data-hit]") ?? []);
  const move = (e: React.KeyboardEvent, el?: HTMLElement) => {
    const all = results();
    const from = el ? all.indexOf(el as HTMLAnchorElement) : -1;
    if (e.key === "ArrowDown" && all[from + 1]) all[from + 1].focus();
    else if (e.key === "ArrowUp") (from > 0 ? all[from - 1] : dialog.current?.querySelector("input"))?.focus();
    else return;
    e.preventDefault();
  };

  const pick = () => dialog.current?.close();
  const time = ms < 0.1 ? "under 0.1 ms" : `${ms.toFixed(1)} ms`;
  const count = `${hits.length} ${hits.length === 1 ? "match" : "matches"}`;

  return (
    <dialog
      ref={dialog}
      aria-label="Explore my work"
      className="explore-dialog"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
    >
      <div className="explore-panel flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="explore-search flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-4">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              data-track-box="explore search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") move(e);
                if (e.key === "Enter") results()[0]?.click();
                // In a search box the browser's first Esc only clears it.
                if (e.key === "Escape") dialog.current?.close();
              }}
              placeholder="Search my work…"
              aria-label="Search my work"
              className="h-12 min-w-0 flex-1 bg-transparent text-lg outline-none sm:h-13 sm:text-xl"
            />
          </div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="explore-close shrink-0">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <p className="explore-query text-xs sm:text-sm" aria-live="polite">
          <span className="explore-fn">explore</span>(&quot;{query.trim()}&quot;) <span aria-hidden="true">→</span> {count} · {time}
        </p>

        {query.trim() === "" && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            Try:
            {exploreTry.map((t) => (
              <button key={t} type="button" onClick={() => setQuery(t)} className="cs-chip rounded-full px-3 py-1">
                {t}
              </button>
            ))}
          </p>
        )}

        <div ref={list} className="explore-results -mx-1 flex flex-col gap-3 overflow-y-auto px-1">
          {exploreGroups.map((g) => {
            const inGroup = hits.filter((h) => h.item.group === g.id);
            if (inGroup.length === 0) return null;
            if (g.id === "featured") return inGroup.map((hit) => <Featured key={hit.item.title} hit={hit} onPick={pick} onKey={move} />);
            return <Group key={g.id} id={g.id} label={g.label} tiles={inGroup} onPick={pick} onKey={move} />;
          })}
          {q !== "" && hits.length === 0 && (
            <>
              <NotBuilt q={q} />
              {closest.length > 0 && <Group id="closest" label="Closest I've built" tiles={closest} onPick={pick} onKey={move} />}
            </>
          )}
        </div>

        {/* The "not built yet" card already carries both buttons. */}
        {!(q !== "" && hits.length === 0) && (
          <div className="explore-actions flex flex-wrap items-center justify-center gap-3 pt-3">
            <a href="/blueprint" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Free AI blueprint
            </a>
            <BookCall size="lg" />
          </div>
        )}
      </div>
      {location.search.includes("debug") && <ExploreDebug dialog={dialog} />}
    </dialog>
  );
}

type GroupProps = { id: string; label: string; tiles: readonly Tile[]; onPick: () => void; onKey: (e: React.KeyboardEvent, el: HTMLElement) => void };

// One group of results: its label, then its tiles (rows on phones, a grid
// on wider screens).
function Group({ id, label, tiles, onPick, onKey }: GroupProps) {
  return (
    <section aria-label={label} data-group={id} className="explore-section flex flex-col gap-2.5 rounded-2xl p-3">
      <h2 className="explore-group flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
        <span aria-hidden="true" className="explore-dot" />
        {label}
      </h2>
      <ul className={`explore-grid explore-grid--${id} grid gap-2`}>
        {tiles.map((hit) => (
          <li key={hit.item.title}>
            <Hit hit={hit} onPick={onPick} onKey={onKey} />
          </li>
        ))}
      </ul>
    </section>
  );
}
