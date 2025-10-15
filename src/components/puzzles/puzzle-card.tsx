import type { Puzzle } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Puzzle as PuzzleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PuzzleCardProps {
  puzzle: Puzzle;
}

export function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const difficultyColors = {
    easy: "bg-green-500 hover:bg-green-600",
    medium: "bg-yellow-500 hover:bg-yellow-600",
    hard: "bg-red-500 hover:bg-red-600",
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{puzzle.type}</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "capitalize border-0 text-white",
              difficultyColors[puzzle.difficulty]
            )}
          >
            {puzzle.difficulty}
          </Badge>
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
