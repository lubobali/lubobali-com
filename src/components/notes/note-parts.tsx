import "./notes.css";
import Link from "next/link";
import { notesCopy as copy } from "@/lib/notes/copy";
import type { Note } from "@/lib/notes/note";
import { noteCard } from "@/lib/notes/card";
import { Listen } from "./listen";
import { NotePrint } from "./note-print";

// /notes/<slug> (Phase 9 P9.5): header (number, title, TL;DR, the big
// number with its proof), the story, sources, code, older/newer notes.
// The note's HTML comes from lib/notes/note.ts: raw HTML off, every link
// checked at build time, so rendering it as HTML is safe.

const longDate = (day: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(
    new Date(`${day}T00:00:00Z`),
  );

function OutLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} rel="noopener" target="_blank" className={className}>
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function NoteHeader({ note, number }: { note: Note; number: number }) {
  return (
    <header className="flex flex-col gap-5">
      <Link href="/notes" prefetch={false} className="self-start text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        <span aria-hidden="true">←</span> {copy.note.back}
      </Link>
      {/* The title block of an engineering drawing: number, week, date, topic, time. */}
      <div className="note-sheet relative overflow-hidden">
        <Print note={note} number={number} />
        <p className="note-sheet-meta note-eyebrow relative z-10">
          <span className="text-link">{copy.note.number(number)}</span>
          <span>{copy.note.week(note.week)}</span>
          <time dateTime={note.date}>{longDate(note.date)}</time>
          <span>{copy.clusters[note.cluster]}</span>
          <span>{copy.note.minutes(note.readMinutes)}</span>
          {note.updated && (
            <span>
              {copy.note.updated} <time dateTime={note.updated}>{longDate(note.updated)}</time>
            </span>
          )}
        </p>
        <div className="relative z-10 grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-14">
          <div className="flex min-w-0 flex-col gap-6">
            <h1 className="max-w-4xl text-4xl font-semibold text-balance sm:text-5xl">{note.title}</h1>
            {note.audio && <Listen src={note.audio.src} seconds={note.audio.seconds} title={note.title} />}
            <div className="note-tldr flex max-w-[68ch] flex-col gap-2 rounded-r-2xl px-5 py-4">
              <p className="note-eyebrow">{copy.note.tldr}</p>
              <p className="text-lg text-foreground">{note.tldr}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:min-w-56">
            <span className="note-figure tabular-nums">{note.hero.value}</span>
            <span aria-hidden="true" className="note-dim" />
            <span className="text-muted-foreground">{note.hero.label}</span>
            <OutLink href={note.hero.source} className="self-start text-sm font-medium text-link underline underline-offset-4">
              {copy.note.proof}
            </OutLink>
          </div>
        </div>
      </div>
    </header>
  );
}

// Only the card's seed, colour and dot count go to the browser (note-print.tsx).
function Print({ note, number }: { note: Note; number: number }) {
  const card = noteCard(note, number);
  return <NotePrint seed={card.seed} hue={card.hue} dots={card.dots} />;
}

export function NoteBody({ note }: { note: Note }) {
  // Safe: built from Markdown with raw HTML off and every link checked (lib/notes/note.ts).
  return <div className="note-prose" dangerouslySetInnerHTML={{ __html: note.html }} />;
}

export function NoteFacts({ note }: { note: Note }) {
  return (
    <section aria-label="Built with and sources" className="grid max-w-[68ch] gap-8 border-t border-border pt-8">
      <div className="flex flex-col gap-3">
        <h2 className="note-eyebrow">{copy.note.stack}</h2>
        <ul className="flex flex-wrap gap-2">
          {note.stack.map((s) => (
            <li key={s} className="note-chip rounded-full px-3 py-1 text-sm">
              {s}
            </li>
          ))}
        </ul>
        <OutLink href={note.repo} className="mt-2 self-start rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
          {copy.note.repo}
        </OutLink>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="note-eyebrow">{copy.note.sources}</h2>
        <ol className="flex flex-col gap-2 text-muted-foreground">
          {note.sources.map((s) => (
            <li key={s.url}>
              <OutLink href={s.url} className="text-link underline decoration-link/50 underline-offset-4 hover:decoration-link">
                {s.title}
              </OutLink>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function NoteNav({ older, newer }: { older?: Note; newer?: Note }) {
  if (!older && !newer) return null;
  return (
    <nav aria-label="More notes" className="grid max-w-[68ch] gap-4 sm:grid-cols-2">
      {older && (
        <Link href={`/notes/${older.slug}`} prefetch={false} className="note-row flex flex-col gap-1 rounded-2xl p-4">
          <span className="text-sm text-muted-foreground">← {copy.note.previous}</span>
          <span className="font-medium">{older.title}</span>
        </Link>
      )}
      {newer && (
        <Link href={`/notes/${newer.slug}`} prefetch={false} className="note-row flex flex-col gap-1 rounded-2xl p-4 sm:col-start-2 sm:text-right">
          <span className="text-sm text-muted-foreground">{copy.note.next} →</span>
          <span className="font-medium">{newer.title}</span>
        </Link>
      )}
    </nav>
  );
}

export function NoteRow({ note, number }: { note: Note; number: number }) {
  // Tap anywhere: the note opens (one invisible link covers the card). The
  // Listen pill sits above it as its own button: it plays right here, no
  // page change (Lubo 2026-10-28). A button can't live inside a link.
  return (
    <li className="note-row group relative rounded-3xl">
      <Link href={`/notes/${note.slug}`} prefetch={false} className="note-row-link absolute inset-0 z-0 rounded-3xl">
        <span className="sr-only">{note.title}</span>
      </Link>
      <div className="pointer-events-none relative z-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:p-8">
        <div className="flex min-w-0 flex-col gap-3">
          <p className="note-eyebrow">
            {copy.note.eyebrow(number, note.week)} · {copy.clusters[note.cluster]}
          </p>
          <h2 className="text-2xl font-semibold text-balance">{note.title}</h2>
          <p className="max-w-[68ch] text-muted-foreground">{note.tldr}</p>
          <p className="text-sm text-muted-foreground">
            <time dateTime={note.date}>{longDate(note.date)}</time> · {copy.note.minutes(note.readMinutes)}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            {note.audio && (
              <div className="pointer-events-auto">
                <Listen src={note.audio.src} seconds={note.audio.seconds} title={note.title} compact />
              </div>
            )}
            <span aria-hidden="true" className="font-semibold text-link underline decoration-link/40 underline-offset-4 group-hover:decoration-link">
              {copy.list.read} <span>→</span>
            </span>
          </div>
        </div>
        <p className="flex shrink-0 flex-col gap-1 sm:items-end sm:text-right">
          <span className="note-figure tabular-nums">{note.hero.value}</span>
          <span className="text-sm text-muted-foreground">{note.hero.label}</span>
        </p>
      </div>
    </li>
  );
}
