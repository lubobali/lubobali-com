import { countIndustries, roundedDown } from "@/lib/about-counts";
import { publishedCaseStudies } from "@/lib/case-studies";
import { projects } from "@/lib/projects";
import type { Industry } from "@/lib/projects/model";

// /about (Phase 6), one source for the page, llms.txt, search and the SEO
// check. Copy approved by Lubo 2026-10-22 (plans repo
// docs/phase-6-about-copy.md v5); every fact has its source in
// docs/phase-6-facts.md. Lubo's voice: short, talking to a CEO.

// Not industries: labels for "works anywhere" or a kind of problem.
const NOT_AN_INDUSTRY: readonly Industry[] = ["Any business", "Data quality", "Productivity", "Web"];

/** Every system on /projects: the stories + the projects (37 on 2026-10-22). */
export const systemCount = publishedCaseStudies().length + projects.length;

/** Real industries Lubo has built for (17 on 2026-10-22). */
export const industryCount = countIndustries(
  [...projects.map((p) => p.industries), ...publishedCaseStudies().map((c) => c.shelf.industries)],
  NOT_AN_INDUSTRY,
);

/** "15+": rounded down to 5, so it stays true as projects are added. */
export const industriesLabel = roundedDown(industryCount, 5);

export const about = {
  title: "About Lubo Bali",
  description:
    "Senior Data & AI Engineer. I build AI agents that understand your business first: encrypted, in your own cloud, never used to train AI.",
  headline: "Hi, I'm Lubo. I build AI agents that understand your business.",
  // Lubo's own words from the intro video, so the site says one message.
  sub: `Most AI projects don't fail because of the AI. They fail because nobody understood the data and the business behind it. That's why I start with questions, not code. ${systemCount} systems so far, in ${industriesLabel} industries.`,
  portraitAlt: "Lubo Bali in a gray suit, arms crossed, smiling",

  think: {
    eyebrow: "How I think",
    heading: ["Anyone can write code now.", "Understanding your business is the hard part."],
    lines: [
      "Before I write a line, I ask where the money goes and what slows your team down. I ran the finances of a 50-unit building for 12 years, so I read a P&L before I read a database.",
      "Then we start with one win you can measure, like the report someone builds by hand every Monday. Gone. Agents come next.",
    ],
    stats: [
      // Lubo 2026-10-22: "12 years" alone read as all his experience, and
      // "80%" meant nothing to people. Intro video: "over 15 years".
      { value: "15+ years", label: "working with data: 12 in finance, then 3+ building AI" },
      { value: "3 h → 15 min", label: "a day of manual work, automated (RE/MAX)" },
    ],
  },

  security: {
    eyebrow: "Security",
    heading: "Your data never leaves your hands.",
    intro: "I know this is the first thing you worry about. It's the first thing I design.",
    items: [
      { icon: "lock", title: "Encrypted", text: "At rest and on the way, with keys you own." },
      { icon: "cloud", title: "In your cloud", text: "Your accounts, your database. Nothing sits on mine." },
      { icon: "brain", title: "Never trains AI", text: "Business AI plans only, where your data isn't used for training." },
      { icon: "eye", title: "Read-only by default", text: "The AI looks, it doesn't touch. Payments, deletes, emails out: you approve them first." },
      { icon: "shield", title: "Built against AI attacks", text: "Hidden commands in emails, PDFs or web pages don't work on my agents." },
      { icon: "equal", title: "Same answer every time", text: "Your numbers are calculated from your real data with real code. The AI only explains them, so it can't make up a number." },
      { icon: "log", title: "Everything logged", text: "Who asked, what the AI did, what it cost." },
      { icon: "badge", title: "Real standards", text: "I design to NIST CSF 2.0 and the OWASP Top 10 for AI. When a production server was hacked, I cleaned it alone and locked it down. If it's urgent, I don't sleep until it's fixed." },
    ],
  },

  proofHeading: "Don't take my word for it.",

  person: {
    eyebrow: "Off the clock",
    heading: "From pro basketball to AI.",
    lines: [
      "I came to America 14 years ago, and today I'm a US citizen. I speak English and Bulgarian.",
      "Before data I played basketball for 15 years: professionally in Europe, then as a coach. The game taught me to read what's happening, adjust fast, and win as a team. Same with your project.",
      "I'm also a biohacker. I run my own health on data too.",
    ],
    photoAlt: "Lubo Bali in a white shirt and tie, a basketball under his arm, smiling and pointing at the camera",
  },

  quote: "The goal isn't to lead with AI. It's to think more clearly because of it.",
} as const;

export type SecurityIcon = (typeof about.security.items)[number]["icon"];
