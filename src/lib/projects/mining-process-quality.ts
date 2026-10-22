import type { Project } from "./model";

// Framer page "Mining process" (archived 2026-10-22); both videos are Lubo's.
// The pH scale (9 to 11) is the drawing's frame; the band is the finding.
// Facts: plans docs/phase-5-facts.md.
export const mining: Project = {
  slug: "mining-process-quality",
  name: "Mining process quality",
  chapter: "analytics",
  industries: ["Industry"],
  oneLine: "Which plant settings give the purest iron, from sensor data taken every 20 seconds",
  description:
    "Python analysis of a real mining plant's sensor data: iron yield peaks when pulp pH stays between 9.8 and 10.2, and no single setting decides it.",
  number: { value: "9.8–10.2", label: "pulp pH where the best iron yield happens" },
  problem:
    "A flotation plant has dozens of dials (pH, chemicals, air, foam). Operators need to know which ones really move iron purity, and where to set them.",
  built:
    "A Python analysis of the plant's sensor data, sampled every 20 seconds and hourly: correlations, the best and worst 20% of runs compared, and a close look at a single day.",
  why: "Python (Pandas, plots) in a notebook, so every step is visible and the plant team can rerun it on new data.",
  result:
    "For process optimization: the best 20% of runs clustered at pulp pH 9.8–10.2; poor runs used more starch and amina and ran higher foam early. No single dial controls yield, so it has to be managed as a system.",
  tech: ["Python", "Pandas", "Deepnote"],
  // Brand card (P5.6): the pH scale with the sweet spot.
  picture: {
    kind: "range",
    title: "Iron yield peaks in one narrow pH band",
    unit: "pH",
    min: 9,
    max: 11,
    low: 9.8,
    high: 10.2,
    label: "where the best 20% of runs happened",
    caption: "Sensor data from a real flotation plant",
  },
  links: [
    { kind: "video", url: "https://www.youtube.com/watch?v=B_q_y2QJFIk", label: "Watch part 1" },
    { kind: "video", url: "https://www.youtube.com/watch?v=lD6cSXZJ8bM", label: "Watch part 2" },
  ],
  source: { label: "Quality Prediction in a Mining Process (Kaggle)", url: "https://www.kaggle.com/datasets/edumagalhaes/quality-prediction-in-a-mining-process" },
  searches: ["process optimization", "manufacturing quality", "sensor data analysis"],
};
