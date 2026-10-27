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
