// Site search engine (Phase 5 P5.2, Lubo: "type a word or two and find if
// I built something like this"). Pure and dependency-free: no imports, so
// Node runs the tests on this file directly. No LLM, no server: 500 docs
// search in about a millisecond in the browser.
//
// How a query is read:
// 1. normalize (lower case, no accents/punctuation), drop filler words;
// 2. same-meaning groups turn CEO words into terms with alternatives
//    ("employees leaving" -> churn, attrition ...), phrases first;
// 3. every term must hit the doc (AND). A hit in the title counts most,
//    then a keyword, then the text; an exact word beats a same-meaning
//    word, a prefix (still typing) and a typo, in that order;
// 4. nothing matches every term -> the docs that match some, marked
//    `close`, so the panel can say "closest projects".

export type SearchDoc = {
  id: string;
  title: string;
  keywords: readonly string[]; // shown back as "matched: ..."
  text: string; // searched, never shown
};

export type SearchHit = { id: string; matched: string[] };
export type SearchResult = { hits: SearchHit[]; close: boolean };

const MAX_QUERY = 100; // characters; longer input is cut, never slow

// Filler, including how CEOs phrase a search ("find similar projects you
// built"): these words never have to match.
const FILLER = new Set(
  ("a an and any are as at be by can do does for from have help how i in is it me my need of on " +
    "or our some something that the their there this to us want we what which who with you your " +
    "about build built find example examples like looking make project projects similar show")
    .split(" "),
);

const WEIGHT = { title: 5, keyword: 3, text: 1 } as const;
const QUALITY = { exact: 1, synonym: 0.8, prefix: 0.7, typo: 0.5 } as const;
const EXACT_BONUS = 0.5; // per term, when the typed word itself is in the doc

/** Lower case, accents and punctuation removed, single spaces. */
export function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Light stemming: "dashboards" and "dashboard" are the same word.
const stem = (w: string) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
const words = (s: string) => normalize(s).split(" ").filter(Boolean).map(stem);

/** A phrase the way search sees it (normalized, plurals folded). */
export const searchKey = (s: string) => words(s).join(" ");

// Typo distance (optimal string alignment: a swap counts as one edit),
// stopped early once it is over the limit.
export function typoDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, prev2[j - 2] + 1);
      cur.push(d);
      best = Math.min(best, d);
    }
    if (best > limit) return limit + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

const typoLimit = (w: string) => (w.length >= 8 ? 2 : w.length >= 5 ? 1 : 0);

type Field = { weight: number; words: Set<string>; joined: string; label?: string };
type Prepared = { doc: SearchDoc; fields: Field[] };
// One query term: what the visitor typed (`typed`, stemmed; typo + prefix
// allowed), how to show it back (`shown`, never trimmed) and same-meaning
// alternatives (each a word list, matched exactly).
type Term = { typed?: string; shown: string; alternatives: string[][] };

function prepare(doc: SearchDoc): Prepared {
  const field = (weight: number, text: string, label?: string): Field => {
    const w = words(text);
    return { weight, words: new Set(w), joined: ` ${w.join(" ")} `, label };
  };
  return {
    doc,
    fields: [
      field(WEIGHT.title, doc.title),
      ...doc.keywords.map((k) => field(WEIGHT.keyword, k, k)),
      field(WEIGHT.text, doc.text),
    ],
  };
}

// Same-meaning groups -> lookup from each phrase (as word list) to its group.
function prepareSynonyms(groups: readonly (readonly string[])[]) {
  const byPhrase = new Map<string, string[][]>();
  let longest = 1;
  for (const group of groups) {
    const phrases = group.map(words).filter((p) => p.length > 0);
    for (const p of phrases) {
      byPhrase.set(p.join(" "), phrases);
      longest = Math.max(longest, p.length);
    }
  }
  return { byPhrase, longest };
}

