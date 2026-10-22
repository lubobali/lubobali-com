import { storyPath } from "@/lib/case-studies";
import { intro } from "@/lib/intro";
import { now, steps, terms } from "@/lib/process";
import { projectsIn } from "@/lib/projects";
import { CHAPTERS } from "@/lib/projects/model";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import { work } from "@/lib/work";

// /llms.txt (llmstxt.org): a short plain-text summary for AI assistants.
// Built from the same lists as the home page and the JSON-LD (site,
// services, work, process, intro), so it never drifts from what visitors
// see (rebuilt in Phase 3 H12; it was the Phase 2 summary before).
export const dynamic = "force-static";

const list = (items: readonly string[]) => items.map((i) => `- ${i}`).join("\n");
// A project's links, its story first once published (Phase 4 C6b).
const links = (w: (typeof work)[number]) => {
  const story = storyPath(w.id);
  return [...(story ? [{ label: "Read the story", url: site.url + story }] : []), ...w.links];
};
// Plain text: drop the invisible "keep on one line" characters used on the page.
const plain = (t: string) => t.replace(/\u2060/g, "").replace(/\u00a0/g, " ");

const body = `# ${site.name}

> ${site.description}

${site.name} is a ${site.jobTitle} who works per project (no full-time
roles). Solo founder and builder of ${site.product.name} (${site.product.url}),
${site.product.description}.

${site.availability}

## Contact

- [${site.bookCall.label}](${site.bookCall.url})
- Email: ${site.email}

## What I do

${services.map((s) => `- **${s.name}**: ${s.description} Proof: ${s.proof}`).join("\n")}

## Selected work

${work.map((w) => `### ${w.name}\n\n${plain(w.role)}. ${w.summary}\n\n${list(w.highlights)}${links(w).length ? "\n\n" + links(w).map((l) => `- [${l.label}](${l.url})`).join("\n") : ""}`).join("\n\n")}

## More projects
${(Object.keys(CHAPTERS) as (keyof typeof CHAPTERS)[])
  .map((c) => {
    const inChapter = projectsIn(c);
    if (inChapter.length === 0) return "";
    const items = inChapter.map((p) => `- [${p.name}](${site.url}/projects/${p.slug}): ${p.oneLine}. ${p.number.value} ${p.number.label}.`);
    return `### ${CHAPTERS[c]}\n\n${items.join("\n")}`;
  })
  .filter(Boolean)
  .join("\n\n")}

## How it works

${steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.text}`).join("\n")}

Terms:

${list(terms)}

Now: ${now}

## Free AI blueprint

[Get your free AI blueprint](${site.url}/blueprint): describe a business problem and get a first plan in
about a minute (how it works today, with AI, who is involved, risks, timeline), plus 6 example
blueprints (trucking, payments, clinic, accounting, construction, law firm).

## Intro video

[${intro.name}](${site.url}/) (${intro.durationLabel}, transcript on the page): ${intro.description}

## Featured

- [${site.featuredIn.title}](${site.featuredIn.url}) (${site.featuredIn.publisher})

## Focus

${list(site.knowsAbout)}

## Links

- [Website](${site.url}/)
${site.sameAs.map((u) => `- [${new URL(u).hostname.replace(/^www\./, "")}](${u})`).join("\n")}
`;

export function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
