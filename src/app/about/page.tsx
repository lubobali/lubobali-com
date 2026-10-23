import type { Metadata } from "next";
import { AskLubo } from "@/components/ask-lubo";
import { AboutHero, AboutPerson, AboutProof, AboutQuote, AboutSecurity, AboutThink } from "@/components/about/about-sections";
import { FinalCta } from "@/components/home/final-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { about } from "@/lib/about";
import { aboutGraph } from "@/lib/schema";
import { site } from "@/lib/site";

// /about (Phase 6): who Lubo is, told to a CEO: how he thinks, how he keeps
// their data safe, the proof, the person, then the same finish line as the
// home page. Copy: src/lib/about.ts (approved by Lubo 2026-10-22).

export const metadata: Metadata = {
  title: about.title,
  description: about.description,
  // A page that sets openGraph replaces the whole object: repeat images.
  openGraph: {
    type: "profile",
    url: "./",
    siteName: site.name,
    locale: site.locale,
    title: `${about.title} — ${site.name}`,
    description: about.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}, ${site.jobTitle}` }],
  },
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={aboutGraph()} />
      <AboutHero />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 py-16 sm:px-6 lg:gap-32 lg:py-24">
        <AboutThink />
        <AboutSecurity />
        <AboutProof />
        <AboutPerson />
        <AboutQuote />
        <AskLubo />
      </div>
      <FinalCta />
    </main>
  );
}
