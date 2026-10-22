import type { Project } from "./model";

// Public repo lubobali/Lubo_AI_Publisher (README read 2026-10-22). Live
// since June 2026. Facts: plans docs/phase-5-facts.md.
export const publisher: Project = {
  slug: "lubo-ai-publisher",
  name: "Lubo AI Publisher",
  chapter: "ai",
  industries: ["Marketing"],
  oneLine: "An AI content pipeline that writes in my voice from real sources, and waits for my one tap",
  description:
    "Lubo AI Publisher: an AI pipeline that writes 9 posts a week from real sources in my voice, designs the image, and publishes after one tap.",
  number: { value: "9", label: "posts a week, live since June 2026" },
  problem:
    "Posting every week takes hours, and AI-written posts sound like everyone else's and sometimes invent numbers.",
  built:
    "Every week it reads podcasts, blogs, market data and my own work logs, writes 9 posts in my voice, checks them, designs the image, and waits on my phone. One tap publishes to LinkedIn and X.",
  why: "Real material first, so the AI writes from sources instead of inventing. My own posts and style rules set the voice, and a truth check rejects made-up numbers.",
  result:
    "Live since June 2026: 9 posts a week across 7 topics, grounded in 11 books and real data, fully automated except one thing: nothing goes out without a person's approval.",
  tech: ["Python", "FastAPI", "PostgreSQL", "NVIDIA Nemotron", "Playwright"],
  // Brand card (P5.6): the week of posts, waiting for one tap.
  picture: {
    kind: "week",
    title: "9 posts a week, each waiting for one tap",
    days: [
      { day: "Sun", posts: ["Biohacker", "Rotating topic"] },
      { day: "Mon", posts: ["Rotating topic"] },
      { day: "Tue", posts: ["Rotating topic"] },
      { day: "Wed", posts: ["Biohacker", "Rotating topic"] },
      { day: "Thu", posts: ["Rotating topic"] },
      { day: "Fri", posts: ["Biohacker"] },
      { day: "Sat", posts: ["Rotating topic"] },
    ],
    note: "Real sources → my voice → truth check → image → I approve → LinkedIn and X",
    caption: "Live since June 2026",
  },
  links: [{ kind: "github", url: "https://github.com/lubobali/Lubo_AI_Publisher" }],
  searches: ["ai content pipeline", "linkedin posts automation", "write posts in my voice"],
  anatomy: {
    model: "NVIDIA Nemotron 3 Ultra 550B writes; OpenRouter is the fallback.",
    harness: "A weekly planner: pick the topic, gather material, ground it, write, clean, design the image, wait for approval, publish.",
    guardrails: "Truth rules (no invented numbers, tools or experiences), style rules, and a person approves every post.",
    knowledge: "11 books and 4 blogs (about 4,600 passages), podcast transcripts, and my own work data.",
    tools: "RSS, podcast transcription, market data, my git log, image cards, LinkedIn and X.",
  },
  safe: "Nothing is published without a person's tap, and posts with made-up numbers are rejected before they reach the approval screen.",
};
