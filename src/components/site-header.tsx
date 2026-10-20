import Link from "next/link";
import { BookCall } from "@/components/book-call";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// Sticky top bar: name (home link) + the AI blueprint tool + Book-a-call.
// Section links are added here as the sections land on the page (Phase 3
// H3+), never before, so there is no link to something that does not
// exist yet. "Free AI blueprint" (Phase 3b B5.3, Lubo: the tool is too far
// down the page) is outlined so Book a call stays the main action; it is
// "Blueprint" on phones. "/#blueprint" works from any page.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" prefetch={false} className="flex items-center gap-3 rounded-md font-semibold">
          {/* LB key logo, dark-site version (scripts/brand/logo.mjs). Decorative:
              the name next to it is the link text. Plain <img>: a 3 KB file
              needs no optimizer (static export). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/lb-logo.webp" alt="" width={46} height={48} className="h-10 w-auto" />
          {/* Under 360px the name would wrap next to two buttons: the logo
              stays, the name is kept for screen readers (B5.3). */}
          <span className="whitespace-nowrap max-[359px]:sr-only">{site.name}</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#blueprint"
            prefetch={false}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "header-blueprint px-3 sm:px-4")}
          >
            <span className="sm:hidden">Blueprint</span>
            <span className="hidden sm:inline">Free AI blueprint</span>
          </Link>
          <BookCall size="lg" compact className="px-4" />
        </div>
      </div>
    </header>
  );
}
