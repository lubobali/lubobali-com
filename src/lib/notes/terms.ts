// How the Listen voice should SAY a word it gets wrong (Phase 9 P9.8).
// Only the narration changes, never the page. Add a word only after Lubo
// heard it wrong: every change remakes that note's audio (credits), and the
// build says which notes need it (lib/notes/load.ts).
export const TERMS: Record<string, string> = {};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Replace whole words with their spoken spelling (longest first). */
export function sayTerms(text: string, terms: Record<string, string> = TERMS): string {
  let out = text;
  for (const word of Object.keys(terms).sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(`(?<![\\w-])${escape(word)}(?![\\w-])`, "g"), terms[word]);
  }
  return out;
}
