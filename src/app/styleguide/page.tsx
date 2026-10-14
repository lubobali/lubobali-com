import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { DataRain } from "@/components/ambient/data-rain";
import { Picture } from "@/components/picture";

const photos = [
  { name: "lubo-bali-portrait", use: "home hero", alt: "Lubo Bali, AI and Data Platform Engineer, in a dark suit" },
  { name: "lubo-bali-about", use: "about", alt: "Lubo Bali in a gray suit, arms crossed" },
  { name: "lubo-bali-basketball", use: "about: who I was", alt: "Lubo Bali in a white shirt and tie, arms spread wide, holding a basketball" },
  { name: "lubo-bali-headshot", use: "contact", alt: "Headshot of Lubo Bali in a gray suit" },
];

const ambients = [
  {
    id: "A + B",
    name: "Aurora with stars",
    note: "Soft LuBot-blue glows drifting, with tiny stars twinkling on top.",
    layers: (
      <>
        <div aria-hidden className="ambient ambient-aurora" />
        <div aria-hidden className="ambient ambient-stars" />
      </>
    ),
  },
  {
    id: "D",
    name: "Data rain",
    note: "Streams of data characters rising from bottom to top, in three layers of depth.",
    layers: <DataRain />,
  },
];

const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
const sizes = ["sm", "default", "lg", "xl"] as const;

// Internal preview of the design tokens. Not linked, not in the sitemap,
// noindex. Staging only — removed before the production launch.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const surfaces = [
  { name: "background", className: "bg-background", note: "Page" },
  { name: "card", className: "bg-card", note: "Cards, panels" },
  { name: "secondary / muted / accent", className: "bg-muted", note: "Raised, chips, hover" },
];

// Same blue scale as lubot.ai (one brand across Lubo's products).
const blues = [
  { name: "brand-deep", className: "bg-brand-deep", hex: "#3a6ae0", note: "Buttons" },
  { name: "brand", className: "bg-brand", hex: "#4b7cf3", note: "Main blue, glows" },
  { name: "brand-light", className: "bg-brand-light", hex: "#6b93f7", note: "Links, focus ring" },
  { name: "brand-soft", className: "bg-brand-soft", hex: "#8baaf8", note: "Soft highlights" },
];

const typeScale = [
  { name: "display", className: "text-display font-semibold" },
  { name: "5xl", className: "text-5xl font-semibold tracking-tight" },
  { name: "3xl", className: "text-3xl font-semibold tracking-tight" },
  { name: "xl", className: "text-xl font-medium" },
  { name: "base", className: "text-base" },
  { name: "sm", className: "text-sm" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-border pt-10">
      <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-20">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm text-link">Phase 2 · design system</p>
        <h1 className="text-display font-semibold">Dark navy, built to read.</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every colour below is a token in <code className="font-mono">globals.css</code>.
          Each text and background pair is contrast-checked in CI: main text at
          least 7:1, other text 4.5:1, focus ring and inputs 3:1.
        </p>
      </header>

      <Section title="Surfaces">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {surfaces.map((s) => (
            <div
              key={s.name}
              className={`${s.className} flex h-32 flex-col justify-end rounded-lg border border-border p-4`}
            >
              <span className="text-sm font-medium">{s.name}</span>
              <span className="text-sm text-muted-foreground">{s.note}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Brand blues (lubot.ai)">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {blues.map((b) => (
            <div key={b.name} className="flex flex-col gap-2">
              <div className={`${b.className} h-24 rounded-lg`} />
              <span className="text-sm font-medium">{b.name}</span>
              <span className="font-mono text-sm text-muted-foreground">
                {b.hex} · {b.note}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Text">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
          <p className="text-lg">foreground — main text, headlines.</p>
          <p className="text-lg text-muted-foreground">
            muted-foreground — supporting text, captions, dates.
          </p>
          <p className="text-lg text-link">link — blue text and links.</p>
          <p className="text-lg text-destructive">destructive — errors only.</p>
        </div>
      </Section>

      <Section title="Calls to action + focus">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="xl">Book a call</Button>
          <Button size="xl" variant="outline">
            See case studies
          </Button>
          <a href="#type" className="text-link underline underline-offset-4">
            A text link
          </a>
          <input
            aria-label="Example input"
            placeholder="Input border"
            className="rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Press Tab to see the focus ring on each control.
        </p>
      </Section>

      <Section title="Button (shadcn)">
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((s) => (
            <Button key={s} size={s}>
              size {s}
            </Button>
          ))}
          <Button disabled>disabled</Button>
        </div>
      </Section>

      <Section title="Type">
        <div id="type" className="flex flex-col gap-6">
          {typeScale.map((t) => (
            <div key={t.name} className="flex flex-col gap-1">
              <span className="font-mono text-sm text-muted-foreground">{t.name}</span>
              <span className={t.className}>AI & Data Platform Engineer</span>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm text-muted-foreground">mono</span>
            <span className="font-mono text-base">
              SELECT tenant_id, count(*) FROM events GROUP BY 1;
            </span>
          </div>
        </div>
      </Section>

      <Section title="Photos (build-time pipeline)">
        <p className="text-sm text-muted-foreground">
          AVIF, then WebP, in several widths; your browser picks the smallest
          file that fits. Lazy-loaded, no layout shift.
        </p>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          {photos.map((p) => (
            <figure key={p.name} className="flex flex-col gap-2">
              <Picture
                name={p.name}
                alt={p.alt}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="h-auto w-full rounded-lg border border-border"
              />
              <figcaption className="font-mono text-sm text-muted-foreground">
                {p.name} · {p.use}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Ambient background — pick one">
        <p className="text-sm text-muted-foreground">
          CSS only, no JavaScript. Stops moving when your device asks for
          reduced motion. Each panel shows real text on top to judge readability.
        </p>
        <div className="flex flex-col gap-8">
          {ambients.map((a) => (
            <div
              key={a.id}
              className="relative flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-xl border border-border bg-background p-8 md:h-[70vh] md:p-12"
            >
              {a.layers}
              <div className="relative z-10 flex flex-col gap-4">
                <p className="font-mono text-sm text-link">
                  Option {a.id} · {a.name}
                </p>
                <p className="text-5xl font-semibold tracking-tight">Lubo Bali</p>
                <p className="max-w-xl text-lg text-muted-foreground">{a.note}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="xl">Book a call</Button>
                  <a href="#type" className="text-link underline underline-offset-4">
                    See case studies
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Reveal on scroll">
        <p className="text-sm text-muted-foreground">
          Each card fades and slides in once. Never used on the first screen.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {["Multi-tenant AI SaaS", "Data platforms", "LLM + evals"].map((t, i) => (
            <Reveal key={t} delay={i * 0.1}>
              <div className="flex h-40 flex-col justify-end rounded-lg border border-border bg-card p-6">
                <span className="text-xl font-medium">{t}</span>
                <span className="text-sm text-muted-foreground">Reveal, delay {i * 0.1}s</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </main>
  );
}
