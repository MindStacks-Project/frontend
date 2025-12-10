"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { getPuzzleById } from "@/lib/puzzles";
import { SudokuGame } from "@/components/game/sudoku-game";
import { WordleGame } from "@/components/game/wordle-game";
import { SokobanGame } from "@/components/game/sokoban-game";
import { MemoryGame } from "@/components/game/memory-game";
import { MemorySequenceGame } from "@/components/game/memory-sequence-game";
import {
  isMemoryPuzzle,
  isMemorySequencePuzzle,
  isSokobanPuzzle,
  isSudokuPuzzle,
  isWordlePuzzle,
} from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useMemo } from "react";
import { recordRecentlyPlayed } from "@/lib/recently-played";

type PlayPageProps = {
  params: {
    puzzleId: string;
  };
};

export default function PlayPage({ params }: PlayPageProps) {
  const puzzle = getPuzzleById(params.puzzleId);
  const { user } = useAuth();

  const puzzleTitle = useMemo(() => {
    if (!puzzle) return null;
    if (isMemorySequencePuzzle(puzzle)) return "Memory Sequence";
    if (isMemoryPuzzle(puzzle)) return "Memory Match";
    return `${puzzle.type.charAt(0).toUpperCase()}${puzzle.type.slice(1)}`;
  }, [puzzle]);

  useEffect(() => {
    if (!puzzle || !user?.uid) return;
    recordRecentlyPlayed(user.uid, puzzle, puzzleTitle ?? undefined).catch(
      (error) => {
        console.error("Failed to record recently played puzzle", error);
      }
    );
  }, [puzzle, puzzleTitle, user]);

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Puzzle not found</h1>
        <p className="text-muted-foreground mb-4">
          The puzzle you are looking for does not exist.
        </p>
        <Button asChild>
          <Link href="/puzzles">Back to Puzzles</Link>
        </Button>
      </div>
    );
  }

  if (isSudokuPuzzle(puzzle)) {
    return <SudokuGame puzzle={puzzle} />;
  }

  if (isWordlePuzzle(puzzle)) {
    return <WordleGame puzzle={puzzle} />;
  }

  if (isSokobanPuzzle(puzzle)) {
    return <SokobanGame puzzle={puzzle} />;
  }

  if (isMemorySequencePuzzle(puzzle)) {
    return (
      <MemorySequenceGame difficulty={puzzle.difficulty} puzzleId={puzzle.id} />
    );
  }

  if (isMemoryPuzzle(puzzle)) {
    return <MemoryGame puzzle={puzzle} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-yellow-500" />
      <h1 className="text-2xl font-bold">Puzzle Type Not Supported Yet</h1>
      <p className="mb-4 text-muted-foreground">
        This puzzle type is not yet implemented in the game.
      </p>
      <Button asChild>
        <Link href="/puzzles">Back to Puzzles</Link>
      </Button>
    </div>
  );
}
