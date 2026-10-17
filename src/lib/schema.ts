import type { Graph } from "schema-dts";
import { imageUrl } from "@/lib/images";
import { site } from "@/lib/site";

// schema.org entity graph for the home page: who Lubo is (Person), the
// site, the profile page, and LuBot (founded by Lubo). Google and AI
// assistants use it to connect "Lubo Bali" to the right profiles.
// Checked after every build by scripts/check-seo.mjs; validate changes at
// https://validator.schema.org and Google's Rich Results Test.
const id = (name: string) => `${site.url}/#${name}`;
// LuBot's id lives on lubot.ai, so lubot.ai can reuse it in its own JSON-LD.
const LUBOT_ID = `${site.product.url}#organization`;

export function homeGraph(): Graph {
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
        knowsAbout: [...site.knowsAbout],
        sameAs: [...site.sameAs],
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
    ],
  };
}
