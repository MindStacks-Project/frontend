export type User = {
  id: string;
  nickname?: string;
  email: string;
};

export type PuzzleDifficulty = "easy" | "medium" | "hard";
export type PuzzleType = "sudoku" | "wordle" | "sokoban" | "crossword" | "trivia";

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

type UnsupportedPuzzle = BasePuzzle & {
  type: Exclude<PuzzleType, "sudoku" | "wordle" | "sokoban">;
};

export type Puzzle = SudokuPuzzle | WordlePuzzle | SokobanPuzzle | UnsupportedPuzzle;

export const isSudokuPuzzle = (puzzle: Puzzle): puzzle is SudokuPuzzle =>
  puzzle.type === "sudoku";

export const isWordlePuzzle = (puzzle: Puzzle): puzzle is WordlePuzzle =>
  puzzle.type === "wordle";

export const isSokobanPuzzle = (puzzle: Puzzle): puzzle is SokobanPuzzle =>
  puzzle.type === "sokoban";

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
