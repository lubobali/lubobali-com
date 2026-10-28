import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildFeed } from "@/lib/notes/feed";
import { loadNotes } from "@/lib/notes/load";

// /notes/feed.xml (Phase 9 P9.6): a static file made at build time.
export const dynamic = "force-static";

export function GET() {
  const notes = loadNotes();
  const bytes: Record<string, number> = {};
  for (const n of notes) {
    const file = join(process.cwd(), "public", n.audio?.src ?? "");
    if (n.audio && existsSync(file)) bytes[n.slug] = statSync(file).size;
  }
  return new Response(buildFeed(notes, bytes), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
