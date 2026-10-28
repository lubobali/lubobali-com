import Link from "next/link";
import { BlueprintLink } from "@/components/blueprint-link";
import { BookCall } from "@/components/book-call";
import { ExploreButton } from "@/components/explore/explore-button";
import { liveSummary } from "@/lib/building/format";
import { loadLive } from "@/lib/building/load";
import { site } from "@/lib/site";

// Sticky top bar: name (home link) + Explore (search the work) + the AI
// blueprint tool + Book-a-call.
// Section links are added here as the sections land on the page (Phase 3
// H3+), never before, so there is no link to something that does not
// exist yet. "Free AI blueprint" (Phase 3b B5.3, Lubo: the tool is too far
// down the page) is outlined so Book a call stays the main action; it is
// "Blueprint" on phones. It always lands on the tool (BlueprintLink).
// Under 420px everything is a little tighter (2026-10-28): at 360-390px the
// Explore icon slid over the "i" of "Lubo Bali" (up to 30px overlap).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 min-[420px]:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 min-[420px]:gap-2 sm:gap-4">
          <Link href="/" prefetch={false} className="flex items-center gap-2 rounded-md font-semibold min-[420px]:gap-3">
            {/* LB key logo, dark-site version (scripts/brand/logo.mjs). Decorative:
                the name next to it is the link text. Plain <img>: a 3 KB file
                needs no optimizer (static export). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/lb-logo.webp" alt="" width={46} height={48} className="h-10 w-auto" />
            {/* Under 360px the name would wrap next to two buttons: the logo
                stays, the name is kept for screen readers (B5.3). */}
            <span className="whitespace-nowrap max-[359px]:sr-only">{site.name}</span>
          </Link>
          {/* Explore (Phase 4 C6): search across the work, next to the logo. */}
          {/* Live line for the "Building now" card (Phase 7), read at build. */}
          <ExploreButton live={liveSummary(loadLive())} />
        </div>
        <div className="flex items-center gap-1.5 min-[420px]:gap-2 sm:gap-3">
          {/* The tool: on home and /blueprint in place, else the home card. */}
          <BlueprintLink />
          <BookCall size="lg" compact className="px-3 min-[420px]:px-4" />
        </div>
      </div>
    </header>
  );
}
