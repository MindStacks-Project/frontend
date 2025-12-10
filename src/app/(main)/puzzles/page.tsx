"use client";

import { Fragment } from "react";
import { puzzles } from "@/lib/puzzles";
import { PuzzleCard } from "@/components/puzzles/puzzle-card";
import type { Puzzle } from "@/lib/types";
import {
  isMemoryPuzzle,
  isMemorySequencePuzzle,
  isSokobanPuzzle,
  isSudokuPuzzle,
  isWordlePuzzle,
} from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { difficultyInfo, recommendedDifficulty } from "@/lib/difficulty-info";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/components/auth/AuthProvider";

export default function PuzzlesPage() {
  const sudokuPuzzles = puzzles.filter(isSudokuPuzzle);
  const wordlePuzzles = puzzles.filter(isWordlePuzzle);
  const sokobanPuzzles = puzzles.filter(isSokobanPuzzle);
  const memorySequencePuzzles = puzzles.filter(isMemorySequencePuzzle);
  const memoryMatchPuzzles = puzzles.filter(
    (puzzle) => isMemoryPuzzle(puzzle) && !isMemorySequencePuzzle(puzzle)
  );
  const otherPuzzles = puzzles.filter(
    (puzzle) =>
      !isSudokuPuzzle(puzzle) &&
      !isWordlePuzzle(puzzle) &&
      !isSokobanPuzzle(puzzle) &&
      !isMemoryPuzzle(puzzle)
  );

  const { ids, pending, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const renderPuzzleSection = (
    title: string,
    sectionPuzzles: Puzzle[]
  ) => {
    if (sectionPuzzles.length === 0) return null;

    return (
      <Fragment key={title}>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <Separator className="bg-border" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sectionPuzzles.map((puzzle) => (
            <PuzzleCard
              key={puzzle.id}
              puzzle={puzzle}
              isFavorite={ids.has(puzzle.id)}
              isPending={pending.has(puzzle.id)}
              onToggleFavorite={() => toggleFavorite(puzzle, title)}
            />
          ))}
        </div>
      </Fragment>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Puzzles</h1>
          <p className="text-muted-foreground">
            Choose a puzzle to test your skills.
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Difficulty guide</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[360px] space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold leading-none">Difficulty guide</p>
              <Badge variant="secondary" className="uppercase tracking-wide">
                Recommended: {difficultyInfo[recommendedDifficulty].label}
              </Badge>
            </div>
            <div className="space-y-3">
              {(["easy", "medium", "hard"] as const).map((level) => {
                const meta = difficultyInfo[level];
                const isRecommended = level === recommendedDifficulty;

                return (
                  <div key={level} className="border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold capitalize">{meta.label}</p>
                      {isRecommended ? (
                        <Badge variant="default">Our pick</Badge>
                      ) : (
                        <Badge variant="outline" className="capitalize">
                          {level}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{meta.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      Best for: {meta.bestFor}
                    </p>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-12">
        {renderPuzzleSection("Memory Match", memoryMatchPuzzles)}
        {renderPuzzleSection("Memory Sequence", memorySequencePuzzles)}
        {renderPuzzleSection("Sokoban", sokobanPuzzles)}
        {renderPuzzleSection("Wordle", wordlePuzzles)}
        {renderPuzzleSection("Sudoku", sudokuPuzzles)}
        {renderPuzzleSection("More Puzzles", otherPuzzles)}
      </div>
      {!user && (
        <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
          Log in to save puzzles to your favorites.
        </div>
      )}
    </div>
  );
}
