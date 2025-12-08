export type MemoryCardBlueprint = {
  id: string;
  pairKey: string;
  emoji: string;
};

const hashSeed = (seed: string): number => {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffleWithSeed = <T>(items: T[], seed: string): T[] => {
  const rng = mulberry32(hashSeed(seed));
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const buildMemoryDeck = (
  emojiPool: string[],
  seed: string
): MemoryCardBlueprint[] => {
  if (emojiPool.length === 0) {
    throw new Error("Memory puzzle requires at least one emoji");
  }

  const cards: MemoryCardBlueprint[] = emojiPool.flatMap((emoji, index) => {
    const pairKey = `${emoji}-${index}`;
    return [
      { id: `${pairKey}-a`, pairKey, emoji },
      { id: `${pairKey}-b`, pairKey, emoji },
    ];
  });

  return shuffleWithSeed(cards, seed);
};
