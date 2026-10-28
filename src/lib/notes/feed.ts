// /notes/feed.xml (Phase 9 P9.6): RSS 2.0 for readers, podcast apps and
// crawlers. Built only from the notes, never from the clock, so the same
// notes always give the same file. A note with Listen audio carries it as
// an <enclosure> (the AI voice is labelled in the note itself).
import { notesCopy as copy } from "@/lib/notes/copy";
import type { Note } from "@/lib/notes/note";
import { site } from "@/lib/site";

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
// A day as an RFC-822 date at noon UTC: the same calendar day in every US time zone.
const rfc822 = (day: string) => new Date(`${day}T12:00:00Z`).toUTCString();

/** `audioBytes`: listen.mp3 size per slug (RSS wants the length of an enclosure). */
export function buildFeed(notes: readonly Note[], audioBytes: Record<string, number>): string {
  const self = `${site.url}/notes/feed.xml`;
  const newest = notes.map((n) => n.updated ?? n.date).sort().at(-1);
  const items = notes.map((n) => {
    const url = `${site.url}/notes/${n.slug}`;
    const bytes = audioBytes[n.slug];
    return [
      "    <item>",
      `      <title>${xml(n.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(n.date)}</pubDate>`,
      `      <description>${xml(n.tldr)}</description>`,
      `      <category>${xml(copy.clusters[n.cluster])}</category>`,
      ...(n.audio && bytes ? [`      <enclosure url="${site.url}${n.audio.src}" length="${bytes}" type="audio/mpeg"/>`] : []),
      "    </item>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(`${copy.title} by ${site.name}`)}</title>`,
    `    <link>${site.url}/notes</link>`,
    `    <description>${xml(copy.description)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    ...(newest ? [`    <lastBuildDate>${rfc822(newest)}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
