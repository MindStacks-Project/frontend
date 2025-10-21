"use client";

import type { SudokuPuzzle } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";
import { SudokuBoard } from "./sudoku-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2, Flag } from "lucide-react";
import { GameSummaryDialog } from "./game-summary-dialog";
import { useToast } from "@/hooks/use-toast";
import { Timer } from "./timer";
import { useTimer } from "@/hooks/use-timer";
import type { GenerateHintOutput } from "@/ai/flows/generate-hints";
import type { ValidateSolutionOutput } from "@/ai/flows/validate-solutions";
import { usePuzzleTelemetry } from "@/hooks/use-telemetry";

type Cell = { row: number; col: number };

export function SudokuGame({ puzzle }: { puzzle: SudokuPuzzle }) {
  const [board, setBoard] = useState(puzzle.initialState);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [isGameWon, setIsGameWon] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const { time, startTimer, stopTimer } = useTimer();
  const { toast } = useToast();
  const telemetryOptions = useMemo(
    () => ({
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      difficulty: puzzle.difficulty,
      source: puzzle.source,
      puzzleMeta: {
        initialState: puzzle.initialState,
        solution: puzzle.solution,
      },
      attemptContext: {
        gridSize: 9,
        givenCells: puzzle.initialState.flat().filter((value) => value !== 0)
          .length,
      },
    }),
    [puzzle]
  );
  const {
    attemptId,
    logEvent,
    finalizeAttempt,
    downloadTelemetry,
    downloadUrl,
  } = usePuzzleTelemetry(telemetryOptions);

  useEffect(() => {
    startTimer();
    logEvent("timer_started");
    return () => {
      stopTimer();
      logEvent("timer_stopped");
    };
  }, [logEvent, startTimer, stopTimer]);

  const handleCellChange = (row: number, col: number, value: number) => {
    if (puzzle.initialState[row][col] !== 0) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);
    const isCorrect = value !== 0 && puzzle.solution[row][col] === value;
    logEvent("cell_input", {
      row,
      col,
      value,
      isCorrect,
      elapsedSeconds: time,
    });

    if (value !== 0 && puzzle.solution[row][col] !== value) {
      setMistakes((m) => m + 1);
      logEvent("mistake_recorded", {
        row,
        col,
        value,
        elapsedSeconds: time,
      });
      toast({
        title: "Incorrect Value",
        description: "That number doesn't seem right. Try again!",
        variant: "destructive",
      });
    }
  };

  const handleGetHint = async () => {
    setIsRequestingHint(true);
    logEvent("hint_requested", {
      elapsedSeconds: time,
      hintsUsed,
    });
    if (!attemptId) {
      logEvent("hint_error", { message: "missing_attempt_id" });
      toast({
        title: "Error",
        description: "Unable to request a hint right now. Please try again.",
        variant: "destructive",
      });
      setIsRequestingHint(false);
      return;
    }
    try {
      const response = await fetch("/api/genkit/flow/generateHintFlow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            puzzleType: "Sudoku",
            difficulty: puzzle.difficulty,
            currentState: JSON.stringify(board),
            attemptId,
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to get hint");

      const payload = await response.json();
      const result: GenerateHintOutput = payload.result ?? payload;
      const nextHints = hintsUsed + 1;
      setHintsUsed(nextHints);
      logEvent("hint_received", {
        hint: result.hint,
        elapsedSeconds: time,
        totalHints: nextHints,
      });
      toast({
        title: "Here's a hint!",
        description: result.hint,
      });
    } catch (error) {
      console.error(error);
      logEvent("hint_error", {
        message: error instanceof Error ? error.message : "unknown_error",
      });
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
    logEvent("submission_attempted", {
      elapsedSeconds: time,
      boardState: board,
    });
    try {
      const response = await fetch("/api/genkit/flow/validateSolutionFlow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            puzzleType: "Sudoku",
            userSolution: JSON.stringify(board),
            puzzleState: JSON.stringify(puzzle.initialState),
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to validate solution");

      const payload = await response.json();
      const result: ValidateSolutionOutput = payload.result ?? payload;
      logEvent("submission_result", {
        isValid: result.isValid,
        explanation: result.explanation,
      });
      setIsGameWon(result.isValid);
      finalizeAttempt({
        outcome: result.isValid ? "completed" : "failed",
        metrics: {
          durationSeconds: time,
          mistakes,
          hintsUsed,
          finalBoard: board,
          validationExplanation: result.explanation,
        },
      });
    } catch (error) {
      console.error(error);
      logEvent("submission_error", {
        message: error instanceof Error ? error.message : "unknown_error",
      });
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
        extraActions={
          downloadUrl ? (
            <Button
              type="button"
              variant="outline"
              onClick={downloadTelemetry}
              className="w-full"
            >
              Download Attempt Data
            </Button>
          ) : null
        }
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
              solution={puzzle.solution}
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
