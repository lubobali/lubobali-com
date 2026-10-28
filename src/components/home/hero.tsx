import { DataRain } from "@/components/ambient/data-rain";
import { BookCall } from "@/components/book-call";
import { Picture } from "@/components/picture";
import { buttonVariants } from "@/components/ui/button";
import { LiveDot } from "@/components/live-dot";
import { StatusDot } from "@/components/status-dot";
import { building } from "@/lib/building/copy";
import { liveSummary } from "@/lib/building/format";
import { loadLive } from "@/lib/building/load";
import { notesCopy } from "@/lib/notes/copy";
import { loadNotes } from "@/lib/notes/load";
import { site } from "@/lib/site";

// Home hero (Phase 3 H3). Copy approved by Lubo 2026-10-17
// (plans repo docs/phase-3-copy.md, headline A). All text is in the raw
// HTML (bots don't run JS); scripts/check-seo.mjs checks the headline.
export const HEADLINE = "I build AI that works on your real data, in production.";

function Availability({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground ${className}`}
    >
      <StatusDot />
      {site.availability}
    </p>
  );
}

function SubLine({ className = "" }: { className?: string }) {
  return (
    <p className={`text-lg text-muted-foreground sm:text-xl ${className}`}>
      {site.jobTitle}. I built{" "}
      {/* Underlined, not colour only (WCAG 1.4.1, H12); a soft line, full on hover. */}
      <a
        href={site.product.url}
        className="text-link underline decoration-link/40 underline-offset-4 transition-colors hover:decoration-link"
      >
        LuBot.ai
      </a>{" "}
      on my own: a multi-tenant AI analytics SaaS that Neon (Databricks) featured for its
      one-database-per-customer design.
    </p>
  );
}

// Phase 7: proof he is active, one quiet line under the buttons (the hero
// stays as approved). Today's line from the daily data, links to /building.
function BuildingLine() {
  const live = liveSummary(loadLive());
  return (
    <a href="/building" className="hero-building group inline-flex w-fit flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <LiveDot active={live.active} />
      <span className="tabular-nums">{live.line}</span>
      <span aria-hidden="true">·</span>
      <span className="text-link underline decoration-link/40 underline-offset-4 transition-colors group-hover:decoration-link">
        {building.home}
      </span>
    </a>
  );
}

// Phase 9: the newest weekly note, one quiet line under the building line,
// same look. No note yet = no line.
function NoteLine() {
  const [latest] = loadNotes();
  if (!latest) return null;
  return (
    <a href={`/notes/${latest.slug}`} className="hero-building group inline-flex w-fit flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      {/* Normal font on purpose: mono here = one more font download on home (over its 20-request budget). */}
      <span className="text-xs font-semibold tracking-wide uppercase">{notesCopy.home}</span>
      <span className="text-link underline decoration-link/40 underline-offset-4 transition-colors group-hover:decoration-link">
        {latest.title}
      </span>
    </a>
  );
}

const PHOTO_ALT = "Lubo Bali, AI and data platform engineer, in a dark suit";

/** Text left, photo right blending into the navy (like the share image).
 * Layout A, picked by Lubo 2026-10-17 over a centred one (L6). */
function HeroContent() {
  return (
    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-6 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:pt-20 lg:pb-24">
      <div className="flex flex-col gap-6">
        <Availability />
        <h1 className="text-hero font-semibold text-balance">{HEADLINE}</h1>
        <SubLine className="max-w-xl" />
        <div className="flex flex-wrap gap-3 pt-2">
          <BookCall />
          {/* Second, quieter action (H7): jump to the case studies. */}
          <a href="#work" className={buttonVariants({ variant: "outline", size: "xl" })}>
            See my work
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <BuildingLine />
          <NoteLine />
        </div>
      </div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-none">
        <div aria-hidden="true" className="hero-photo-backdrop absolute inset-0 bg-background" />
        <Picture
          name="lubo-bali-portrait"
          alt={PHOTO_ALT}
          sizes="(min-width: 1024px) 40vw, 90vw"
          priority
          className="hero-photo h-full w-full object-cover object-[55%_50%]"
        />
      </div>
    </div>
  );
}

// The photo blends (mix-blend-mode) into the navy + flowing rain of the
// wrapper in page.tsx (the blend group). So no isolate, z-index or
// background here: each would cut the photo off from them. Content after
// the rain in the DOM already paints on top of it. `hero-rain`: the
// hero's extra, brighter rain shows only away from the text (globals.css).
export function Hero() {
  return (
    <section
      aria-label="Introduction"
      className="hero-rain relative overflow-hidden"
    >
      <DataRain />
      {/* Strongest glow sits behind the headline (Phase 2 carry-over).
          glow-brand is contrast-checked under text (check-contrast.mjs). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-80 -left-80 size-[60rem] rounded-full bg-[radial-gradient(closest-side,var(--glow-brand),transparent)]"
      />
      <HeroContent />
    </section>
  );
}
