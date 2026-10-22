"use client";

import { useEffect, useRef, useState } from "react";
import { BookCall } from "@/components/book-call";
import { buttonVariants } from "@/components/ui/button";
import { type ExploreHit, exploreGroups, exploreTry, searchExplore } from "@/lib/explore";

// The Explore panel: a search over Lubo's work that reads like a query
// (Lubo: "something different than the others"): explore("fraud") ->
// 1 match in 0.1 ms, each result says why it matched. Native <dialog>
// (Esc, focus, screen readers). Arrow keys move through the results.
// Styles: explore.css.
export default function ExplorePanel({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLDivElement>(null);
  // Search runs in the event (not during render), so the time is real.
  const [{ query, hits, ms }, setSearch] = useState(() => ({ query: "", hits: searchExplore(""), ms: 0 }));
  const setQuery = (q: string) => {
    const t = performance.now();
    const found = searchExplore(q);
    setSearch({ query: q, hits: found, ms: performance.now() - t });
  };

  useEffect(() => {
    const d = dialog.current;
    d?.showModal();
    // showModal focuses the first button (the X): start in the search box.
    d?.querySelector("input")?.focus();
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
              autoFocus
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
            if (g.id === "featured")
              return inGroup.map((hit) => <Featured key={hit.item.title} hit={hit} onPick={() => dialog.current?.close()} onKey={move} />);
            return (
              <section key={g.id} aria-label={g.label} data-group={g.id} className="explore-section flex flex-col gap-2.5 rounded-2xl p-3">
                <h2 className="explore-group flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  <span aria-hidden="true" className="explore-dot" />
                  {g.label}
                </h2>
                <ul className={`explore-grid explore-grid--${g.id} grid gap-2`}>
                  {inGroup.map((hit) => (
                    <li key={hit.item.title}>
                      <Hit hit={hit} onPick={() => dialog.current?.close()} onKey={move} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {hits.length === 0 && (
            <p className="rounded-xl p-4 text-muted-foreground">
              Nothing for &quot;{query.trim()}&quot; yet. Tell me about it on a call: maybe it&apos;s your project.
            </p>
          )}
        </div>

        <div className="explore-actions flex flex-wrap items-center justify-center gap-3 pt-3">
          <a href="/blueprint" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Free AI blueprint
          </a>
          <BookCall size="lg" />
        </div>
      </div>
    </dialog>
  );
}

type HitProps = { hit: ExploreHit; onPick: () => void; onKey: (e: React.KeyboardEvent, el: HTMLElement) => void };

// "All projects": the one big card on top (Lubo: first and easy to spot),
// the finish-line card style with its moving edge light (edge-card.css).
const CHAPTER_CHIPS = [
  ["analytics", "Analytics & dashboards"],
  ["pipelines", "Data pipelines"],
  ["ai", "AI agents"],
] as const;
function Featured({ hit: { item, matched }, onPick, onKey }: HitProps) {
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
          {CHAPTER_CHIPS.map(([c, label]) => (
            <span key={c} data-chapter={c} className="pj-chip rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
              {label}
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
function Hit({ hit: { item, matched }, onPick, onKey }: HitProps) {
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
