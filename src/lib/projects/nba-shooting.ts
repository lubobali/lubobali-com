import type { Project } from "./model";

// Framer page "NBA" (archived 2026-10-22). Lubo played and coached
// professionally for 15+ years. Live Tableau view checked (200); video is
// Lubo's. Facts: plans docs/phase-5-facts.md.
export const nba: Project = {
  slug: "nba-shooting-analysis",
  name: "NBA shooting, read by a former pro",
  chapter: "analytics",
  industries: ["Sports"],
  oneLine: "A full NBA season in one Tableau dashboard, built by someone who played and coached the game",
  description:
    "A Tableau dashboard of a full NBA season: 3-point efficiency by team, position and minutes, built by a former pro player and coach.",
  number: { value: "15+", label: "years as a pro player and coach, now reading the game in data" },
  problem:
    "Teams look at volume, but efficiency hides in the details: which positions hit from three, and which low-minute players shoot better than their playing time says.",
  built:
    "A Tableau dashboard of 8 charts over the season stats of every player in a full NBA season: 3-point percentage against minutes played, a team-by-position heatmap of 3-point efficiency, and scoring trends.",
  why: "Tableau with calculated fields (3P% = made ÷ attempted, empty rows filtered), so coaches can click a team or position and read it at a glance.",
  result:
    "Some low-minute players shot better from three than high-minute ones, possible underused shooters, and some teams get their best 3-point shooting from centers.",
  tech: ["Tableau"],
  // Brand card (P5.6): the headline facts.
  picture: {
    kind: "kpis",
    title: "Hidden shooters the minutes don't show",
    tiles: [
      { value: "15+", label: "years pro, player and coach" },
      { value: "8", label: "charts in one dashboard" },
      { value: "5", label: "positions, every team" },
    ],
    caption: "Basketball-Reference season totals",
  },
  links: [
    { kind: "dashboard", url: "https://public.tableau.com/views/BaasketballProject/NBA_Teams" },
    { kind: "video", url: "https://www.youtube.com/watch?v=cHPbJ8UofHc", label: "Watch the walkthrough" },
  ],
  source: { label: "Basketball-Reference season totals", url: "https://www.basketball-reference.com/leagues/NBA_2022_totals.html" },
  searches: ["sports analytics", "basketball stats", "nba three point"],
};
