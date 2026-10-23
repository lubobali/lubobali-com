// The fit box's words (Phase 6, P6.7). Lubo 2026-10-24: a need that isn't
// proven yet is said positively: a new tool for the same work, the closest
// real work, and "ask me how". A ✓ still needs proof (match.ts).
// scripts/tests/fit.test.mjs fails on negative words ("can't", "not
// qualified", ...). No imports: counts come in as arguments.

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const fitCopy = {
  title: "Does Lubo fit your project?",
  placeholder: "Paste a project or job post, or ask: “AI agents for retail?”",
  button: "Check my fit",
  privacy: "Runs in your browser. Nothing you paste is sent or saved.",
  limits: "It reads skills, tools and industries. Years and degrees are for our call.",

  summary(found: number, total: number): string {
    if (total === 0) return "No skills found yet. Try words like Python, AI agents, AWS or healthcare.";
    if (found === total) return `All ${total} ${plural(total, "need is", "needs are")} already proven in real projects.`;
    const other = total - found;
    const rest = `${plural(other, "is a new tool", "are new tools")} for the same work, and I learn fast.`;
    if (found === 0) return `${plural(other, "This", "These")} ${rest}`;
    return `${found} of ${total} needs already proven in real projects. The other ${plural(other, "one", String(other))} ${rest}`;
  },
  breadth: (systems: number, industries: string) => `${systems} systems across ${industries} industries, on AWS, Databricks, Snowflake and more.`,

  proven: "Proven in",
  newTool: "New tool for me, same job.",
  closest: "I build the same things with",
  askHow: (label: string) => `Ask me how I'd do it with ${label}`,

  topics: {
    rate: "Price: a fixed price per project, agreed after a free 30-min call.",
    availability: (availability: string) => availability,
    location: "Remote, based in Venice, Florida.",
  },
};
