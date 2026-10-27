import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlueprintSpot } from "@/components/blueprint-spot";
import { FinalCta } from "@/components/home/final-cta";
import { NoteBody, NoteFacts, NoteHeader, NoteNav } from "@/components/notes/note-parts";
import { notesCopy as copy } from "@/lib/notes/copy";
import { loadNotes } from "@/lib/notes/load";
import { site } from "@/lib/site";

// /notes/<slug> (Phase 9 P9.5): one weekly note. Text from
// content/notes/<date>-<slug>.md, checked at build time (lib/notes).
export const dynamicParams = false;

export function generateStaticParams() {
  return loadNotes().map((n) => ({ slug: n.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const find = (slug: string) => {
  const notes = loadNotes(); // newest first
  const i = notes.findIndex((n) => n.slug === slug);
  return i < 0 ? null : { note: notes[i], number: notes.length - i, newer: notes[i - 1], older: notes[i + 1] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = find((await params).slug);
  if (!hit) return {};
  const { note } = hit;
  return {
    title: note.title,
    description: note.description,
    openGraph: {
      type: "article",
      url: "./",
      siteName: site.name,
      locale: site.locale,
      title: note.title,
      description: note.description,
      publishedTime: note.date,
      ...(note.updated ? { modifiedTime: note.updated } : {}),
    },
  };
}

export default async function NotePage({ params }: Props) {
  const hit = find((await params).slug);
  if (!hit) notFound();
  const { note, number, newer, older } = hit;
  return (
    <main className="note-page flex flex-1 flex-col">
      <article className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:py-16">
        <NoteHeader note={note} number={number} />
        <NoteBody note={note} />
        <NoteFacts note={note} />
        <NoteNav older={older} newer={newer} />
        <BlueprintSpot lead={copy.note.cta} />
      </article>
      <FinalCta />
    </main>
  );
}
