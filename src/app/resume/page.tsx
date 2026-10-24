import type { Metadata } from "next";
import { FinalCta } from "@/components/home/final-cta";
import { ResumeFullText, ResumeHero, ResumeJourney, ResumeSkillsEducation } from "@/components/resume/resume-sections";
import { JsonLd } from "@/components/seo/json-ld";
import { resumeShare } from "@/lib/resume";
import { resumePage } from "@/lib/resume-page";
import { resumeGraph } from "@/lib/schema";
import { site } from "@/lib/site";

// /resume (Phase 6, P6.7, plan v2 agreed with Lubo 2026-10-24): the fit box
// first ("check my resume against your job post"), then the PDF, the
// experience, education and skills, and the same finish line as home.

// Its own card when the link is shared (P6.9), not the site photo card.
const shareImage = { url: resumeShare.path, width: 1200, height: 630, alt: `${resumeShare.hook} ${resumeShare.sub}` };

export const metadata: Metadata = {
  title: resumePage.title,
  description: resumePage.description,
  // A page that sets openGraph replaces the whole object: repeat images.
  openGraph: {
    type: "profile",
    url: "./",
    siteName: site.name,
    locale: site.locale,
    title: `${resumePage.title} — ${site.name}`,
    description: resumePage.description,
    images: [shareImage],
  },
  twitter: { card: "summary_large_image", creator: "@Lubo_Bali", images: [shareImage] },
};

export default function ResumePage() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={resumeGraph()} />
      <ResumeHero />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pt-10 pb-16 sm:px-6 lg:gap-28 lg:pt-14 lg:pb-24">
        <ResumeJourney />
        <ResumeSkillsEducation />
        <ResumeFullText />
      </div>
      <FinalCta />
    </main>
  );
}
