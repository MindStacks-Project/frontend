import type { Puzzle } from "@/lib/types";
import { isMemoryPuzzle, isMemorySequencePuzzle } from "@/lib/types";
import { difficultyInfo } from "@/lib/difficulty-info";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Puzzle as PuzzleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PuzzleCardProps {
  puzzle: Puzzle;
}

const getPuzzleTitle = (puzzle: Puzzle): string => {
  if (isMemorySequencePuzzle(puzzle)) return "Memory Sequence";
  if (isMemoryPuzzle(puzzle)) return "Memory Match";

  return puzzle.type.charAt(0).toUpperCase() + puzzle.type.slice(1);
};

export function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const difficultyColors = {
    easy: "bg-green-500 hover:bg-green-600",
    medium: "bg-yellow-500 hover:bg-yellow-600",
    hard: "bg-red-500 hover:bg-red-600",
  };

  const puzzleTitle = getPuzzleTitle(puzzle);
  const difficultyMeta = difficultyInfo[puzzle.difficulty];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{puzzleTitle}</CardTitle>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize border-0 text-white",
                    difficultyColors[puzzle.difficulty]
                  )}
                >
                  {puzzle.difficulty}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 max-w-[220px]">
                  <p className="font-semibold leading-none">
                    {difficultyMeta.label} difficulty
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {difficultyMeta.summary}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <PuzzleIcon className="w-24 h-24 text-muted" />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/play/${puzzle.id}`}>Play</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
