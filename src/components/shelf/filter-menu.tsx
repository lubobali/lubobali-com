"use client";

import type { Lens } from "@/lib/projects/shelf";

// One filter (Industry or Tech) as a small button that opens a chip panel
// (native popover: Esc, click outside and focus work without our code).
// Keeps the top of /projects clean (Lubo: "very easy to stop on"). Each
// chip shows its live count; a chip with 0 dims and can't be picked, but
// stays in place (no jumping). Styles: shelf.css .shelf-filter*.
export function FilterMenu({
  lens,
  label,
  options,
  counts,
  picked,
  onToggle,
}: {
  lens: Lens;
  label: string;
  options: readonly string[];
  counts: ReadonlyMap<string, number>;
  picked: readonly string[];
  onToggle: (value: string) => void;
}) {
  const id = `filter-${lens}`;
  return (
    <>
      <button type="button" popoverTarget={id} data-lens={lens} className="shelf-filter flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
        {label}
        {picked.length > 0 && <span className="shelf-filter-n rounded-full px-1.5 text-xs tabular-nums">{picked.length}</span>}
        <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div id={id} popover="auto" data-lens={lens} role="group" aria-label={`Filter by ${label.toLowerCase()}`} className="shelf-pop">
        <div className="flex flex-col gap-4 p-5">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
          <ul className="flex flex-wrap gap-2">
            {options.map((v) => {
              const on = picked.includes(v);
              const n = counts.get(v) ?? 0;
              return (
                <li key={v}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={!on && n === 0}
                    onClick={() => onToggle(v)}
                    className="shelf-chip flex min-h-11 items-center gap-2 rounded-full px-4 text-sm"
                  >
                    {v}
                    <span className="shelf-chip-n tabular-nums">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" popoverTarget={id} popoverTargetAction="hide" className="shelf-done self-end rounded-full px-5 py-2 text-sm font-semibold">
            Done
          </button>
        </div>
      </div>
    </>
  );
}
