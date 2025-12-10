import type { Puzzle, PuzzleDifficulty, MemoryPuzzle } from "@/lib/types";

type MemoryDifficultyConfig = {
  grid: { rows: number; cols: number };
  pairs: number;
  timeLimitMs: number;
  moveLimit: number;
};

const MEMORY_EMOJIS = [
  "😀",
  "😅",
  "😂",
  "🥲",
  "😍",
  "🤩",
  "😎",
  "😴",
  "🤖",
  "👾",
  "🐶",
  "🐱",
  "🐼",
  "🦊",
  "🐸",
  "🐙",
  "🦄",
  "🐝",
  "🍎",
  "🍊",
  "🍋",
  "🍉",
  "🍇",
  "🍓",
  "🥝",
  "🥑",
  "🌶️",
  "🌽",
  "🍔",
  "🍕",
  "🍩",
  "🥨",
  "⚽",
  "🏀",
  "🏈",
  "⚾",
  "🎮",
  "🎲",
  "🎧",
  "🚀",
  "🛸",
];

const MEMORY_DIFFICULTY_SETTINGS: Record<PuzzleDifficulty, MemoryDifficultyConfig> = {
  easy: {
    grid: { rows: 3, cols: 4 },
    pairs: 6,
    timeLimitMs: 180000,
    moveLimit: 40,
  },
  medium: {
    grid: { rows: 4, cols: 6 },
    pairs: 12,
    timeLimitMs: 240000,
    moveLimit: 65,
  },
  hard: {
    grid: { rows: 7, cols: 8 },
    pairs: 28,
    timeLimitMs: 420000,
    moveLimit: 110,
  },
};

const selectEmojiPool = (count: number, seed: number): string[] => {
  if (count > MEMORY_EMOJIS.length) {
    throw new Error(
      `Memory emoji pool exhausted: requested ${count} unique emojis but only ${MEMORY_EMOJIS.length} available.`
    );
  }

  const pool: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const emoji = MEMORY_EMOJIS[(seed + i) % MEMORY_EMOJIS.length];
    pool.push(emoji);
  }
  return pool;
};

const createMemoryPuzzle = (
  id: string,
  difficulty: PuzzleDifficulty,
  source: string,
  seed: number,
  nextPuzzleId?: string
): MemoryPuzzle => {
  const settings = MEMORY_DIFFICULTY_SETTINGS[difficulty];

  return {
    id,
    type: "memory",
    difficulty,
    source,
    grid: settings.grid,
    pairs: settings.pairs,
    emojiPool: selectEmojiPool(settings.pairs, seed),
    timeLimitMs: settings.timeLimitMs,
    moveLimit: settings.moveLimit,
    deckSeed: `${id}-seed-${seed}`,
    nextPuzzleId,
  };
};

