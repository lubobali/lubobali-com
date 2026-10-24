import { lubotNumbers, resumeShare } from "@/lib/resume";

// /resume page words (Phase 6, P6.7). Plan v2 (Lubo 2026-10-24): the top of
// the page is the fit box ("check my resume against your job post"), then
// the PDF, then the career story. Resume facts live in resume.ts; the fit
// box's own words in fit/copy.ts. No phone number on the web (PDF only).

export const resumePage = {
  title: "Resume",
  description:
    "Lubo Bali's resume: paste your project or job post and see which needs are already proven in real projects. PDF download, experience, skills.",
  eyebrow: "Resume",
  heading: resumeShare.hook, // the share card says the same
  sub: "Paste your project or job post. In a second you see which needs I've already proven in real projects, with links to the work.",
  tryLabel: "Try:",
  tries: ["AI agents for retail?", "Healthcare dashboards?", "Snowflake and dbt?"],
  sampleLabel: "A sample job post",
  // Mixes proven needs and new tools on purpose, so a visitor sees both.
  sample:
    "Senior AI Engineer. Build AI agents and RAG over company documents in Python on AWS, with Snowflake and dbt for the data. Kubernetes and Azure are a plus. Fintech experience preferred.",
  pdfLabel: "Download PDF resume",
  journeyHeading: "From finance to AI, one step at a time",
  // Oldest first, one proof number per step (Lubo 2026-10-24: "looks like a
  // copy of my PDF" -> a journey). Every number is on resume.ts / the facts
  // log (plans docs/phase-6-facts.md). story = case study slug.
  journey: [
    { years: "2013 – 2024", company: "Finance ops", role: "Financial Data Manager", value: "$500K+", label: "a year for a 50-unit building, managed for 12 years with SQL and Excel" },
    // Not "3 h → 15 min": Lubo 2026-10-23 found it unattractive on /about.
    { years: "2024 – 2025", company: "RE/MAX", role: "Data Engineer", value: "10K+", label: "property listings in one daily pipeline, used by 15+ agents" },
    { years: "2025 – now", company: "LuBot.ai", role: "Founder & Lead Engineer", value: lubotNumbers.lines, label: "lines of code, built solo, featured by Neon", story: "lubot" },
    { years: "2026", company: "HelloPayments", role: "Lead engineer", value: "80%", label: "of questions answered with no AI cost", story: "hellopayments" },
  ],
  skillsMapHeading: "Skills, counted from real projects",
  skillsMapHint: "Each bar is the work that proves it. Tap one to see it.",
  fullResume: "Full resume (text)",
  experienceHeading: "Experience",
  storyLink: "Read the story",
  educationHeading: "Education",
  skillsHeading: "Skills",
  skillsHint: "Tap a skill to see the projects behind it.",
  projectsLink: "See all projects",
} as const;
