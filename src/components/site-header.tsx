import Link from "next/link";
import { BookCall } from "@/components/book-call";
import { site } from "@/lib/site";

// Sticky top bar: name (home link) + Book-a-call. Section links are added
// here as the sections land on the page (Phase 3 H3+), never before, so
// there is no link to something that does not exist yet.
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
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground"
          >
            LB
          </span>
          <span>{site.name}</span>
        </Link>
        <BookCall size="lg" compact className="px-4" />
      </div>
    </header>
  );
}