function parse(query: string, syn: ReturnType<typeof prepareSynonyms>): Term[] {
  const raw = normalize(query.slice(0, MAX_QUERY)).split(" ").filter(Boolean);
  const all = raw.map(stem);
  const terms: Term[] = [];
  for (let i = 0; i < all.length; ) {
    let used = 0;
    // Longest same-meaning phrase starting here wins ("employees leaving").
    for (let n = Math.min(syn.longest, all.length - i); n >= 1 && !used; n--) {
      const group = syn.byPhrase.get(all.slice(i, i + n).join(" "));
      if (group) {
        terms.push({ typed: n === 1 ? all[i] : undefined, shown: raw.slice(i, i + n).join(" "), alternatives: group });
        used = n;
      }
    }
    if (!used) {
      if (!FILLER.has(all[i])) terms.push({ typed: all[i], shown: raw[i], alternatives: [] });
      used = 1;
    }
    i += used;
  }
  return terms;
}

// How well a typed word fits each word of the site's vocabulary: done
// once per search (not once per doc), so 500 docs stay ~1 ms. A word that
// exists on the site (or starts one) is never read as a typo of another
// word: "stock" must not find "stack". And a whole word that exists on the
// site is not also a prefix of longer ones: "posts" must not find
// "PostgreSQL" (prefixes are for words still being typed: "postg").
function fits(typed: string, vocabulary: readonly string[]): Map<string, number> {
  const out = new Map<string, number>();
  if (vocabulary.includes(typed)) return out.set(typed, QUALITY.exact);
  for (const w of vocabulary) {
    if (typed.length >= 3 && w.startsWith(typed)) out.set(w, QUALITY.prefix);
  }
  const limit = typoLimit(typed);
  if (out.size > 0 || !limit) return out;
  for (const w of vocabulary) if (typoDistance(typed, w, limit) <= limit) out.set(w, QUALITY.typo);
  return out;
}

// Best score of one term in one field (0 = no hit).
function scoreField(term: Term, fit: Map<string, number> | undefined, f: Field): number {
  let best = 0;
  for (const alt of term.alternatives) {
    if (f.joined.includes(` ${alt.join(" ")} `)) {
      best = Math.max(best, alt.length === 1 && alt[0] === term.typed ? QUALITY.exact : QUALITY.synonym);
    }
  }
  if (fit) for (const [w, q] of fit) if (q > best && f.words.has(w)) best = q;
  return best * f.weight;
}

/** Builds a search function over `docs`; call it on every key press. */
export function createSearch(docs: readonly SearchDoc[], synonyms: readonly (readonly string[])[]) {
  const prepared = docs.map(prepare);
  const syn = prepareSynonyms(synonyms);
  const vocabulary = [...new Set(prepared.flatMap((p) => p.fields.flatMap((f) => [...f.words])))];

  return function search(query: string): SearchResult {
    const terms = parse(query, syn);
    if (terms.length === 0) return { hits: docs.map((d) => ({ id: d.id, matched: [] })), close: false };

    const fit = terms.map((t) => (t.typed ? fits(t.typed, vocabulary) : undefined));
    const scored = prepared.map(({ doc, fields }) => {
      let score = 0;
      let hitTerms = 0;
      const matched: string[] = [];
      terms.forEach((term, i) => {
        let best = 0;
        let label: string | undefined;
        for (const f of fields) {
          const s = scoreField(term, fit[i], f);
          if (s > best) [best, label] = [s, f.label];
        }
        if (best > 0) {
          hitTerms++;
          // The visitor's own word, found as typed anywhere in the doc, beats
          // a same-meaning match: "linkedin posts" ranks the page that says
          // "LinkedIn" above every other Marketing page.
          if (term.typed && fields.some((f) => f.words.has(term.typed!))) best += EXACT_BONUS;
          score += best;
          const shown = label ?? (term.typed && !fields[0].words.has(term.typed) ? term.shown : undefined);
          if (shown && !matched.includes(shown)) matched.push(shown);
        }
      });
      return { id: doc.id, matched, score, hitTerms };
    });

    const rank = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
      b.hitTerms - a.hitTerms || b.score - a.score;
    const strip = ({ id, matched }: (typeof scored)[number]) => ({ id, matched });

    const full = scored.filter((s) => s.hitTerms === terms.length).sort(rank);
    if (full.length > 0) return { hits: full.map(strip), close: false };
    const some = scored.filter((s) => s.hitTerms > 0).sort(rank);
    return { hits: some.map(strip), close: some.length > 0 };
  };
}
