// The notes' only way in, at build time (Phase 9, P9.4). Reads every
// content/notes/YYYY-MM-DD-slug.md, checks it with parseNote(), and THROWS on
// any problem, naming the file and every rule it breaks: the build fails, so
// a bad note never reaches visitors. No folder yet = no notes.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseNote, type Note } from "./note";

const DIR = join(process.cwd(), "content/notes");

// One read per build: the index, every note page, the sitemap and RSS ask for it.
const cache = new Map<string, Note[]>();

export function loadNotes(dir: string = DIR): Note[] {
  const hit = cache.get(dir);
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
  if (problems.length) throw new Error(`Notes break the rules:\n${problems.join("\n")}`);

  notes.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  cache.set(dir, notes);
  return notes;
}
