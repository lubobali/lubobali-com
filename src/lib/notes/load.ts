// The notes' only way in, at build time (Phase 9, P9.4). Reads every
// content/notes/YYYY-MM-DD-slug.md, checks it with parseNote(), and THROWS on
// any problem, naming the file and every rule it breaks: the build fails, so
// a bad note never reaches visitors. No folder yet = no notes.
//
// Listen audio (P9.8): content/notes/audio.json says which narration each
// public/notes/<slug>/listen.mp3 was made from (scripts/notes-audio.mjs).
// If the words changed since, the build fails: nobody hears an old version.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseNote, type Note } from "./note";

const DIR = join(process.cwd(), "content/notes");
const PUBLIC = join(process.cwd(), "public");

type AudioManifest = Record<string, { hash: string; seconds: number }>;

// One read per build: the index, every note page, the sitemap and RSS ask for it.
const cache = new Map<string, Note[]>();

function readManifest(dir: string): AudioManifest {
  const path = join(dir, "audio.json");
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as AudioManifest) : {};
}

export function loadNotes(dir: string = DIR, publicDir: string = PUBLIC): Note[] {
  const key = `${dir}\n${publicDir}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!existsSync(dir)) return [];

  const notes: Note[] = [];
  const problems: string[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const { note, errors } = parseNote(file, readFileSync(join(dir, file), "utf8"));
    if (errors.length) problems.push(`${file}:\n  - ${errors.join("\n  - ")}`);
    else if (note) notes.push(note);
  }
  const slugs = new Map<string, string>();
  for (const n of notes) {
    const other = slugs.get(n.slug);
    if (other) problems.push(`${n.file}: slug "${n.slug}" is already used by ${other}`);
    slugs.set(n.slug, n.file);
  }

  const audio = readManifest(dir);
  for (const n of notes) {
    const src = `/notes/${n.slug}/listen.mp3`;
    const onDisk = existsSync(join(publicDir, src));
    const entry = audio[n.slug];
    if (!entry && !onDisk) continue; // no audio yet = no Listen pill
    if (!onDisk) problems.push(`${n.file}: ${src.slice(1)} is missing (run scripts/notes-audio.mjs)`);
    else if (!entry || entry.hash !== n.narrationHash)
      problems.push(`${n.file}: audio is out of date, the words changed (run scripts/notes-audio.mjs)`);
    else n.audio = { src, seconds: entry.seconds };
  }
  if (problems.length) throw new Error(`Notes break the rules:\n${problems.join("\n")}`);

  notes.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  cache.set(key, notes);
  return notes;
}
