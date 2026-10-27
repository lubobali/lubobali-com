// Make the Listen audio for every note whose words changed (Phase 9).
//
//   set -a; . /etc/lubobali-tts.env; set +a   # root-only: ELEVENLABS_API_KEY, NOTES_VOICE_ID
//   node scripts/notes-audio.mjs --dry        # what would be made + credits, no API call
//   node scripts/notes-audio.mjs              # make it, then commit the mp3 + audio.json
//
// Voice: Lubo's own ElevenLabs voice clone, then 16% faster (his pick), mono
// 64 kbps at -16 LUFS. The narration comes from the note itself (lib/notes),
// and content/notes/audio.json records which words each file was made from:
// the build fails when they no longer match (lib/notes/load.ts).
import "./lib/ts-paths.mjs";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chunk } from "./lib/notes-audio.mjs";

const { parseNote } = await import("../src/lib/notes/note.ts");

const DIR = "content/notes";
const MANIFEST = join(DIR, "audio.json");
const MODEL = "eleven_multilingual_v2";
const TEMPO = "1.16";
const dry = process.argv.includes("--dry");

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const notes = readdirSync(DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const { note, errors } = parseNote(f, readFileSync(join(DIR, f), "utf8"));
    if (errors.length) throw new Error(`${f}: fix the note first:\n  - ${errors.join("\n  - ")}`);
    return note;
  });
const todo = notes.filter(
  (n) => manifest[n.slug]?.hash !== n.narrationHash || !existsSync(join("public/notes", n.slug, "listen.mp3")),
);

if (!todo.length) {
  console.log("All Listen audio is up to date.");
  process.exit(0);
}
for (const n of todo) console.log(`${n.slug}: ${n.narration.length} characters (~${n.narration.length} credits)`);
if (dry) process.exit(0);

const key = process.env.ELEVENLABS_API_KEY;
const voice = process.env.NOTES_VOICE_ID;
if (!key || !voice) throw new Error("ELEVENLABS_API_KEY and NOTES_VOICE_ID must be set (root-only env file)");

async function speak(text, previous, next) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL, previous_text: previous, next_text: next }),
  });
  if (!res.ok) throw new Error(`ElevenLabs HTTP ${res.status}`); // never echo the body: it may repeat the key
  return Buffer.from(await res.arrayBuffer());
}

const ffmpeg = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "ignore", "inherit"] });

for (const n of todo) {
  const tmp = mkdtempSync(join(tmpdir(), "notes-audio-"));
  try {
    const pieces = chunk(n.narration);
    const files = [];
    for (const [i, text] of pieces.entries()) {
      const file = join(tmp, `part-${i}.mp3`);
      writeFileSync(file, await speak(text, pieces[i - 1], pieces[i + 1]));
      files.push(file);
    }
    writeFileSync(join(tmp, "list.txt"), files.map((f) => `file '${f}'`).join("\n"));
    const out = join("public/notes", n.slug, "listen.mp3");
    mkdirSync(join("public/notes", n.slug), { recursive: true });
    ffmpeg([
      "-f", "concat", "-safe", "0", "-i", join(tmp, "list.txt"),
      "-af", `atempo=${TEMPO},loudnorm=I=-16:TP=-1.5:LRA=11`,
      "-ac", "1", "-ar", "44100", "-b:a", "64k",
      "-metadata", `title=${n.title}`, "-metadata", "artist=Lubo Bali",
      "-metadata", "comment=AI version of Lubo's voice (ElevenLabs)",
      out,
    ]);
    const seconds = Math.round(
      Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).toString()),
    );
    manifest[n.slug] = { hash: n.narrationHash, seconds };
    console.log(`${n.slug}: ${out}, ${seconds} s`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
