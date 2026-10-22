import { projectsIn } from "@/lib/projects";
import { CHAPTERS, type Chapter } from "@/lib/projects/model";
import { topOptions } from "@/lib/projects/shelf";

// The stack (GTC Berlin idea 1, "the five-layer cake"): the 3 chapters are
// layers of ONE system, data at the bottom, agents on top. A soft light
// rises through the layers (shelf.css; still with reduced motion). Each
// layer jumps to its chapter. Counts and tools come from the data.
const LAYERS: readonly { chapter: Chapter; says: string }[] = [
  { chapter: "ai", says: "Agents that act on your data" },
  { chapter: "pipelines", says: "Data that arrives clean and on time" },
  { chapter: "analytics", says: "Numbers a CEO can trust" },
];

export function Stack() {
  return (
    <figure className="shelf-stack flex flex-col gap-4">
      <ol className="flex flex-col items-center gap-2.5">
        {LAYERS.map(({ chapter, says }, i) => {
          const list = projectsIn(chapter);
          const tools = topOptions(list.map((p) => ({ id: p.slug, industries: p.industries, tech: p.tech })), "tech", 3);
          return (
            <li key={chapter} data-chapter={chapter} className="shelf-layer w-full" style={{ "--i": i } as React.CSSProperties}>
              <a href={`#chapter-${chapter}`} className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold">{CHAPTERS[chapter]}</span>
                  <span className="text-sm text-muted-foreground">{says}</span>
                  {tools.length > 0 && <span className="shelf-tools pt-1 text-xs tracking-wide">{tools.join(" · ")}</span>}
                </span>
                <span className="flex shrink-0 flex-col items-center">
                  <span className="shelf-layer-count text-3xl leading-none font-semibold tabular-nums">{list.length}</span>
                  <span className="pt-1 text-xs text-muted-foreground">{list.length === 1 ? "project" : "projects"}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <figcaption className="text-center text-sm text-balance text-muted-foreground">
        Agents are only as good as the data under them. I build all three layers.
      </figcaption>
    </figure>
  );
}
