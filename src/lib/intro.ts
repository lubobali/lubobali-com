// Lubo's intro video (Phase 3 H9b, recorded 2026-10-19). One source for
// the page (player + transcript) and the VideoObject in the JSON-LD.
// The transcript is what Lubo says, word for word (same as the captions
// file assets/videos/lubo-intro.en.vtt).
export const intro = {
  name: "Lubo Bali: why most AI projects fail, and how I fix it",
  description:
    "A 2-minute intro: why AI agents fail because of the data behind them, and how Lubo builds AI on real business data that you can trust.",
  uploadDate: "2026-10-19",
  duration: "PT2M20S",
  durationLabel: "2:20",
  transcript: [
    "AI agents are everywhere right now. But most AI projects don't fail because of the AI. They fail because of the data behind it. An agent is only as good as the data you give it. And that's exactly what I fix.",
    "I'm Lubo, and I've been in this field for over 15 years. For 12 years I worked with data, financial data with SQL first, then data engineering. For the last 3+ years, I've been building AI agents and MCP servers that connect AI to real business data. Those years taught me how to take care of people's data, and how to ask the right questions.",
    "That's why I start with questions, not code. First, I understand your business and what you really want to get. Then I pick the technology, not the other way around.",
    "So why me? First, I build everything myself, from start to finish. The data, the AI, and the app your team uses. I built my own AI platform, LuBot.ai, completely on my own, and Neon, part of Databricks, wrote an article about it.",
    "Second, I build AI you can trust. In my systems, the numbers are calculated from your real data with real code, and the AI only explains them. So it can't make up a number, and the same question always gives you the same answer.",
    "And third, I keep your AI bills low. In one project, 80% of the questions cost zero in AI fees.",
    "You hire me per project. A free call, a simple contract with a written scope, an update every two weeks, and everything I build is 100% yours.",
    "So tell me your problem, and I'll find a way to build a solution. Book a free call. Talk soon!",
  ],
} as const;
