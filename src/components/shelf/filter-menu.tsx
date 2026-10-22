"use client";

import type { Lens } from "@/lib/projects/shelf";

export type FilterGroup = {
  lens: Lens;
  label: string;
  options: readonly string[];
  counts: ReadonlyMap<string, number>;
  picked: readonly string[];
};

// One "Filters" button that opens one panel (native popover: Esc, click
// outside and focus work without our code). Inside: Industry, then Tech,
// each A to Z, one row per option with a checkbox in front, in a single
// column that scrolls (Lubo 2026-10-22: "one page with a scroll bar on the
// side and mark check in front of every row"). Each row shows its live
// count; a row with 0 dims and can't be picked, but stays in place (no
// jumping). Styles: shelf.css .shelf-filter*, .shelf-pop, .shelf-check.
export function FilterMenu({ groups, onToggle }: { groups: readonly FilterGroup[]; onToggle: (lens: Lens, value: string) => void }) {
  const id = "shelf-filters";
  const picked = groups.reduce((n, g) => n + g.picked.length, 0);
  return (
    <>
      <button type="button" popoverTarget={id} className="shelf-filter flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
        Filters
        {picked > 0 && <span className="shelf-filter-n rounded-full px-1.5 text-xs tabular-nums">{picked}</span>}
        <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div id={id} popover="auto" aria-label="Filter projects" className="shelf-pop">
        <div className="shelf-pop-body flex flex-col gap-4 px-5 pb-5">
          {groups.map((g) => (
            <fieldset key={g.lens} id={`shelf-filters-${g.lens}`} aria-labelledby={`shelf-filters-${g.lens}-title`} className="flex flex-col">
              {/* The section title: its own colour + a light that sweeps
                  across now and then, pinned while its list scrolls (Lubo
                  2026-10-22: "easy to spot"). The link jumps to the other. */}
              <div className="shelf-sec sticky top-0 z-10 flex items-center justify-between gap-3 pt-5 pb-3" data-lens={g.lens}>
                <span id={`shelf-filters-${g.lens}-title`} className="shelf-sec-pill rounded-full px-4 py-1.5 text-base font-semibold tracking-wide uppercase">
                  {g.label} <span className="shelf-sec-n text-sm tabular-nums">{g.options.length}</span>
                </span>
                {groups
                  .filter((o) => o.lens !== g.lens)
                  .map((o) => (
                    <button
                      key={o.lens}
                      type="button"
                      data-lens={o.lens}
                      onClick={() => document.getElementById(`shelf-filters-${o.lens}`)?.scrollIntoView({ block: "start", behavior: "smooth" })}
                      className="shelf-sec-jump text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {o.label} {groups.indexOf(o) > groups.indexOf(g) ? "↓" : "↑"}
                    </button>
                  ))}
              </div>
              <ul className="flex flex-col">
                {g.options.map((v) => {
                  const on = g.picked.includes(v);
                  const n = g.counts.get(v) ?? 0;
                  return (
                    <li key={v}>
                      <label className="shelf-check flex min-h-10 items-center gap-3 rounded-lg px-2 text-sm" data-off={(!on && n === 0) || undefined}>
                        <input type="checkbox" checked={on} disabled={!on && n === 0} onChange={() => onToggle(g.lens, v)} className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1">{v}</span>
                        <span className="shelf-chip-n text-xs tabular-nums">{n}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
        </div>
        <div className="shelf-pop-foot flex justify-end p-4">
          <button type="button" popoverTarget={id} popoverTargetAction="hide" className="shelf-done rounded-full px-5 py-2 text-sm font-semibold">
            Done
          </button>
        </div>
      </div>
    </>
  );
}
