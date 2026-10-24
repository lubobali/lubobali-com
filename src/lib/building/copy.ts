// /building words (Phase 7). Every number on the page comes from live.json
// (the daily job); only the sentences around them live here. Lubo's rules:
// real numbers only, results before method, no AI writes this page.

export const building = {
  title: "What I'm building now",
  description: (tests: string) =>
    `Live proof of work: what Lubo Bali shipped this year, the builds in progress, ${tests} automated tests and LuBot's uptime, refreshed every morning.`,
  nav: "Building now",
  hero: {
    headline: "What I'm building, right now.",
    sub: "Real numbers from my own servers, counted by code every morning. No screenshots, no claims.",
    active: "Active", // screen readers, next to the live dot
    quiet: "Quiet lately",
  },
  year: {
    eyebrow: "Every day since March",
    heading: (total: string) => `${total} updates shipped in 2026.`,
    stats: {
      active: "days building",
      streak: "days in a row, my longest",
      projects: "projects",
    },
    legend: ["Less", "More"],
    note: "One square per day, across all my projects. Work from my laptop counts once it is pushed.",
  },
  now: {
    eyebrow: "Building now",
    heading: (n: number) => (n === 2 ? "Two builds at once, this week." : "One build in focus, this week."),
    kinds: { public: "Public project", client: "Client project" },
    week: "updates this week",
    bars: "Last 8 weeks",
    client: "The client stays private. Ask me on a call.",
  },
  trust: {
    eyebrow: "Built to be trusted",
    heading: "Nothing ships until the tests pass.",
    lede: "I build test-first (TDD). Here is what that adds up to across my projects.",
    tests: "automated tests",
    allGreen: "0 failing",
    runs: (since: string) => `full test runs on my own CI server since ${since}`,
    stopped: "times a red run stopped a change from shipping",
    faster: {
      value: "82% faster",
      label: "LuBot's test run, cut from 24.5 to 4.4 minutes, so I can ship more often",
    },
    counted: "Counted from each project's latest green run, every morning.",
    story: {
      label: "Real example · Oct 24",
      text: "A visitor saw “Park” where their job post said “Spark”. I wrote the test that catches it first, then the fix. Live the same day, and it can't come back.",
    },
    loop: [
      { title: "Test first", text: "Write the check for one small feature. It fails, because the feature isn't built yet." },
      { title: "Build", text: "Write just enough code to make that check pass. Nothing extra." },
      { title: "Check", text: "Every push runs all the checks on my own CI server. One red check stops the release." },
      { title: "Repeat", text: "Next small step. The checks keep adding up, so old features stay protected." },
    ],
    why: { lead: "Why it matters to you:", text: "I can move fast without breaking what already works. Bugs get caught by a test, not by your customers." },
    checks: {
      title: "Automated checks, last 30 days",
      unit: (runs: string) => `of ${runs} passed`,
      note: "My last 60 test runs. Each red one stopped a change before it shipped.",
    },
    uptime: {
      title: "LuBot.ai in production",
      chip: "Live",
      unit: (days: number) => `up, last ${days} days`,
      note: (seconds: number) => `Checked every ${seconds} seconds from the server. A missed check counts as down.`,
    },
  },
  shipped: {
    eyebrow: "Shipped lately",
    heading: "The milestones, not the noise.",
    note: "Written by code from real events. No AI writes this page.",
  },
  tools: {
    eyebrow: "In my hands this quarter",
    heading: "What I actually build with.",
    lede: "Counted from the code I changed in the last 90 days, not a list of logos.",
    isNew: "new",
  },
  footer:
    "Every number here is read each morning from git, my CI server and LuBot's monitor. Client work counts in the totals and stays private.",
  sample: "Sample data: this build has no real numbers yet.",
} as const;
