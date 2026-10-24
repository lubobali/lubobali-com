import type { Metadata } from "next";
import {
  BuildingHero,
  BuildingNow,
  BuildingTrust,
  BuiltWith,
  SampleBanner,
  ShippedLately,
  YearMap,
} from "@/components/building/building-sections";
import { FinalCta } from "@/components/home/final-cta";
import { roundedDown } from "@/lib/about-counts";
import { building } from "@/lib/building/copy";
import { loadLive } from "@/lib/building/load";
import { site } from "@/lib/site";

// /building (Phase 7): what Lubo is building right now, proven by real
// numbers. The data is live.json, written every morning by a private job on
// the server (git, CI, uptime) and checked against the contract at build
// time (lib/building/load.ts). Words: lib/building/copy.ts.

const data = loadLive();
const description = building.description(roundedDown(data.tests.total, 1000));
// Its own card when the link is shared (P7.8), words only: never stale.
const shareImage = { url: building.share.path, width: 1200, height: 630, alt: `${building.share.hook} ${building.share.sub}` };

export const metadata: Metadata = {
  title: building.title,
  description,
  // Sample data is never a page to index (and deploy.sh refuses it, P7.9).
  robots: data.sample ? { index: false, follow: false } : undefined,
  openGraph: {
    type: "website",
    url: "./",
    siteName: site.name,
    locale: site.locale,
    title: `${building.title} — ${site.name}`,
    description,
    images: [shareImage],
  },
  twitter: { card: "summary_large_image", creator: "@Lubo_Bali", images: [shareImage] },
};

export default function BuildingPage() {
  return (
    <main className="flex flex-1 flex-col">
      {data.sample && <SampleBanner />}
      <BuildingHero data={data} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 pb-16 sm:px-6 lg:gap-28 lg:pb-24">
        <YearMap data={data} />
        <BuildingNow data={data} />
        <BuildingTrust data={data} />
        <ShippedLately data={data} />
        <BuiltWith data={data} />
      </div>
      <FinalCta />
    </main>
  );
}
