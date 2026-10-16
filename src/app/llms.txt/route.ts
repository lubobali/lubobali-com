import { site } from "@/lib/site";

// /llms.txt (llmstxt.org): a short plain-text summary for AI assistants.
// Same facts as the JSON-LD and page metadata (src/lib/site.ts).
export const dynamic = "force-static";

const body = `# ${site.name}

> ${site.description}

${site.name} is a ${site.jobTitle}. Solo founder and builder of
${site.product.name} (${site.product.url}), ${site.product.description}.

## Featured

- [${site.featuredIn.title}](${site.featuredIn.url}) (${site.featuredIn.publisher})

## Focus

${site.knowsAbout.map((k) => `- ${k}`).join("\n")}

## Links

- [Website](${site.url}/)
${site.sameAs.map((u) => `- [${new URL(u).hostname.replace(/^www\./, "")}](${u})`).join("\n")}
`;

export function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
