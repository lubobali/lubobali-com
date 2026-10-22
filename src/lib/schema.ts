import type { Graph } from "schema-dts";
import type { CaseStudy } from "@/lib/case-studies/types";
import type { Project } from "@/lib/projects/model";
import { imageUrl } from "@/lib/images";
import { intro } from "@/lib/intro";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import { tech } from "@/lib/tech";
import { getVideo } from "@/lib/videos";

// schema.org entity graph for the home page: who Lubo is (Person), the
// site, the profile page, LuBot (founded by Lubo) and his intro video. Google and AI
// assistants use it to connect "Lubo Bali" to the right profiles.
// Checked after every build by scripts/check-seo.mjs; validate changes at
// https://validator.schema.org and Google's Rich Results Test.
const id = (name: string) => `${site.url}/#${name}`;
// LuBot's id lives on lubot.ai, so lubot.ai can reuse it in its own JSON-LD.
const LUBOT_ID = `${site.product.url}#organization`;

export function homeGraph(): Graph {
  const video = getVideo("lubo-intro");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": id("person"),
        name: site.name,
        url: `${site.url}/`,
        image: imageUrl("lubo-bali-portrait"),
        jobTitle: site.jobTitle,
        description: site.description,
        // Skills + the "Built with" wheel tools (H8), without repeats.
        knowsAbout: [...new Set([...site.knowsAbout, ...tech.map((t) => t.name)])],
        sameAs: [...site.sameAs],
        // How to reach Lubo (H12): email + the free intro call.
        email: site.email,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "AI project inquiries",
          email: site.email,
          url: site.bookCall.url,
          availableLanguage: "en",
        },
        // Same 3 services as the "What I do" cards (Phase 3 H6).
        makesOffer: services.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.description,
            provider: { "@id": id("person") },
          },
        })),
        subjectOf: {
          "@type": "Article",
          headline: site.featuredIn.title,
          url: site.featuredIn.url,
          publisher: { "@type": "Organization", name: site.featuredIn.publisher },
        },
      },
      {
        "@type": "Organization",
        "@id": LUBOT_ID,
        name: site.product.name,
        legalName: site.product.legalName,
        url: site.product.url,
        description: `LuBot is ${site.product.description}.`,
        founder: { "@id": id("person") },
      },
      {
        "@type": "WebSite",
        "@id": id("website"),
        url: `${site.url}/`,
        name: site.name,
        inLanguage: "en",
        publisher: { "@id": id("person") },
      },
      {
        "@type": "ProfilePage",
        "@id": id("profile"),
        url: `${site.url}/`,
        name: `${site.name} — ${site.jobTitle}`,
        isPartOf: { "@id": id("website") },
        mainEntity: { "@id": id("person") },
      },
      {
        // Intro video (H9b): Google can show it in video results.
        "@type": "VideoObject",
        "@id": id("intro-video"),
        name: intro.name,
        description: intro.description,
        thumbnailUrl: `${site.url}${video.poster}`,
        contentUrl: `${site.url}${video.src}`,
        uploadDate: intro.uploadDate,
        duration: intro.duration,
        inLanguage: "en",
        transcript: intro.transcript.join(" "),
        creator: { "@id": id("person") },
        isPartOf: { "@id": id("profile") },
      },
    ],
  };
}

// A case study (Phase 4 C6b): an Article by Lubo, tied to the same Person
// and WebSite ids as the home page, so search and AI assistants know who
// built it. Client work (mystery) says "about" the client only by name.
export function caseStudyGraph(cs: CaseStudy): Graph {
  const url = `${site.url}/work/${cs.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: `${cs.name}: ${cs.title}`,
        description: cs.description,
        url,
        inLanguage: "en",
        keywords: cs.tags.join(", "),
        author: { "@id": id("person") },
        publisher: { "@id": id("person") },
        isPartOf: { "@id": id("website") },
        about: { "@type": "Thing", name: cs.name },
      },
    ],
  };
}

// A project page (Phase 5 P5.3): breadcrumbs (Home › Projects › name,
// shown in Google results) + the work itself. A project with a public repo
// is SoftwareSourceCode (repo + tech), others a CreativeWork; both by the
// same Person as the rest of the site.
export function projectGraph(p: Project): Graph {
  const url = `${site.url}/projects/${p.slug}`;
  const repo = p.links.find((l) => l.kind === "github")?.url;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${site.url}/projects` },
          { "@type": "ListItem", position: 3, name: p.name, item: url },
        ],
      },
      {
        "@type": repo ? "SoftwareSourceCode" : "CreativeWork",
        "@id": `${url}#work`,
        name: p.name,
        description: p.description,
        url,
        inLanguage: "en",
        keywords: [...p.industries, ...p.tech].join(", "),
        ...(repo ? { codeRepository: repo, programmingLanguage: p.tech.join(", ") } : {}),
        author: { "@id": id("person") },
        isPartOf: { "@id": id("website") },
      },
    ],
  };
}
