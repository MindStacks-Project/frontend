import test from "node:test";
import assert from "node:assert/strict";

import { getPuzzleById, puzzles } from "../puzzles";

test("getPuzzleById reports success when the game exists in the log", () => {
  const existing = puzzles[0];
  assert.ok(existing, "expected fixture puzzles to provide at least one game");

  const result = getPuzzleById(existing.id);
  assert.ok(
    result,
    `expected game with id "${existing.id}" to be found in the log`
  );
  assert.equal(
    result?.id,
    existing.id,
    "expected lookup to return the matching game"
  );
});

test("getPuzzleById reports missing when the game is absent from the log", () => {
  const result = getPuzzleById("game-that-does-not-exist");
  assert.equal(
    result,
    undefined,
    "expected lookup to fail for a non-existent game"
  );
});
