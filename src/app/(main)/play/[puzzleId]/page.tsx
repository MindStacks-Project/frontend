import { getPuzzleById } from "@/lib/puzzles";
import { SudokuGame } from "@/components/game/sudoku-game";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type PlayPageProps = {
  params: {
    puzzleId: string;
  };
};

export default function PlayPage({ params }: PlayPageProps) {
  const puzzle = getPuzzleById(params.puzzleId);

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

  if (puzzle.type !== "sudoku") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold">Puzzle Type Not Supported Yet</h1>
        <p className="text-muted-foreground mb-4">
          This puzzle type is not yet implemented in the game.
        </p>
        <Button asChild>
          <Link href="/puzzles">Back to Puzzles</Link>
        </Button>
      </div>
    );
  }

  return <SudokuGame puzzle={puzzle} />;
}
