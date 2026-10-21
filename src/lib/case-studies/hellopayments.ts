import type { CaseStudy } from "./types";

// HelloPayments (Phase 4 C5): a MYSTERY page, client work. Ideas only, never
// the build (Lubo 2026-10-20). Says no more than the home card already does
// (src/lib/work.ts); no internal numbers (the pilot $ stays off), no
// customers, no screens. Lubo 2026-10-21: "show more about automation,
// that was the big goal": the before/after is the general month-end job,
// not the client's internals.
export const hellopayments: CaseStudy = {
  slug: "hellopayments",
  kind: "mystery",
  published: false,
  name: "HelloPayments",
  eyebrow: "Client work · the details stay private",
  title: "Paying a sales team without the spreadsheet",
  problem: "Payment sales teams are paid from monthly processor reports, and someone has to split them by hand in Excel.",
  promise:
    "The big goal was automation: take the manual work out of every month-end. I was the lead engineer. Here is the idea of what I built, not the build itself.",
  description:
    "Client work by Lubo Bali for HelloPayments: an automated residual and commission engine that replaces manual Excel. The ideas, not the private details.",
  art: "payouts",
  // Both already public: Lubo's LinkedIn ("approved as the base for 6
  // future products") and the home card ("80% of queries at $0 LLM cost").
  // Lubo OK'd them here 2026-10-21.
  numbers: [
    { value: "6", label: "future products approved to build on my architecture" },
    { value: "80%", label: "of AI questions answered at $0 AI cost" },
  ],
  flow: {
    app: "DataSwim",
    before: {
      title: "By hand",
      label: "Month-end by hand",
      badge: "Every month",
      steps: [
        { label: "Download each processor's report", meta: "A different format for each", pain: true },
        { label: "Clean and match it in Excel", meta: "Row by row", pain: true },
        { label: "Work out every split", meta: "Formulas that break", pain: true },
        { label: "Check it all again", meta: "Before anyone gets paid", pain: true },
      ],
    },
    after: {
      title: "Automatic",
      label: "Month-end, automated",
      steps: [
        { label: "Reports come in" },
        { label: "AI reads any format" },
        { label: "Every split worked out, with a trail" },
        { label: "A clear report to check" },
      ],
    },
  },
  // Mike is an example person (Lubo's pick). The diagram above shows the
  // month-end steps, so the story shows what it can't: the surprises and
  // the people (Lubo 2026-10-21: keep the diagram, change the story). Each
  // fix maps to a real idea above or Matt's quote, never the build.
  day: {
    person: "Mike",
    title: "Month-end with Mike",
    intro:
      "Mike runs a payment sales office: a team of agents who sign up merchants and are paid a share of what those merchants process. The steps above are every month. These are the moments that used to hurt. (An example person; the job is real.)",
    moments: [
      {
        when: "A new deal",
        title: "A new processor signs on",
        text: "Good news for the business, bad news for Mike: a new file format, a new spreadsheet to build, and weeks of fixing it before the numbers can be trusted.",
        fix: "An AI reads the new format from the first report. No new code, no new spreadsheet.",
      },
      {
        when: "Payday",
        title: "\u201cMy check is wrong\u201d",
        text: "An agent calls, upset. By hand, Mike digs through a month of spreadsheets to find where one number came from, while the agent waits.",
        fix: "Every split has a trail back to the report it came from. Mike can show where the number came from, and fix it if it is really wrong.",
      },
      {
        when: "Any day",
        title: "Mike has a question",
        text: "Which merchants are growing? Why was this month lower? Every answer used to mean another evening in Excel.",
        fix: "Mike asks in plain English and gets the answer from the data. Most questions never touch a paid AI model, so they cost nothing.",
      },
      {
        when: "The next month-end",
        title: "A check, not a job",
        text: "The reports come in, the splits come out, and Mike's month-end is reading one clear report instead of rebuilding a spreadsheet.",
        // Points at Matt's quote: if his yes never comes, change this line too.
        fix: "Most of the manual work is automated, in the CEO's own words below.",
      },
    ],
  },
  challenges: [
    { title: "Every processor speaks its own language", text: "Different files, columns and dates for the same kind of money." },
    { title: "Splits go many levels deep", text: "Merchant, agent, office: each level takes its share, and the rules differ." },
    { title: "Mistakes are paychecks", text: "One wrong number means a real person is paid wrong, and trust is gone." },
  ],
  ideas: [
    {
      title: "Month-end, automated",
      text: "An engine that reads each month's reports and works out everyone's exact split, with a trail you can check.",
    },
    { title: "New processor, no new code", text: "An AI that reads any processor's report format." },
    { title: "AI that costs almost nothing", text: "A gateway that answers most questions without paying for a big model." },
  ],
  quote: "Matthew Hamann", // same gate as the home page: Matt's written yes before launch
  role: "Senior Data & AI Platform Engineer (lead engineer)",
  when: "Mar–Aug 2026",
  stack: ["Python", "FastAPI", "PostgreSQL", "Next.js"],
};
