import { BookCall } from "@/components/book-call";
import { StatusDot } from "@/components/status-dot";
import { site } from "@/lib/site";
import { CopyEmail } from "./copy-email";

// Final call to action (Phase 3 H11), "the finish line" (Lubo): the
// brightest, calmest card at the end of the journey. Same words as the
// intro video ("Tell me your problem..."), the next free slot, the one
// Book-a-call button (with a shine) and the email as text + Copy.
// The AI Blueprint spot (D9) stays empty until its phase: no "coming soon".
// Styles: globals.css .finale-*.
export function FinalCta() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 overflow-x-clip px-4 pt-8 pb-28 sm:px-6 lg:pt-12 lg:pb-32"
    >
      <div className="finale-card mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl px-6 py-14 text-center sm:px-12 lg:py-16">
        {/* Signature: the LB logo, very faint. Same file as the wheel hub. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/lb-logo-lg.webp"
          alt=""
          width={229}
          height={240}
          loading="lazy"
          decoding="async"
          className="finale-mark hidden sm:block"
        />
        <h2 id="contact-title" className="relative text-3xl font-semibold text-balance sm:text-5xl">
          Tell me your problem.
          <span className="finale-sub mt-2 block">{"I'll find a way to build the solution."}</span>
        </h2>
        <p className="finale-chip relative">
          <StatusDot />
          {site.availableNow ? "Available now" : `Next project from ${site.availableFrom}`}
        </p>
        <div className="relative flex flex-col items-center gap-3 pt-2">
          <BookCall className="finale-button" />
          <p className="text-sm text-muted-foreground">No obligation. Pick a time that suits you.</p>
        </div>
        <p className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-award/20 pt-6 text-sm">
          <span className="text-muted-foreground">Prefer email?</span>
          <a href={`mailto:${site.email}`} className="text-link underline-offset-4 hover:underline">
            {site.email}
          </a>
          <CopyEmail email={site.email} />
        </p>
      </div>
    </section>
  );
}
