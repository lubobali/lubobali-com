import type { Metadata } from "next";
import { FinalCta } from "@/components/home/final-cta";
import { NoteRow } from "@/components/notes/note-parts";
import { notesCopy as copy } from "@/lib/notes/copy";
import { loadNotes } from "@/lib/notes/load";
import { site } from "@/lib/site";

// /notes (Phase 9 P9.5): every weekly note, newest first. Notes are
// Markdown files in content/notes/, checked at build time (lib/notes).

const notes = loadNotes();

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  openGraph: {
    type: "website",
    url: "./",
    siteName: site.name,
    locale: site.locale,
    title: `${copy.title} — ${site.name}`,
    description: copy.description,
    // The site card until notes get their own (P9.7). A page that sets
    // openGraph must repeat images (layout.tsx note).
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}, ${site.jobTitle}` }],
  },
  twitter: { card: "summary_large_image", creator: "@Lubo_Bali" },
};

export default function NotesPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section aria-labelledby="notes-title" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-80 -left-80 size-[60rem] rounded-full bg-[radial-gradient(closest-side,var(--glow-brand),transparent)]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-12 pb-10 sm:px-6 lg:pt-20 lg:pb-14">
          <p className="note-eyebrow">{copy.hero.eyebrow}</p>
          <h1 id="notes-title" className="max-w-4xl text-hero font-semibold text-balance">
            {copy.hero.headline}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">{copy.hero.sub}</p>
        </div>
      </section>
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
        {notes.length ? (
          <ol className="flex flex-col gap-6">
            {notes.map((n, i) => (
              <NoteRow key={n.slug} note={n} number={notes.length - i} />
            ))}
          </ol>
        ) : (
          <p className="text-lg text-muted-foreground">{copy.empty}</p>
        )}
      </div>
      <FinalCta />
    </main>
  );
}
