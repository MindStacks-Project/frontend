import type { PuzzleDifficulty } from "@/lib/types";

type DifficultyMeta = {
  label: string;
  summary: string;
  bestFor: string;
};

export const difficultyInfo: Record<PuzzleDifficulty, DifficultyMeta> = {
  easy: {
    label: "Easy",
    summary: "Relaxed pacing with forgiving grids and timers so you can warm up.",
    bestFor: "New players and quick confidence boosts.",
  },
  medium: {
    label: "Medium",
    summary: "Balanced challenge that still leaves room to think and experiment.",
    bestFor: "Most players looking for a solid flow state.",
  },
  hard: {
    label: "Hard",
    summary: "Tighter limits and denser layouts that reward careful planning.",
    bestFor: "Veterans chasing mastery or leaderboard times.",
  },
};

export const recommendedDifficulty: PuzzleDifficulty = "medium";
