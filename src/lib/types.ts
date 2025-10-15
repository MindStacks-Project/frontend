export type User = {
  id: string;
  nickname?: string;
  email: string;
};

export type Puzzle = {
  id: string;
  type: 'sudoku' | 'wordle' | 'crossword' | 'trivia';
  difficulty: 'easy' | 'medium' | 'hard';
  initialState: number[][];
  solution: number[][];
  source: string;
};

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
  score: number;
  country?: string;
}
