import { Fragment } from "react";
import { puzzles } from "@/lib/puzzles";
import { PuzzleCard } from "@/components/puzzles/puzzle-card";
import type { Puzzle } from "@/lib/types";
import { isSokobanPuzzle, isSudokuPuzzle, isWordlePuzzle } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export default function PuzzlesPage() {
  const sudokuPuzzles = puzzles.filter(isSudokuPuzzle);
  const wordlePuzzles = puzzles.filter(isWordlePuzzle);
  const sokobanPuzzles = puzzles.filter(isSokobanPuzzle);
  const otherPuzzles = puzzles.filter(
    (puzzle) =>
      !isSudokuPuzzle(puzzle) &&
      !isWordlePuzzle(puzzle) &&
      !isSokobanPuzzle(puzzle)
  );

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
            <PuzzleCard key={puzzle.id} puzzle={puzzle} />
          ))}
        </div>
      </Fragment>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Puzzles</h1>
        <p className="text-muted-foreground">
          Choose a puzzle to test your skills.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {renderPuzzleSection("Sokoban", sokobanPuzzles)}
        {renderPuzzleSection("Wordle", wordlePuzzles)}
        {renderPuzzleSection("Sudoku", sudokuPuzzles)}
        {renderPuzzleSection("More Puzzles", otherPuzzles)}
      </div>
    </div>
  );
}
