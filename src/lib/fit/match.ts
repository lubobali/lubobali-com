// "Does Lubo fit your project?" (Phase 6, P6.6): reads a pasted job post or
// a short question and lists each need it names, with the real work that
// proves it. Pure and dependency-free (types only), so Node runs the tests on
// it directly; it runs in the visitor's browser, nothing is sent anywhere.
//
// Rules (Lubo 2026-10-24):
// - a need is "yes" (✓) only when real work proves it, with links: a claim
//   a CEO can't check would cost more than a miss;
// - otherwise it is "new": a new tool for the same job, said positively,
//   with the closest real work (copy.ts), never "can't" or "not qualified";
// - no percentage score; years of experience are not judged.
import type { FitKind, FitTerm } from "./terms";

/** One piece of work that can prove a skill. */
export type FitSource = {
  kind: "story" | "job" | "project" | "page";
  id: string;
  title: string;
  href: string;
  tags: readonly string[]; // tech + industries, as the data writes them
  chapter?: string;
  job?: string; // a story that is also a resume job proves "job:<id>"
};

export type FitProof = { kind: FitSource["kind"]; id: string; title: string; href: string };

export type FitNeed = {
  id: string;
  label: string;
  kind: FitKind;
  status: "yes" | "new";
  proof: FitProof[];
  closest: { id: string; label: string; proof: FitProof[] }[];
};

export type FitTopic = "rate" | "availability" | "location";

export type FitResult = { needs: FitNeed[]; found: number; total: number; topics: FitTopic[] };

const MAX_TEXT = 20_000; // characters; a longer paste is cut, never slow

// Lines every job post has that are not skills. Masked before matching, so
// "health insurance" never reads as healthcare experience.
const NOISE = [
  "health insurance", "medical insurance", "dental insurance", "vision insurance", "life insurance",
  "disability insurance", "insurance coverage", "medical dental", "dental and vision", "health benefits",
  "health savings", "wellness", "stock option", "employee stock", "401 k", "401k", "paid time off",
  "parental leave", "equal opportunity", "employee benefits", "background check", "sales pipeline",
  "intellectual property", "health and safety",
  // People called agents, not AI agents.
  "real estate agent", "insurance agent", "support agent", "customer service agent", "call center agent",
  "sales agent", "travel agent", "user agent", "free agent",
];

const TOPICS: { topic: FitTopic; re: RegExp }[] = [
  { topic: "rate", re: /\b(rates?|hourly|salary|how much|budget|fee)\b/i },
  { topic: "availability", re: /\b(available|availability|start date|when can you start|full[- ]time|part[- ]time)\b/i },
  { topic: "location", re: /\b(relocat\w*|on[- ]?site|in[- ]office|time ?zone)\b/i },
];

const KIND_ORDER: Record<FitProof["kind"], number> = { story: 0, job: 1, page: 2, project: 3 };

// Like the site search (search/engine.ts): lower case, no accents or
// punctuation, plurals folded. Kept here so this file has no
// runtime imports (Node loads it in the tests).
const normalize = (s: string) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
// Plurals folded: "dashboards" = "dashboard", "harnesses" / "matches" /
// "boxes" lose their "es", "libraries" = "library".
const stem = (w: string) =>
  w.length <= 3 || !w.endsWith("s") || w.endsWith("ss")
    ? w
    : /(?:ss|x|ch|sh)es$/.test(w)
      ? w.slice(0, -2)
      : /[^aeiou]ies$/.test(w)
        ? `${w.slice(0, -3)}y`
        : w.slice(0, -1);
const key = (s: string) => normalize(s).split(" ").filter(Boolean).map(stem).join(" ");

/** Work that proves a term, from its proof keys (see terms.ts). */
export function proveTerm(term: FitTerm, sources: readonly FitSource[]): FitProof[] {
  const hits = new Map<string, FitSource>();
  for (const k of term.proof) {
    const at = k.indexOf(":");
    const type = k.slice(0, at);
    const value = k.slice(at + 1);
    for (const s of sources) {
      const ok =
        type === "tech" || type === "industry"
          ? s.tags.some((t) => key(t) === key(value))
          : type === "chapter"
            ? s.chapter === value
            : (s.kind === type && s.id === value) || (type === "job" && s.job === value);
      if (ok) hits.set(s.href, s);
    }
  }
  return [...hits.values()]
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
    .map(({ kind, id, title, href }) => ({ kind, id, title, href }));
}

type Found = { term: FitTerm; at: number };

/** Every term the text names, in the order the text names them. */
export function findTerms(text: string, terms: readonly FitTerm[]): Found[] {
  const raw = text.slice(0, MAX_TEXT);
  let hay = ` ${key(raw)} `;
  // Masks keep the length, so positions (the order needs are shown in) stay true.
  const mask = (p: string) => p.replace(/[^ ]/g, "_");
  for (const n of NOISE) hay = hay.split(` ${key(n)} `).join(` ${mask(key(n))} `);

  // Longest phrase first, and a matched phrase is masked, so "power bi"
  // doesn't also count as "bi" and "vector store" not as "store".
  const phrases = terms
    .flatMap((term) => term.aliases.map((a) => ({ term, phrase: key(a) })))
    .filter((p) => p.phrase)
    .sort((a, b) => b.phrase.length - a.phrase.length);
  const first = new Map<string, number>();
  const len = hay.length || 1;
  for (const { term, phrase } of phrases) {
    const needle = ` ${phrase} `;
    let i = hay.indexOf(needle);
    while (i !== -1) {
      if (!first.has(term.id) || i < first.get(term.id)!) first.set(term.id, i / len);
      hay = hay.slice(0, i + 1) + mask(phrase) + hay.slice(i + 1 + phrase.length);
      i = hay.indexOf(needle);
    }
  }
  for (const term of terms) {
    for (const pattern of term.exact ?? []) {
      const m = new RegExp(pattern).exec(raw);
      if (m && (!first.has(term.id) || m.index / raw.length < first.get(term.id)!)) first.set(term.id, m.index / (raw.length || 1));
    }
  }
  const byId = new Map(terms.map((t) => [t.id, t]));
  return [...first.entries()].sort((a, b) => a[1] - b[1]).map(([id, at]) => ({ term: byId.get(id)!, at }));
}

/** The answer for a pasted job post or a question. */
export function matchFit(text: string, terms: readonly FitTerm[], sources: readonly FitSource[]): FitResult {
  const byId = new Map(terms.map((t) => [t.id, t]));
  const needs: FitNeed[] = findTerms(text, terms).map(({ term }) => {
    const proof = proveTerm(term, sources);
    const closest = proof.length
      ? []
      : (term.closest ?? [])
          .map((id) => byId.get(id))
          .filter((t): t is FitTerm => Boolean(t))
          .map((t) => ({ id: t.id, label: t.label, proof: proveTerm(t, sources) }))
          .filter((c) => c.proof.length);
    return { id: term.id, label: term.label, kind: term.kind, status: proof.length ? "yes" : "new", proof, closest };
  });
  const raw = text.slice(0, MAX_TEXT);
  return {
    needs,
    found: needs.filter((n) => n.status === "yes").length,
    total: needs.length,
    topics: TOPICS.filter((t) => t.re.test(raw)).map((t) => t.topic),
  };
}
