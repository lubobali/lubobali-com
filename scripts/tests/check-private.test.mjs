// Private-name guard (Phase 9 P9.6). The real list is a CI secret; these
// tests use made-up names only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTerms, findPrivate } from "../lib/private.mjs";

test("terms: comma or newline separated, trimmed, empty dropped, short ones refused", () => {
  assert.deepEqual(parseTerms(" Acme Corp,\nJane Roe , ,"), ["Acme Corp", "Jane Roe"]);
  assert.throws(() => parseTerms("ab"), /at least 3/);
});

test("finds a term in any case, as a whole word, and says WHICH number, never the name", () => {
  const terms = parseTerms("Acme Corp,Jane");
  assert.deepEqual(findPrivate("we built it for ACME corp last year", terms), [1]);
  assert.deepEqual(findPrivate("Hi jane!", terms), [2]);
  assert.deepEqual(findPrivate("Janet and Acmes are fine", terms), []);
});

test("spacing and line breaks inside a name still match (HTML wraps text)", () => {
  assert.deepEqual(findPrivate("for Acme\n   Corp", parseTerms("Acme Corp")), [1]);
});
