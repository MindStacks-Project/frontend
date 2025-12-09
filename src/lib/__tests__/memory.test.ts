import test from "node:test";
import assert from "node:assert/strict";
import { buildMemoryDeck, shuffleWithSeed } from "../memory";

const EMOJIS = ["😀", "🐱", "🚀"]; // sample pool for deterministic assertions

test("buildMemoryDeck duplicates each emoji exactly twice", () => {
  const deck = buildMemoryDeck(EMOJIS.slice(0, 2), "demo-seed");

  assert.equal(deck.length, 4);
  const ids = new Set(deck.map((card) => card.id));
  assert.equal(ids.size, deck.length, "card ids should be unique");

  const counts = deck.reduce<Record<string, { total: number; emoji: string }>>(
    (acc, card) => {
      const entry = acc[card.pairKey] ?? { total: 0, emoji: card.emoji };
      entry.total += 1;
      acc[card.pairKey] = entry;
      return acc;
    },
    {}
  );

  Object.values(counts).forEach(({ total, emoji }) => {
    assert.equal(total, 2, "each pair should appear twice in the deck");
    assert.ok(
      emoji.length > 0,
      "emoji payload should be carried over to card entries"
    );
  });
});

test("buildMemoryDeck produces deterministic order for the same seed", () => {
  const first = buildMemoryDeck(EMOJIS, "seed-123");
  const second = buildMemoryDeck(EMOJIS, "seed-123");
  const different = buildMemoryDeck(EMOJIS, "seed-456");

  assert.deepEqual(second, first, "same seed should yield identical order");
  assert.notDeepEqual(
    different,
    first,
    "different seeds should generate a different shuffle"
  );
});

test("buildMemoryDeck throws on empty emoji pool", () => {
  assert.throws(
    () => buildMemoryDeck([], "any"),
    /requires at least one emoji/
  );
});

test("shuffleWithSeed is deterministic and non-mutating", () => {
  const source = [1, 2, 3, 4, 5];
  const sourceSnapshot = [...source];
  const first = shuffleWithSeed(source, "shuffle-seed");
  const second = shuffleWithSeed(source, "shuffle-seed");

  assert.deepEqual(source, sourceSnapshot, "original array should remain untouched");
  assert.notEqual(first, source, "shuffle should return a new array instance");
  assert.deepEqual(second, first, "same seed should yield identical order");
});
