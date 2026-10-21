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
  art?: "payouts"; // a drawn picture for the first screen (no screens to show)
  // No product screen yet: draw one real example from the data instead
  // (GraphGuard: a laundering ring, each hop = from -> to + amount).
  ring?: { caption: string; hops: readonly { from: string; amount: string }[] };
  numbers?: readonly { value: string; label: string }[]; // 3 for the first screen
  stats?: readonly { value: string; label: string }[]; // the full build, by the numbers
  flow?: { app: string; before: FlowSide; after: FlowSide };
  useCases?: readonly { title: string; text: string; learns?: string }[];
  // "A day with ..." (Lubo: numbers mean nothing alone, tell stories): one
  // example person, each moment = a real feature + the build behind it.
  // fix = how the pain is solved, shown as a card where a screen would go
  // (mystery pages: the idea of the fix, never the build).
  day?: {
    person: string;
    title?: string; // default "A day with <name>"
    intro: string;
    moments: readonly {
      when: string;
      title: string;
      text: string;
      behind?: string;
      fix?: string;
      shot?: Shot;
      chips?: readonly string[];
    }[];
  };
  challenges?: readonly { title: string; text: string }[]; // "Why this is hard"
  // The queue story (GraphGuard, Lubo 2026-10-21): one person, a day's
  // alert capacity, and how many of those alerts are real, random order
  // vs the model's order, drawn as two grids of dots.
  queue?: {
    person: string;
    title: string;
    intro: string;
    capacity: number;
    random: number;
    model: number;
    moments: readonly { when: string; title: string; text: string }[];
  };
  // Small drawings of the patterns the model learns to see.
  shapes?: {
    intro: string;
    items: readonly { kind: "cycle" | "fan-out" | "scatter-gather"; name: string; text: string; count: string }[];
  };
  // A fair contest, drawn as bars (value out of total, same test for all).
  contest?: {
    title: string;
    intro: string;
    total: number;
    unit: string; // e.g. "rings caught"
    rows: readonly { name: string; value: number; winner?: boolean }[];
    note: string;
  };
  // Where the project is going: done / now / later, honest about each.
  roadmap?: readonly { name: string; text: string; status: "done" | "now" | "later" }[];
  problems?: readonly { problem: string; decision: string; result: string }[];
  ideas?: readonly { title: string; text: string }[]; // mystery pages only
  quote?: string; // a testimonial, by name (src/lib/testimonials.ts, one source)
  role: string;
  when: string;
  next?: string; // what is being built now, shown with the facts
  stack: readonly string[];
  links?: readonly { label: string; url: string }[];
  // layers = the architecture drawn top (the user) to bottom (the data).
  engineers?: { intro: string; layers?: readonly { name: string; parts: readonly string[] }[]; decisions: readonly string[] };
};
