import type { Project } from "./model";

// Framer project (archive 2026-10-22, text/diabetes.txt + the SQL result
// screenshot). Counts re-checked: the 4 medication groups add up to
// 101,766 visits (the UCI dataset size); the old page's "107,766" was a typo.
export const diabetesReadmissions: Project = {
  slug: "diabetes-readmissions",
  name: "Diabetes readmissions",
  chapter: "analytics",
  industries: ["Health"],
  oneLine: "Which diabetic patients keep coming back to the hospital within 30 days, and why",
  description:
    "SQL analysis of 101,766 hospital visits: diabetic patients on 16+ medications came back within 30 days at 12.48%, vs 7.48% on 5 or fewer.",
  number: { value: "101,766", label: "hospital visits analyzed" },
  problem:
    "Hospitals pay for patients who come back within 30 days, and Medicare ties payment to these outcomes. Which diabetic patients keep coming back, and what could a hospital change before they go home?",
  built:
    "Six SQL questions over real, anonymized records from 130 US hospitals: how many medications, insulin vs metformin, treatment changes during the stay, the doctor's specialty, and lab tests skipped before discharge.",
  why: "Plain SQL group-by questions, so a hospital analyst can rerun the same checks on their own database every month.",
  result:
    "More medications, more returns: 12.48% came back at 16+ medications vs 7.48% at 5 or fewer. Patients sent home without an A1C or glucose test came back more often (11.42% vs as low as 8.87%).",
  tech: ["SQL", "MySQL"],
  // Brand card (P5.6, CEO hook): 12.48% / 7.48% = 1.67 → "67% more often".
  // Bars = my SQL results, back within 30 days by number of medications.
  picture: {
    kind: "chart",
    title: "Patients on 16+ medications come back 67% more often",
    unit: "%",
    bars: [
      { label: "5 or fewer", value: 7.48, note: "5,066 visits" },
      { label: "6 to 10", value: 9.45, note: "20,795 visits" },
      { label: "11 to 15", value: 10.91, note: "29,384 visits" },
      { label: "16 or more", value: 12.48, note: "46,521 visits" },
    ],
    caption: "Back within 30 days · 130 US hospitals",
  },
  links: [],
  source: {
    label: "Diabetes 130-US Hospitals, UCI Machine Learning Repository",
    url: "https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008",
  },
  searches: ["hospital readmissions", "patients coming back", "healthcare sql analysis"],
};
