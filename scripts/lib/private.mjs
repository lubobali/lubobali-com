// Private-name guard helpers (Phase 9 P9.6): names that must never be on
// the site (clients shown only as a mystery, people). The list itself is a
// CI secret, never in this public repo, and is never printed: a hit is
// reported by its number in the list.

const MIN = 3;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function parseTerms(raw) {
  const terms = raw
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  for (const [i, t] of terms.entries())
    if (t.length < MIN) throw new Error(`private term #${i + 1} is too short (at least ${MIN} characters)`);
  return terms;
}

/** 1-based numbers of the terms found in `text` (case-insensitive, whole words, any spacing). */
export function findPrivate(text, terms) {
  return terms
    .map((t, i) => {
      const words = t.split(/\s+/).map(escape).join("\\s+");
      return new RegExp(`(?<![\\p{L}\\p{N}])${words}(?![\\p{L}\\p{N}])`, "iu").test(text) ? i + 1 : 0;
    })
    .filter(Boolean);
}
