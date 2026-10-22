import type { Project } from "./model";

// Public repo lubobali/LuboBali.com-Portfolio-Scope + the Framer page
// (archived 2026-10-22). No longer running (API 404 on 2026-10-22): said on
// the page (Lubo OK). Facts: plans docs/phase-5-facts.md.
export const portfolioScope: Project = {
  slug: "portfolioscope",
  name: "PortfolioScope",
  chapter: "pipelines",
  industries: ["Web", "Marketing"],
  oneLine: "My own website analytics: from one click to a daily dashboard, without Google Analytics",
  description:
    "PortfolioScope: website analytics built from scratch. A tracker, FastAPI, PostgreSQL and a daily job turned raw clicks into clean visits.",
  number: { value: "104 s", label: "average visit, measured by my own tracker" },
  problem:
    "Google Analytics showed visits, but not which projects people really read, or for how long.",
  built:
    "A small tracker on my old site sent each page view to a FastAPI service, Postgres stored it, a daily job turned raw clicks into clean visits, and a dashboard showed sources, devices and top projects.",
  why: "FastAPI and Postgres: simple, cheap and fully mine. Visitor addresses were hashed, never stored as they are.",
  result:
    "It showed real habits: visitors stayed 104 seconds on average, 34% stayed over a minute, and 76% came direct.",
  honesty: "No longer running: it tracked my old website, and LuBot's tracking has replaced it.",
  tech: ["FastAPI", "PostgreSQL", "JavaScript", "Streamlit", "Railway"],
  // Brand card (P5.6): what the tracker showed (README insights).
  picture: {
    kind: "kpis",
    title: "Know what visitors really read",
    tiles: [
      { value: "104 s", label: "average visit" },
      { value: "34%", label: "stay over a minute" },
    ],
    ring: { value: 76, label: "of visits came direct or from a bookmark" },
    caption: "Measured by my own tracker",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/LuboBali.com-Portfolio-Scope" }],
  searches: ["website analytics", "track website visitors", "google analytics"],
};