export const puzzles: Puzzle[] = [
  // 1. Sokoban
  {
    id: "sokoban-easy-1",
    type: "sokoban",
    difficulty: "easy",
    layout: [
      "  #####",
      "###  .#",
      "# $ $ #",
      "# .@  #",
      "###  .#",
      "  #####",
    ],
    source: "Warehouse Classics",
  },
  {
    id: "sokoban-medium-1",
    type: "sokoban",
    difficulty: "medium",
    layout: [
      " #######",
      " #  .  #",
      " # ##$##",
      " #  $  #",
      "##$#. .#",
      "#   @  #",
      "####### ",
    ],
    source: "Community Remix",
  },
  {
    id: "sokoban-hard-1",
    type: "sokoban",
    difficulty: "hard",
    layout: [
      "#########",
      "#.  #   #",
      "#$$## #.#",
      "# .@$ $ #",
      "#  ##$  #",
      "#..   ###",
      "#########",
    ],
    source: "Retro Vault",
  },

  // 2. Memory Match
  createMemoryPuzzle(
    "memory-emoji-easy-1",
    "easy",
    "Emoji Archives",
    2,
    "memory-emoji-medium-1"
  ),
  createMemoryPuzzle(
    "memory-emoji-medium-1",
    "medium",
    "Emoji Archives",
    7,
    "memory-emoji-hard-1"
  ),
  createMemoryPuzzle("memory-emoji-hard-1", "hard", "Emoji Archives", 13),

  // 3. Wordle
  {
    id: "wordle-easy-1",
    type: "wordle",
    difficulty: "easy",
    solution: "APPLE",
    wordLength: 5,
    maxGuesses: 6,
    source: "Community",
  },
  {
    id: "wordle-medium-1",
    type: "wordle",
    difficulty: "medium",
    solution: "BRAVE",
    wordLength: 5,
    maxGuesses: 6,
    source: "Instructor Picks",
  },
  {
    id: "wordle-hard-1",
    type: "wordle",
    difficulty: "hard",
    solution: "CRYPT",
    wordLength: 5,
    maxGuesses: 6,
    source: "AI Generated",
  },

  // 4. Sudoku
  {
    id: "sudoku-easy-1",
    type: "sudoku",
    difficulty: "easy",
    initialState: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
    source: "Community",
  },
  {
    id: "sudoku-medium-1",
    type: "sudoku",
    difficulty: "medium",
    initialState: [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0],
    ],
    solution: [
      [1, 2, 3, 6, 7, 8, 9, 4, 5],
      [5, 8, 4, 2, 3, 9, 7, 6, 1],
      [9, 6, 7, 1, 4, 5, 3, 2, 8],
      [3, 7, 1, 9, 8, 4, 5, 2, 6],
      [6, 9, 2, 5, 1, 3, 8, 7, 4],
      [4, 5, 8, 7, 6, 2, 9, 1, 3],
      [8, 3, 6, 4, 2, 1, 7, 5, 9],
      [7, 1, 9, 8, 5, 2, 4, 3, 6],
      [2, 4, 5, 3, 9, 6, 1, 8, 7],
    ],
    source: "AI Generated",
  },
  {
    id: "sudoku-hard-1",
    type: "sudoku",
    difficulty: "hard",
    initialState: [
      [8, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 6, 0, 0, 0, 0, 0],
      [0, 7, 0, 0, 9, 0, 2, 0, 0],
      [0, 5, 0, 0, 0, 7, 0, 0, 0],
      [0, 0, 0, 0, 4, 5, 7, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 3, 0],
      [0, 0, 1, 0, 0, 0, 0, 6, 8],
      [0, 0, 8, 5, 0, 0, 0, 1, 0],
      [0, 9, 0, 0, 0, 0, 4, 0, 0],
    ],
    solution: [
      [8, 1, 2, 7, 5, 3, 6, 4, 9],
      [9, 4, 3, 6, 8, 2, 1, 7, 5],
      [6, 7, 5, 4, 9, 1, 2, 8, 3],
      [1, 5, 4, 2, 3, 7, 8, 9, 6],
      [3, 6, 9, 8, 4, 5, 7, 2, 1],
      [2, 8, 7, 1, 6, 9, 5, 3, 4],
      [5, 2, 1, 9, 7, 4, 3, 6, 8],
      [4, 3, 8, 5, 2, 6, 9, 1, 7],
      [7, 9, 6, 3, 1, 8, 4, 5, 2],
    ],
    source: "Puzzle Master",
  },

  // 5. Memory Sequence
  {
    id: "memory-sequence-easy-1",
    type: "memory",
    difficulty: "easy",
    grid: { rows: 1, cols: 6 },
    pairs: 6,
    emojiPool: [],
    timeLimitMs: 180000,
    moveLimit: 0,
    deckSeed: "memory-sequence-easy-1",
    source: "Sequence Mode",
    nextPuzzleId: "memory-sequence-medium-1",
  },
  {
    id: "memory-sequence-medium-1",
    type: "memory",
    difficulty: "medium",
    grid: { rows: 1, cols: 8 },
    pairs: 8,
    emojiPool: [],
    timeLimitMs: 240000,
    moveLimit: 0,
    deckSeed: "memory-sequence-medium-1",
    source: "Sequence Mode",
    nextPuzzleId: "memory-sequence-hard-1",
  },
  {
    id: "memory-sequence-hard-1",
    type: "memory",
    difficulty: "hard",
    grid: { rows: 1, cols: 10 },
    pairs: 10,
    emojiPool: [],
    timeLimitMs: 300000,
    moveLimit: 0,
    deckSeed: "memory-sequence-hard-1",
    source: "Sequence Mode",
  },
];

export const getPuzzleById = (id: string): Puzzle | undefined => {
  return puzzles.find((p) => p.id === id);
};
