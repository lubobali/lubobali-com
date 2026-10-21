"use client";

import { lazy, Suspense, useEffect, useState } from "react";

// "Explore" next to the logo (Phase 4 C6, Lubo: keep the header clean, the
// two buttons stay the main actions). Quiet text, not a pill. The panel and
// its search index load only on the first open, so pages stay as light as
// before. Opens with a click, Ctrl/Cmd+K or "/" (the ⌘K hint stays: Lubo
// likes the look).
const ExplorePanel = lazy(() => import("./explore-panel"));

export function ExploreButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="explore-trigger flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="max-sm:sr-only">Explore</span>
        <kbd className="explore-kbd hidden rounded px-1.5 text-[11px] lg:inline">⌘K</kbd>
      </button>
      {open && (
        <Suspense fallback={null}>
          <ExplorePanel onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
