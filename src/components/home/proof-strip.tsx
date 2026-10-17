import { site } from "@/lib/site";

// Proof strip (Phase 3 H5), below the LuBot loop: the Neon (Databricks)
// article + LuBot numbers. Copy approved by Lubo 2026-10-17 (plans repo
// docs/phase-3-copy.md §2); numbers counted on the LuBot repo that day (L4).
// Neon as text, not their logo: 0 requests, no brand-rules question.
export const PROOF = [
  { value: "260,000+", label: "lines of code, built solo" },
  { value: "12,000+", label: "automated tests" },
  { value: "1", label: "database per customer" },
  { value: "3", label: "MCP directories list LuBot" },
] as const;

export const FEATURED_LABEL = "Featured by Neon (Databricks)";

export function ProofStrip() {
  const article = site.featuredIn;
  return (
    <section aria-labelledby="proof" className="border-y border-border bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-12">
        <div className="flex flex-col gap-2">
          <h2 id="proof" className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {FEATURED_LABEL}
          </h2>
          <a
            href={article.url}
            className="text-lg font-medium text-balance text-foreground underline decoration-link/60 underline-offset-4 hover:decoration-link sm:text-xl"
          >
            {article.title}
          </a>
        </div>
        {/* A list, so it reads "260,000+ lines of code, built solo". */}
        <ul className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {PROOF.map((p) => (
            <li key={p.label} className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">{p.value}</span>{" "}
              <span className="text-sm text-muted-foreground">{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
