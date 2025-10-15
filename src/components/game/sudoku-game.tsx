"use client";

import type { Puzzle } from "@/lib/types";
import { useState, useEffect } from "react";
import { SudokuBoard } from "./sudoku-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Check, Loader2, Play, Flag } from "lucide-react";
import { GameSummaryDialog } from "./game-summary-dialog";
import { useToast } from "@/hooks/use-toast";
import { Timer } from "./timer";
import { useTimer } from "@/hooks/use-timer";
import type { GenerateHintOutput } from "@/ai/flows/generate-hints";
import type { ValidateSolutionOutput } from "@/ai/flows/validate-solutions";

type Cell = { row: number; col: number };

export function SudokuGame({ puzzle }: { puzzle: Puzzle }) {
  const [board, setBoard] = useState(puzzle.initialState);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [isGameWon, setIsGameWon] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const { time, isRunning, startTimer, stopTimer } = useTimer();
  const { toast } = useToast();

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const handleCellChange = (row: number, col: number, value: number) => {
    if (puzzle.initialState[row][col] !== 0) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);

    if (value !== 0 && puzzle.solution[row][col] !== value) {
      setMistakes((m) => m + 1);
      toast({
        title: "Incorrect Value",
        description: "That number doesn't seem right. Try again!",
        variant: "destructive",
      });
    }
  };

  const handleGetHint = async () => {
    setIsRequestingHint(true);
    try {
      const response = await fetch("/api/genkit/flow/generateHintFlow", {
        method: "POST",
        body: JSON.stringify({
          puzzleType: "Sudoku",
          difficulty: puzzle.difficulty,
          currentState: JSON.stringify(board),
          attemptId: "mock-attempt-id", // Replace with real attempt ID
        }),
      });
      if (!response.ok) throw new Error("Failed to get hint");

      const result: GenerateHintOutput = await response.json();
      setHintsUsed((h) => h + 1);
      toast({
        title: "Here's a hint!",
        description: result.hint,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not fetch a hint.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingHint(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    stopTimer();
    try {
      const response = await fetch("/api/genkit/flow/validateSolutionFlow", {
        method: "POST",
        body: JSON.stringify({
          puzzleType: "Sudoku",
          userSolution: JSON.stringify(board),
          puzzleState: JSON.stringify(puzzle.initialState),
        }),
      });
      if (!response.ok) throw new Error("Failed to validate solution");

      const result: ValidateSolutionOutput = await response.json();
      setIsGameWon(result.isValid);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not validate your solution.",
        variant: "destructive",
      });
      startTimer(); // Resume timer if validation fails
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <GameSummaryDialog
        open={isGameWon !== null}
        isSuccess={isGameWon === true}
        time={time}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
      />
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              {puzzle.difficulty} Sudoku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SudokuBoard
              board={board}
              initialBoard={puzzle.initialState}
              selectedCell={selectedCell}
              onCellSelect={setSelectedCell}
              onCellValueChange={handleCellChange}
            />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span>Time:</span>
              <Timer time={time} />
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Mistakes:</span>
              <span className="font-semibold">{mistakes}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Hints:</span>
              <span className="font-semibold">{hintsUsed}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            onClick={handleGetHint}
            disabled={isRequestingHint || isGameWon !== null}
          >
            {isRequestingHint ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Get Hint
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || isGameWon !== null}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Flag className="mr-2 h-4 w-4" />
            )}
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
