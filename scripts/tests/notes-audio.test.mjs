// Listen audio helpers (Phase 9): the narration is sent in pieces that never
// cut a paragraph, and nothing is lost or reordered.
import { test } from "node:test";
import assert from "node:assert/strict";
import { chunk } from "../lib/notes-audio.mjs";

test("pieces stay under the limit, keep every paragraph, in order", () => {
  const paras = Array.from({ length: 30 }, (_, i) => `Paragraph ${i} `.repeat(8).trim());
  const text = paras.join("\n\n");
  const pieces = chunk(text, 500);
  assert.ok(pieces.length > 1);
  assert.ok(pieces.every((p) => p.length <= 500));
  assert.equal(pieces.join("\n\n"), text);
});

test("a short text is one piece", () => {
  assert.deepEqual(chunk("Hello.\n\nWorld."), ["Hello.\n\nWorld."]);
});

test("one paragraph longer than the limit is an error, not a cut", () => {
  assert.throws(() => chunk("x".repeat(30), 10), /paragraph/);
});

// Loudness (P9.8): two passes. Pass 1 measures; pass 2 applies exactly that
// (linear), so every note lands on -16 LUFS like a podcast app expects.
import { loudnessProblem, loudnormSecondPass } from "../lib/notes-audio.mjs";

const PASS1 = `[Parsed_loudnorm_1 @ 0x5]
{
	"input_i" : "-21.30",
	"input_tp" : "-4.12",
	"input_lra" : "6.40",
	"input_thresh" : "-31.55",
	"output_i" : "-16.02",
	"target_offset" : "0.02"
}`;

test("second pass uses the measured values, linear, -16 LUFS", () => {
  const f = loudnormSecondPass(PASS1);
  assert.equal(
    f,
    "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=-21.30:measured_TP=-4.12:measured_LRA=6.40:measured_thresh=-31.55:offset=0.02:linear=true",
  );
});

test("no measurement in ffmpeg's output is an error, not a silent default", () => {
  assert.throws(() => loudnormSecondPass("no json here"), /loudness/);
});

test("the finished file must be -16 +/- 1 LUFS with peaks at or under -1 dB", () => {
  assert.equal(loudnessProblem({ input_i: "-16.4", input_tp: "-1.2" }), null);
  assert.match(loudnessProblem({ input_i: "-17.8", input_tp: "-2" }), /LUFS/);
  assert.match(loudnessProblem({ input_i: "-16.0", input_tp: "-0.7" }), /peaks/);
});
