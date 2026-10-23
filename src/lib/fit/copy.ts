// The fit box's words (Phase 6, P6.7). Lubo 2026-10-24: a need that isn't
// proven yet is said positively: a new tool for the same work, the closest
// real work, and "ask me how". A ✓ still needs proof (match.ts).
// scripts/tests/fit.test.mjs fails on negative words ("can't", "not
// qualified", ...). No imports: counts come in as arguments.

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const listed = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export const fitCopy = {
  title: "Does Lubo fit your project?",
  placeholder: "Paste a project or job post, or ask: “AI agents for retail?”",
  button: "Check my fit",
  privacy: "Runs in your browser. Nothing you paste is sent or saved.",
  limits: "It reads skills, tools and industries. Years and degrees are for our call.",

  // Names the new tools (Lubo: "the other 2" was vague): "Kubernetes and
  // Azure: different tools for work I already deliver."
  summary(found: number, total: number, newTools: readonly string[] = []): string {
    if (total === 0) return "No skills found yet. Try words like Python, AI agents, AWS or healthcare.";
    if (found === total) return total === 1 ? "Already proven in real projects." : total === 2 ? "Both needs are already proven in real projects." : `All ${total} needs are already proven in real projects.`;
    const names = newTools.length > 3 ? `${newTools.slice(0, 2).join(", ")} and ${newTools.length - 2} more` : listed(newTools);
    const tools = `${names}: ${plural(newTools.length, "a different tool", "different tools")} for work I already deliver.`;
    return found === 0 ? tools : `${found} of ${total} needs already proven in real projects. ${tools}`;
  },
  breadth: (systems: number, industries: string) => `${systems} systems across ${industries} industries, on AWS, Databricks, Snowflake and more.`,

  proven: "Proven in",
  newTool: "Different tool, same work I already deliver.",
  closest: "I build the same things with",
  askHow: (label: string) => `Ask me how I'd do it with ${label}`,

  topics: {
    rate: "Price: a fixed price per project, agreed after a free 30-min call.",
    availability: (availability: string) => availability,
    location: "Remote, based in Venice, Florida.",
  },
};
