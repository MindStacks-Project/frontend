export type User = {
  id: string;
  nickname?: string;
  email: string;
};

export type PuzzleDifficulty = "easy" | "medium" | "hard";
export type PuzzleType =
  | "sudoku"
  | "wordle"
  | "sokoban"
  | "memory"
  | "crossword"
  | "trivia";

type BasePuzzle = {
  id: string;
  type: PuzzleType;
  difficulty: PuzzleDifficulty;
  source: string;
};

export type SudokuPuzzle = BasePuzzle & {
  type: "sudoku";
  initialState: number[][];
  solution: number[][];
};

export type WordlePuzzle = BasePuzzle & {
  type: "wordle";
  solution: string;
  wordLength: number;
  maxGuesses: number;
  allowedGuesses?: string[];
};

export type SokobanPuzzle = BasePuzzle & {
  type: "sokoban";
  layout: string[];
};

export type MemoryGrid = {
  rows: number;
  cols: number;
};

export type MemoryPuzzle = BasePuzzle & {
  type: "memory";
  grid: MemoryGrid;
  pairs: number;
  emojiPool: string[];
  timeLimitMs?: number;
  moveLimit?: number;
  deckSeed?: string;
};

type UnsupportedPuzzle = BasePuzzle & {
  type: Exclude<PuzzleType, "sudoku" | "wordle" | "sokoban" | "memory">;
};

export type Puzzle =
  | SudokuPuzzle
  | WordlePuzzle
  | SokobanPuzzle
  | MemoryPuzzle
  | UnsupportedPuzzle;

export const isSudokuPuzzle = (puzzle: Puzzle): puzzle is SudokuPuzzle =>
  puzzle.type === "sudoku";

export const isWordlePuzzle = (puzzle: Puzzle): puzzle is WordlePuzzle =>
  puzzle.type === "wordle";

export const isSokobanPuzzle = (puzzle: Puzzle): puzzle is SokobanPuzzle =>
  puzzle.type === "sokoban";

export const isMemoryPuzzle = (puzzle: Puzzle): puzzle is MemoryPuzzle =>
  puzzle.type === "memory";

export type PuzzleAttempt = {
  id: string;
  userId: string;
  puzzleId: string;
  startedAt: string;
  submittedAt?: string;
  usedHints: number;
  mistakes: number;
  durationMs: number;
  score: number;
  outcome: 'completed' | 'abandoned' | 'failed';
}

export type LeaderboardEntry = {
  rank: number;
  nickname: string;
  gamesPlayed: number;
  points: number;
  country?: string;
}
