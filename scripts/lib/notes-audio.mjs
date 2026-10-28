// Pure helpers for scripts/notes-audio.mjs (Phase 9, Listen).

/** Split the narration at paragraph breaks into pieces of at most `max`
 *  characters, so each TTS request stays small and nothing is cut mid-sentence. */
export function chunk(text, max = 2500) {
  const out = [];
  let cur = "";
  for (const para of text.split(/\n{2,}/)) {
    if (para.length > max) throw new Error(`one paragraph is ${para.length} characters (max ${max})`);
    if (cur && cur.length + 2 + para.length > max) {
      out.push(cur);
      cur = para;
    } else cur = cur ? `${cur}\n\n${para}` : para;
  }
  if (cur) out.push(cur);
  return out;
}

// Loudness, -16 LUFS (podcast standard), in two passes: one-pass loudnorm
// guesses and landed note #1 at -17.8. Pass 1 prints its measurement as
// JSON; pass 2 applies exactly that, linear (no pumping).
// Target -16 LUFS; peaks -1.5 dB so the mp3 encoder's overshoot stays under
// Apple's -1 dB. A gentle limiter first (speech peaks -3 dB) leaves room for
// the gain. The finished file must measure -16 +/- 1 LUFS, peaks <= -1 dB.
export const LOUDNESS = { I: -16, TP: -1.5, LRA: 11 };
export const PEAK_LIMITER = "alimiter=limit=0.708:attack=5:release=50:level=disabled";
export const ACCEPT = { minI: -17, maxI: -15, maxTP: -1 };
export const LOUDNORM_PASS1 = `loudnorm=I=${LOUDNESS.I}:TP=${LOUDNESS.TP}:LRA=${LOUDNESS.LRA}:print_format=json`;

/** loudnorm's measurement (pass 1 JSON in ffmpeg's stderr). */
export function loudnessOf(ffmpegOutput) {
  const json = ffmpegOutput.match(/\{[\s\S]*?"input_i"[\s\S]*?\}/)?.[0];
  if (!json) throw new Error("loudness: pass 1 printed no measurement");
  return JSON.parse(json);
}

/** The finished file is within the target, or a short reason why not. */
export function loudnessProblem(m) {
  const i = Number(m.input_i);
  const tp = Number(m.input_tp);
  if (i < ACCEPT.minI || i > ACCEPT.maxI) return `loudness ${i} LUFS, want -16 +/- 1`;
  if (tp > ACCEPT.maxTP) return `peaks ${tp} dB, want <= ${ACCEPT.maxTP}`;
  return null;
}

/** The pass-2 filter from pass 1's ffmpeg output (stderr). */
export function loudnormSecondPass(pass1Output) {
  const m = loudnessOf(pass1Output);
  return [
    `loudnorm=I=${LOUDNESS.I}:TP=${LOUDNESS.TP}:LRA=${LOUDNESS.LRA}`,
    `measured_I=${m.input_i}`,
    `measured_TP=${m.input_tp}`,
    `measured_LRA=${m.input_lra}`,
    `measured_thresh=${m.input_thresh}`,
    `offset=${m.target_offset}`,
    "linear=true",
  ].join(":");
}
