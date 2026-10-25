// The fit box's words (Phase 6, P6.7). Lubo 2026-10-24: a need that isn't
// proven yet is said positively, with the closest real work. A ✓ still
// needs proof (match.ts). How a miss is said depends on what it is (review
// 2026-10-24: "Insurance: a different tool" and "do it with a clearance"
// were wrong): a tool, an industry, work next to his, or something to talk
// about on a call. scripts/tests/fit.test.mjs fails on negative words
// ("can't", "not qualified", ...). No imports: counts come in as arguments.

export type Miss = "tool" | "industry" | "adjacent" | "talk";

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const listed = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
const short = (xs: readonly string[]) => (xs.length > 3 ? `${xs.slice(0, 2).join(", ")} and ${xs.length - 2} more` : listed(xs));

export const fitCopy = {
  title: "Does Lubo fit your project?",
  placeholder: "Paste a project or job post, or ask: “AI agents for retail?”",
  button: "Check my fit",
  privacy: "Runs in your browser. What you type is saved without your name, so I can learn what people need.",
  limits: "It reads skills, tools and industries. Years and degrees are for our call.",

  // Names what isn't proven yet (Lubo: "the other 2" was vague).
  summary(found: number, total: number, misses: readonly { name: string; miss: Miss }[] = [], topics = 0): string {
    if (total === 0)
      return topics > 0
        ? "Good questions for our call."
        : "That one's outside what this box checks. It reads skills, tools and industries. Try: Python, AI agents, AWS or healthcare.";
    if (found === total) return total === 1 ? "Already proven in real projects." : total === 2 ? "Both needs are already proven in real projects." : `All ${total} needs are already proven in real projects.`;
    const names = short(misses.map((m) => m.name));
    const rest = misses.every((m) => m.miss === "tool")
      ? `${names}: ${plural(misses.length, "a different tool", "different tools")} for work I already deliver.`
      : `For ${names}, see my closest work below.`;
    return found === 0 ? rest : `${found} of ${total} needs already proven in real projects. ${rest}`;
  },
  breadth: (systems: number, industries: string) => `${systems} systems across ${industries} industries, on AWS, Databricks, Snowflake and more.`,

  proven: "Proven in",
  miss: {
    tool: "Different tool, same work I already deliver.",
    industry: "New industry for me. The data and AI work is the same.",
    adjacent: "Next to work I've already shipped.",
    talk: "Let's talk about this on our call.",
  } satisfies Record<Miss, string>,
  closest: {
    tool: "I build the same things with",
    industry: "Closest:",
    adjacent: "Closest work I've shipped:",
    talk: "Related work:",
  } satisfies Record<Miss, string>,
  ask(miss: Miss, name: string): string {
    if (miss === "tool") return `Ask me how I'd do it with ${name}`;
    if (miss === "industry") return "Tell me about your industry";
    return `Let's talk about ${name}`;
  },

  topics: {
    rate: "Price: a fixed price per project, agreed after a free 30-min call.",
    availability: (availability: string) => availability,
    location: "Remote, based in Venice, Florida.",
  },
};
