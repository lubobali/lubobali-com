// "Questions CEOs ask me" (Phase 6, P6.8): Lubo's own answers, approved
// 2026-10-24 (all 11; plans repo docs/phase-6-about-resume.md "CEO
// questions v2"). Shown as a chat with Lubo on home and /about: a question
// tapped, his written answer, the proof. No AI: these exact words. Every
// fact is already on the site (the proof link goes there).
// `book: true` = the proof is the booking link (site.bookCall).

export type CeoQuestion = {
  id: string;
  q: string;
  a: string;
  proof?: { label: string; href: string };
  book?: true;
};

export const ceoQuestions: readonly CeoQuestion[] = [
  {
    id: "business",
    q: "Do you understand my business, or only code?",
    a: "Data first, then AI. I ran the finances of a 50-unit building for 12 years, so I start with how you make and lose money. Then I build.",
    proof: { label: "How I think", href: "/about" },
  },
  {
    id: "save-money",
    q: "Will it really save money? How will we know?",
    a: "We measure today first: hours, errors, time per task. Then we measure again after. One of my agents went from $12 and 8 minutes per question to $0.001 and 15 seconds.",
    proof: { label: "LangChain agents, 12,000× cheaper", href: "/projects/langchain-ai-agents" },
  },
  {
    id: "people",
    q: "Will AI replace my people?",
    a: "No. I automate the copy-paste and the waiting. Your people keep the work where the human touch matters, and my agents ask a person before anything important.",
    proof: { label: "Sentinel-AI: it can never send or delete", href: "/projects/sentinel-ai" },
  },
  {
    id: "numbers",
    q: "Can the AI make up numbers?",
    a: "Not in my systems. Real code calculates every number from your data. The AI only explains it, and every answer shows where it came from.",
    proof: { label: "How LuBot.ai does it", href: "/work/lubot" },
  },
  {
    id: "data-safe",
    q: "Is my data safe?",
    a: "Encrypted, in your own cloud, never used to train AI. I design for it from day one. When a production server was hacked, I cleaned it up and locked it down myself.",
    proof: { label: "How I keep your data safe", href: "/about#security" },
  },
  {
    id: "ai-bills",
    q: "Will the AI bills get out of hand?",
    a: "No. Each question goes to the cheapest model that can answer it well. In one live project, 80% of questions cost nothing in AI fees.",
    proof: { label: "HelloPayments", href: "/work/hellopayments" },
  },
  {
    id: "truth",
    q: "Will you tell me the truth, even when I don't like it?",
    a: "Yes. HelloPayments wanted one shared database for all their customers. I pushed for a separate database per customer, plus encryption. They listened. And if AI isn't the right fit for your problem, I'll tell you on the first call.",
    proof: { label: "HelloPayments", href: "/work/hellopayments" },
  },
  {
    id: "tools",
    q: "What if you haven't used our exact tools?",
    a: "I'll tell you on the first call, then I learn them fast. AI tools change every month, and keeping up is part of my job. The patterns stay the same: clean data, tested code, secure by design.",
    proof: { label: "Check my fit for your stack", href: "/resume#fit" },
  },
  {
    id: "ownership",
    q: "Who owns what you build?",
    a: "You do, 100%. When the project is done, I hand over all the code and documents.",
  },
  {
    id: "speed",
    q: "How fast will I see results?",
    a: "It depends on the project, but I build fast. You get a first small win early, and you see progress every week.",
  },
  {
    id: "cost",
    q: "How much does it cost?",
    a: "A fixed price per project, agreed after a free 30-minute call. We start small, with one win you can measure.",
    book: true,
  },
];
