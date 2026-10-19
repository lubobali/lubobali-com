import { site } from "@/lib/site";

// What Lubo offers (Phase 3 H6, rewritten in H12). One list for the home
// page cards AND the JSON-LD (schema.ts) and llms.txt, so Google, AI
// assistants and visitors read the same thing.
// H12 (Lubo, 2026-10-19): 4 cards = what companies ask for most in 2026
// (agents that act, data readiness = the #1 blocker, trust, AI cost
// control), in the same words as the intro video: the problem a buyer
// fears, then the fix, then a proof they can check today.
// `award` = the glowing emblem on the card (Lubo: cards feel like awards).
export const services = [
  {
    name: "AI agents that do the work",
    award: "crystal",
    description:
      "Not another chatbot. Agents that read your data, use your tools and finish the job, connected to Claude, ChatGPT or your own apps.",
    proof: "LuBot runs inside Claude with 9 MCP tools.",
    proofUrl: "https://smithery.ai/servers/lubobali/lubot",
  },
  {
    name: "Data that's ready for AI",
    award: "medal",
    description:
      "Most AI projects fail on messy data. I clean it, connect it and keep it organized, so your AI has something solid to stand on.",
    proof: "12 years in data. Neon (Databricks) featured my design.",
    proofUrl: site.featuredIn.url,
  },
  {
    name: "Answers you can trust",
    award: "trophy",
    description:
      "Numbers come from your real data, calculated by code. The AI only explains them, so it can't make up a figure.",
    proof: "Same question, same answer. 12,000+ automated tests.",
    proofUrl: site.product.url,
  },
  {
    name: "AI bills that stay small",
    award: "laurel",
    description:
      "Simple questions don't need an expensive model. Each question goes the cheapest way that works, with limits so costs never surprise you.",
    proof: "80% of questions at $0 AI cost in a live project.",
    // The HelloPayments card in Selected work (same page) shows it.
    proofUrl: "/#hellopayments",
  },
] as const;
