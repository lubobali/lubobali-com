// The /projects shelf (Phase 5 P5.4): the 2 filters (Industry, Tech), their
// live counts and the shareable URL (/projects?industry=Health&q=...).
// Pure and no imports, so Node tests it directly (scripts/tests/shelf.test.mjs).

export type Lens = "industry" | "tech";
export type ShelfFilters = Record<Lens, readonly string[]>;
export type ShelfState = { filters: ShelfFilters; q: string };
export type ShelfItem = { id: string; industries: readonly string[]; tech: readonly string[] };

const MAX_QUERY = 100; // same cap as the search engine
const values = (item: ShelfItem, lens: Lens) => (lens === "industry" ? item.industries : item.tech);
const fits = (item: ShelfItem, lens: Lens, picked: readonly string[]) =>
  picked.length === 0 || picked.some((v) => values(item, lens).includes(v));

/** Inside one filter any pick may match (OR); both filters must (AND). */
export function matchesFilters(item: ShelfItem, f: ShelfFilters): boolean {
  return fits(item, "industry", f.industry) && fits(item, "tech", f.tech);
}

/** Live count per option of one filter: items the OTHER filter (and the
 * search, when given) allows that carry the option. A filter ignores its
 * own picks, so picking a second industry never shows "0" for it. Every
 * option is listed, zero included (chips dim, never jump away). */
export function countOptions(items: readonly ShelfItem[], f: ShelfFilters, lens: Lens, found?: ReadonlySet<string>) {
  const other: Lens = lens === "industry" ? "tech" : "industry";
  const counts = new Map<string, number>();
  for (const item of items) {
    const ok = fits(item, other, f[other]) && (!found || found.has(item.id));
    for (const v of values(item, lens)) counts.set(v, (counts.get(v) ?? 0) + (ok ? 1 : 0));
  }
  return counts;
}

/** The options worth showing: most used first, then A to Z. */
export function topOptions(items: readonly ShelfItem[], lens: Lens, n: number): string[] {
  return [...countOptions(items, { industry: [], tech: [] }, lens)]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([v]) => v);
}

/** "?q=...&industry=...&tech=..." ("" when nothing is picked). */
export function shelfUrl({ filters, q }: ShelfState): string {
  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  for (const lens of ["industry", "tech"] as const) for (const v of filters[lens]) p.append(lens, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Reads a shared link. Only known values survive (matched without case,
 * written as the site writes them), so a crafted link can't add text. */
export function readShelfUrl(search: string, allowed: ShelfFilters): ShelfState {
  const p = new URLSearchParams(search);
  const pick = (lens: Lens) => {
    const out: string[] = [];
    for (const raw of p.getAll(lens)) {
      const v = allowed[lens].find((a) => a.toLowerCase() === raw.trim().toLowerCase());
      if (v && !out.includes(v)) out.push(v);
    }
    return out;
  };
  return { filters: { industry: pick("industry"), tech: pick("tech") }, q: (p.get("q") ?? "").slice(0, MAX_QUERY) };
}
