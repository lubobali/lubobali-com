// What people say (Phase 3 H10). Rule (plans repo D5): a quote goes here
// ONLY after the person's written yes, word for word, never paid. The proof
// (screenshot) lives in the private plans repo, docs/permissions/; `permission`
// says where and when. Empty list = the section is not rendered at all.

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  // Person's own profile (LinkedIn) and their organisation's site; no
  // link when we don't have the exact URL (never guessed).
  url?: string;
  org: { name: string; url?: string };
  // Image slug from scripts/build-images.mjs; only with a yes for the photo.
  photo?: string;
  permission: string;
};

export const testimonials: readonly Testimonial[] = [
  {
    quote: "LuBot is one of the best projects in the bootcamp, ready to make money.",
    name: "Zach Wilson",
    role: "Founder",
    url: "https://www.linkedin.com/in/eczachly/",
    org: { name: "DataExpert.io", url: "https://www.dataexpert.io/" },
    photo: "zach-wilson",
    // Photo = his public LinkedIn picture; Zach was sent the staging link
    // with it on 2026-10-19, Lubo decided 2026-10-20 to keep it.
    permission:
      "Discord DM 2026-10-18: Lubo asked to quote these exact words with name + DataExpert.io; Zach: \"Sure please quote me\" (docs/permissions/2026-10-18-zach-wilson-quote-yes.png).",
  },
  {
    // Draft shown to Matt on staging 2026-10-19; Lubo decided 2026-10-20 to
    // use it. Matt's written yes is a hard gate before the production
    // launch (plans: Phase 8). If he edits the words, his version replaces these.
    quote:
      "Lubo is a very knowledgeable engineer. He took the time to understand our business first, then built our entire Python back end and automated most of our manual work with residual files.",
    name: "Matthew Hamann",
    role: "CEO",
    url: "https://www.linkedin.com/in/matthewhamann/",
    org: { name: "HelloPayments" },
    photo: "matthew-hamann",
    permission: "Draft sent to Matt with the staging link 2026-10-19; written yes needed before prod launch (Phase 8 gate).",
  },
];
