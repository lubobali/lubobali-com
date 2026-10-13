import type { Metadata } from "next";
import type { ReactNode } from "react";

// Internal preview of the design tokens. Not linked, not in the sitemap,
// noindex. Staging only — removed before the production launch.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const surfaces = [
  { name: "background", className: "bg-background", note: "Page" },
  { name: "card", className: "bg-card", note: "Cards, panels" },
  { name: "secondary / muted", className: "bg-muted", note: "Raised, chips" },
  { name: "accent", className: "bg-accent", note: "Hover" },
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
        <p className="font-mono text-sm text-primary">Phase 2 · P3 · design tokens</p>
        <h1 className="text-display font-semibold">Warm-dark, built to read.</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every colour below is a token in <code className="font-mono">globals.css</code>.
          Each text and background pair is contrast-checked in CI: main text at
          least 7:1, other text 4.5:1, focus ring and inputs 3:1.
        </p>
      </header>

      <Section title="Surfaces">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <Section title="Text">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
          <p className="text-lg">foreground — main text, headlines.</p>
          <p className="text-lg text-muted-foreground">
            muted-foreground — supporting text, captions, dates.
          </p>
          <p className="text-lg text-primary">primary — accent text and links.</p>
          <p className="text-lg text-destructive">destructive — errors only.</p>
        </div>
      </Section>

      <Section title="Accent + focus">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book a call
          </button>
          <button
            type="button"
            className="rounded-md border border-border bg-secondary px-5 py-2.5 font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            See case studies
          </button>
          <a href="#type" className="text-primary underline underline-offset-4">
            A text link
          </a>
          <input
            aria-label="Example input"
            placeholder="Input border"
            className="rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Press Tab to see the focus ring on each control. Plain HTML for now —
          shadcn Button arrives in P4.
        </p>
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
    </main>
  );
}
