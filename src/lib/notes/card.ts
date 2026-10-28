// What a note's share card shows (Phase 9 P9.7, concept C) and a hash of
// it. scripts/brand/note-cards.sh renders public/notes/<slug>/card.jpg and
// records the hash in content/notes/cards.json; a test fails when a card
// no longer matches its note (same pattern as the project cards, P5.7).
import { createHash } from "node:crypto";
import { notesCopy as copy } from "./copy";
import { CLUSTER_HUE } from "./fingerprint";
import type { Note } from "./note";

export const CARD_VERSION = "C-1"; // bump when the card template changes

const shortDate = (day: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${day}T00:00:00Z`),
  );
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function noteCard(n: Note, number: number) {
  return {
    version: CARD_VERSION,
    slug: n.slug,
    number: copy.note.number(number),
    week: copy.note.week(n.week),
    cluster: copy.clusters[n.cluster],
    date: shortDate(n.date),
    title: n.title,
    value: n.hero.value,
    label: n.hero.label,
    listen: n.audio ? `▶ ${copy.listen.play} ${clock(n.audio.seconds)}` : "",
    seed: `${n.slug}|${n.date}`,
    hue: CLUSTER_HUE[n.cluster],
    dots: Math.min(6, Math.max(1, (n.hero.value.match(/\d/g) ?? []).length)),
  };
}
export type NoteCard = ReturnType<typeof noteCard>;

export const noteCardHash = (card: NoteCard) => createHash("sha256").update(JSON.stringify(card)).digest("hex").slice(0, 16);
