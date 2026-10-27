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
