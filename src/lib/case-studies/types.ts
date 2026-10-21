import type { FlowSide } from "@/components/blueprint/diagram";

// One case study = one data file (Phase 4 C2). The page engine
// (src/app/work/[slug]) draws every part that is filled in. Two kinds
// (Lubo 2026-10-20): "story" for own/public projects, "mystery" for client
// work (ideas only, never the full build). Every number must be traceable
// (plans repo docs/phase-4-case-studies.md, C1). Unpublished = noindex, out
// of the sitemap and never linked.
// A real screen of the product (assets/photos -> Picture), always captioned.
export type Shot = { name: string; alt: string; caption: string; narrow?: boolean }; // narrow = a tall phone-like crop

export type CaseStudy = {
  slug: string;
  kind: "story" | "mystery";
  published: boolean;
  name: string;
  eyebrow: string; // e.g. "Case study · my own product"
  title: string; // the H1, the hook in a few words
  problem: string; // one sentence, the reader's language
  promise: string; // what it does, one or two sentences
  description: string; // meta description
  badge?: { label: string; url: string }; // the strongest trust signal, top of the hook
  hero?: Shot; // the picture in the first screen
  numbers?: readonly { value: string; label: string }[]; // 3 for the first screen
  stats?: readonly { value: string; label: string }[]; // the full build, by the numbers
  flow?: { app: string; before: FlowSide; after: FlowSide };
  useCases?: readonly { title: string; text: string; learns?: string }[];
  // "A day with ..." (Lubo: numbers mean nothing alone, tell stories): one
  // example person, each moment = a real feature + the build behind it.
  day?: {
    person: string;
    intro: string;
    moments: readonly { when: string; title: string; text: string; behind: string; shot?: Shot; chips?: readonly string[] }[];
  };
  problems?: readonly { problem: string; decision: string; result: string }[];
  ideas?: readonly string[]; // mystery pages only
  role: string;
  when: string;
  stack: readonly string[];
  links?: readonly { label: string; url: string }[];
  engineers?: { intro: string; decisions: readonly string[] };
};
