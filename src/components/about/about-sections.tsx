import Link from "next/link";
import { DataRain } from "@/components/ambient/data-rain";
import { BookCall } from "@/components/book-call";
import { PROOF } from "@/components/home/proof-strip";
import { Picture } from "@/components/picture";
import { StatusDot } from "@/components/status-dot";
import { buttonVariants } from "@/components/ui/button";
import { about, industriesLabel, systemCount } from "@/lib/about";
import { site } from "@/lib/site";
import { SecurityIconMark } from "./security-icons";

// /about sections (Phase 6). Words: src/lib/about.ts. Same look as the rest
// of the site: the data rain + glow on top, the beam cards (edge-card.css),
// lighter to darker down the page. Styles: about.css (.about-*).

const eyebrow = "text-sm font-semibold tracking-wide text-award uppercase";

export function AboutHero() {
  return (
    <section aria-labelledby="about-title" className="relative overflow-hidden">
      <DataRain />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-80 -left-80 size-[60rem] rounded-full bg-[radial-gradient(closest-side,var(--glow-brand),transparent)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pt-20 lg:pb-24">
        <div className="flex flex-col gap-6">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground">
            <StatusDot />
            {site.availability}
          </p>
          <h1 id="about-title" className="text-hero font-semibold text-balance">
            {about.headline}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">{about.sub}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <BookCall />
            <Link href="/projects" prefetch={false} className={buttonVariants({ variant: "outline", size: "xl" })}>
              See all projects
            </Link>
          </div>
        </div>
        <figure className="about-portrait edge-card mx-auto w-full max-w-sm rounded-3xl p-2 lg:max-w-none">
          <Picture
            name="lubo-bali-about"
            alt={about.portraitAlt}
            // The real shown width: the frame is max 24rem wide minus its padding
            // (phones: screen minus the gutters). "90vw" made phones fetch the
            // 960 px file (38 KB) instead of 640 (18 KB): CI LCP 2506 ms.
            sizes="(min-width: 1024px) 36vw, min(23rem, calc(100vw - 3rem))"
            priority
            className="h-auto w-full rounded-[1.3rem]"
          />
        </figure>
      </div>
    </section>
  );
}

export function AboutThink() {
  const t = about.think;
  return (
    <section aria-labelledby="about-think" className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-16">
      <div className="flex flex-col gap-5">
        <p className={eyebrow}>{t.eyebrow}</p>
        <h2 id="about-think" className="text-3xl font-semibold text-balance sm:text-4xl">
          {/* The first sentence on its own line (Lubo). */}
          <span className="block sm:whitespace-nowrap">{t.heading[0]}</span> <span className="block">{t.heading[1]}</span>
        </h2>
        {t.lines.map((l) => (
          <p key={l} className="max-w-2xl text-lg text-muted-foreground">
            {l}
          </p>
        ))}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {t.stats.map((s) => (
          <li key={s.value} className="edge-card about-stat flex flex-col gap-2 rounded-3xl p-6">
            <span className="about-figure tabular-nums">{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutSecurity() {
  const s = about.security;
  return (
    <section id="security" aria-labelledby="about-security" className="about-vault edge-card scroll-mt-20 rounded-[2rem] px-5 py-10 sm:px-10 sm:py-14">
      {/* Like the chapter cards (Lubo): an accent rail, the LB logo in the
          middle of a vault dial, and the signature at the bottom. */}
      <span aria-hidden="true" className="about-rail" />
      <div aria-hidden="true" className="about-dial">
        <svg viewBox="0 0 200 200" fill="none">
          {[96, 78, 60, 42].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeDasharray={r === 78 ? "2 6" : undefined} />
          ))}
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1="100" y1="6" x2="100" y2={i % 6 === 0 ? 18 : 12} stroke="currentColor" transform={`rotate(${i * 15} 100 100)`} />
          ))}
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/lb-logo-lg.webp" alt="" width={229} height={240} loading="lazy" decoding="async" className="about-dial-logo" />
      </div>
      <div className="relative flex flex-col gap-4">
        <p className="about-security-eyebrow inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold tracking-wide uppercase">
          <SecurityIconMark icon="lock" />
          {s.eyebrow}
        </p>
        <h2 id="about-security" className="max-w-3xl text-3xl font-semibold text-balance sm:text-5xl">
          {s.heading}
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground">{s.intro}</p>
      </div>
      <ul className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {s.items.map((it) => (
          <li key={it.title} className="about-guard flex flex-col gap-3 rounded-2xl p-5">
            <span className="about-guard-icon grid size-11 place-items-center rounded-xl">
              <SecurityIconMark icon={it.icon} />
            </span>
            <h3 className="font-semibold">{it.title}</h3>
            <p className="text-sm text-muted-foreground">{it.text}</p>
          </li>
        ))}
      </ul>
      <p className="bc-sign relative mt-10">
        <span aria-hidden="true" className="bc-dash" />
        Lubo Bali <span className="bc-site">· lubobali.com</span>
      </p>
    </section>
  );
}

export function AboutProof() {
  const items = [
    { value: String(systemCount), label: "systems built end to end" },
    { value: industriesLabel, label: "industries" },
    PROOF[0],
    PROOF[1],
  ];
  return (
    <section aria-labelledby="about-proof" className="flex flex-col gap-8">
      <h2 id="about-proof" className="text-3xl font-semibold text-balance sm:text-4xl">
        {about.proofHeading}
      </h2>
      <ul className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
        {items.map((p) => (
          <li key={p.label} className="flex flex-col gap-1 border-t border-award/25 pt-4">
            <span className="about-figure tabular-nums">{p.value}</span>{" "}
            <span className="text-sm text-muted-foreground">{p.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground">
        Featured by Neon (Databricks):{" "}
        <a href={site.featuredIn.url} className="text-link underline decoration-link/40 underline-offset-4 hover:decoration-link">
          {site.featuredIn.title}
        </a>
      </p>
    </section>
  );
}

export function AboutPerson() {
  const p = about.person;
  return (
    <section aria-labelledby="about-person" className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14">
      <figure className="about-court edge-card order-last rounded-3xl p-2 lg:order-first">
        <Picture name="lubo-bali-basketball" alt={p.photoAlt} sizes="(min-width: 1024px) 34vw, 92vw" className="h-auto w-full rounded-[1.3rem]" />
      </figure>
      <div className="flex flex-col gap-5">
        <p className={eyebrow}>{p.eyebrow}</p>
        <h2 id="about-person" className="text-3xl font-semibold text-balance sm:text-4xl">
          {p.heading}
        </h2>
        {p.lines.map((l) => (
          <p key={l} className="text-lg text-muted-foreground">
            {l}
          </p>
        ))}
      </div>
    </section>
  );
}

export function AboutQuote() {
  return (
    <figure className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
      <blockquote className="about-quote text-balance">{about.quote}</blockquote>
      <figcaption className="text-sm tracking-wide text-muted-foreground uppercase">{site.name}</figcaption>
    </figure>
  );
}
