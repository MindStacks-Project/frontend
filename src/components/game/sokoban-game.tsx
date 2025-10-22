"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SokobanPuzzle } from "@/lib/types";
import { SokobanBoard, type SokobanGrid, type Position } from "./sokoban-board";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Lightbulb,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { GameSummaryDialog } from "./game-summary-dialog";
import { Timer } from "./timer";
import { useTimer } from "@/hooks/use-timer";
import { useToast } from "@/hooks/use-toast";
import { usePuzzleTelemetry } from "@/hooks/use-telemetry";

type CellType = "wall" | "floor" | "goal";

type Direction = {
  row: number;
  col: number;
};

type ParsedSokoban = {
  grid: SokobanGrid;
  goals: ReadonlySet<string>;
  boxesInitial: string[];
  playerInitial: Position;
};

const coordinateKey = (row: number, col: number) => `${row},${col}`;

const DIRECTIONS: Record<string, Direction> = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
  w: { row: -1, col: 0 },
  s: { row: 1, col: 0 },
  a: { row: 0, col: -1 },
  d: { row: 0, col: 1 },
};

const parseLayout = (layout: string[]): ParsedSokoban => {
  const height = layout.length;
  const width = Math.max(...layout.map((row) => row.length));
  const grid: CellType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "wall" as CellType)
  );
  const goals = new Set<string>();
  const boxesInitial: string[] = [];
  let playerInitial: Position | null = null;

  layout.forEach((row, rowIndex) => {
    for (let colIndex = 0; colIndex < width; colIndex += 1) {
      const rawChar = row[colIndex] ?? " ";
      const key = coordinateKey(rowIndex, colIndex);

      switch (rawChar) {
        case "#":
          grid[rowIndex][colIndex] = "wall";
          break;
        case ".":
          grid[rowIndex][colIndex] = "goal";
          goals.add(key);
          break;
        case "*":
          grid[rowIndex][colIndex] = "goal";
          goals.add(key);
          boxesInitial.push(key);
          break;
        case "$":
          grid[rowIndex][colIndex] = "floor";
          boxesInitial.push(key);
          break;
        case "@":
          grid[rowIndex][colIndex] = "floor";
          playerInitial = { row: rowIndex, col: colIndex };
          break;
        case "+":
          grid[rowIndex][colIndex] = "goal";
          goals.add(key);
          playerInitial = { row: rowIndex, col: colIndex };
          break;
        default:
          grid[rowIndex][colIndex] = "floor";
      }
    }
  });

  if (!playerInitial) {
    throw new Error("Sokoban puzzle is missing a starting player position.");
  }

  return {
    grid,
    goals,
    boxesInitial,
    playerInitial,
  };
};

const getBoxesOnGoalsCount = (
  boxes: Iterable<string>,
  goals: ReadonlySet<string>
) => {
  let count = 0;
  for (const key of boxes) {
    if (goals.has(key)) {
      count += 1;
    }
  }
  return count;
};

export function SokobanGame({ puzzle }: { puzzle: SokobanPuzzle }) {
  const parsed = useMemo(() => parseLayout(puzzle.layout), [puzzle]);
  const { grid, goals, boxesInitial, playerInitial } = parsed;
  const initialBoxesKey = useMemo(
    () => boxesInitial.join("|"),
    [boxesInitial]
  );

  const [player, setPlayer] = useState<Position>(playerInitial);
  const [boxes, setBoxes] = useState<Set<string>>(
    () => new Set(boxesInitial)
  );
  const [moves, setMoves] = useState(0);
  const [pushes, setPushes] = useState(0);
  const [blockedMoves, setBlockedMoves] = useState(0);
  const [isGameWon, setIsGameWon] = useState<boolean | null>(null);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [lastHint, setLastHint] = useState<string | null>(null);

  const { time, startTimer, stopTimer, resetTimer } = useTimer();
  const { toast } = useToast();
  const totalBoxes = boxesInitial.length;
  const totalGoals = goals.size;
  const warehouseStats = useMemo(
    () => ({
      width: grid[0]?.length ?? 0,
      height: grid.length,
      totalBoxes,
      totalGoals,
    }),
    [grid, totalBoxes, totalGoals]
  );
  const telemetryOptions = useMemo(
    () => ({
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      difficulty: puzzle.difficulty,
      source: puzzle.source,
      puzzleMeta: {
        layout: puzzle.layout,
      },
      attemptContext: warehouseStats,
    }),
    [puzzle, warehouseStats]
  );
  const {
    attemptId,
    logEvent,
    finalizeAttempt,
    resetAttempt,
    downloadTelemetry,
    downloadUrl,
  } = usePuzzleTelemetry(telemetryOptions);

  // Reset when the puzzle changes.
  useEffect(() => {
    resetAttempt();
    setPlayer(playerInitial);
    setBoxes(new Set(boxesInitial));
    setMoves(0);
    setPushes(0);
    setBlockedMoves(0);
    setIsGameWon(null);
    setHintsUsed(0);
    setLastHint(null);
    resetTimer();
    startTimer();
    logEvent("level_initialized", {
      playerStart: playerInitial,
      boxes: boxesInitial,
      goals: Array.from(goals),
    });
  }, [
    boxesInitial,
    goals,
    initialBoxesKey,
    logEvent,
    playerInitial,
    resetAttempt,
    resetTimer,
    startTimer,
  ]);

  // Start timer on mount and clean up on unmount.
  useEffect(() => {
    startTimer();
    logEvent("timer_started");
    return () => {
      stopTimer();
      logEvent("timer_stopped");
    };
  }, [logEvent, startTimer, stopTimer]);

  const attemptMove = useCallback(
    (direction: Direction) => {
      if (isGameWon) return;
      logEvent("move_attempted", {
        direction,
        playerPosition: player,
        elapsedSeconds: time,
      });

      const targetRow = player.row + direction.row;
      const targetCol = player.col + direction.col;
      const targetCell = grid[targetRow]?.[targetCol];

      if (!targetCell || targetCell === "wall") {
        const reason = !targetCell ? "out_of_bounds" : "wall";
        const nextBlocked = blockedMoves + 1;
        setBlockedMoves(nextBlocked);
        logEvent("move_blocked", {
          direction,
          reason,
          newBlockedCount: nextBlocked,
          elapsedSeconds: time,
        });
        return;
      }

      const targetKey = coordinateKey(targetRow, targetCol);
      const hasBox = boxes.has(targetKey);
      let updatedBoxes: Set<string> | null = null;
      let pushPerformed = false;
      let pushedFrom: Position | null = null;
      let pushedTo: Position | null = null;
      let nextPushes = pushes;

      if (hasBox) {
        const beyondRow = targetRow + direction.row;
        const beyondCol = targetCol + direction.col;
        const beyondCell = grid[beyondRow]?.[beyondCol];
        const beyondKey = coordinateKey(beyondRow, beyondCol);

        if (!beyondCell || beyondCell === "wall" || boxes.has(beyondKey)) {
          const reason = !beyondCell
            ? "out_of_bounds"
            : beyondCell === "wall"
            ? "wall"
            : "box_blocked";
          const nextBlocked = blockedMoves + 1;
          setBlockedMoves(nextBlocked);
          logEvent("move_blocked", {
            direction,
            reason,
            newBlockedCount: nextBlocked,
            elapsedSeconds: time,
          });
          return;
        }

        updatedBoxes = new Set(boxes);
        updatedBoxes.delete(targetKey);
        updatedBoxes.add(beyondKey);
        setBoxes(updatedBoxes);
        pushPerformed = true;
        pushedFrom = { row: targetRow, col: targetCol };
        pushedTo = { row: beyondRow, col: beyondCol };
        nextPushes = pushes + 1;
        setPushes(nextPushes);
      }

      setPlayer({ row: targetRow, col: targetCol });
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      const boxesToCheck = updatedBoxes ?? boxes;
      const allBoxesStored = Array.from(boxesToCheck).every((key) =>
        goals.has(key)
      );
      logEvent("move_performed", {
        direction,
        pushed: pushPerformed,
        playerPosition: { row: targetRow, col: targetCol },
        pushedFrom,
        pushedTo,
        moves: nextMoves,
        pushes: nextPushes,
        elapsedSeconds: time,
      });

      if (allBoxesStored) {
        setIsGameWon(true);
        stopTimer();
        logEvent("level_completed", {
          moves: nextMoves,
          pushes: nextPushes,
          blockedMoves,
          hintsUsed,
          durationSeconds: time,
        });
        finalizeAttempt({
          outcome: "completed",
          metrics: {
            durationSeconds: time,
            moves: nextMoves,
            pushes: nextPushes,
            blockedMoves,
            hintsUsed,
            finalPlayerPosition: { row: targetRow, col: targetCol },
            finalBoxes: Array.from(boxesToCheck),
          },
        });
        toast({
          title: "Warehouse cleared!",
          description: `Delivered in ${nextMoves} moves.`,
        });
      }
    },
    [
      blockedMoves,
      boxes,
      finalizeAttempt,
      goals,
      grid,
      hintsUsed,
      isGameWon,
      logEvent,
      moves,
      player,
      pushes,
      stopTimer,
      time,
      toast,
    ]
  );

  const handleKeyboard = useCallback(
    (event: KeyboardEvent) => {
      if (isGameWon) return;
      const direction = DIRECTIONS[event.key];
      if (direction) {
        event.preventDefault();
        attemptMove(direction);
      }
    },
    [attemptMove, isGameWon]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  const handleHintRequest = async () => {
    setIsRequestingHint(true);
    logEvent("hint_requested", {
      elapsedSeconds: time,
      moves,
      pushes,
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
            puzzleType: "Sokoban",
            difficulty: puzzle.difficulty,
            currentState: JSON.stringify({
              player,
              boxes: Array.from(boxes),
              moves,
              pushes,
            }),
            attemptId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve hint");
      }

      const payload = await response.json();
      const result = payload.result ?? payload;
      if (typeof result?.hint === "string") {
        const nextHints = hintsUsed + 1;
        setHintsUsed(nextHints);
        setLastHint(result.hint);
        logEvent("hint_received", {
          hint: result.hint,
          totalHints: nextHints,
          elapsedSeconds: time,
        });
        toast({
          title: "Hint unlocked",
          description: result.hint,
        });
      } else {
        throw new Error("Hint came back in an unexpected format");
      }
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

  const handleReset = () => {
    resetAttempt();
    setPlayer(playerInitial);
    setBoxes(new Set(boxesInitial));
    setMoves(0);
    setPushes(0);
    setBlockedMoves(0);
    setIsGameWon(null);
    setHintsUsed(0);
    setLastHint(null);
    resetTimer();
    startTimer();
    logEvent("level_reset", {
      reason: "manual_reset",
      playerStart: playerInitial,
      boxes: boxesInitial,
    });
  };

  const boxesOnGoals = getBoxesOnGoalsCount(boxes, goals);
  const boxesRemaining = Math.max(goals.size - boxesOnGoals, 0);

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <GameSummaryDialog
        open={isGameWon === true}
        isSuccess={isGameWon === true}
        time={time}
        mistakes={blockedMoves}
        hintsUsed={hintsUsed}
        successDescription={`All crates delivered in ${moves} moves with ${pushes} pushes!`}
        failureDescription="Boxes are still waiting for their slots. Keep going!"
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

      <Card className="md:col-span-1">
        <CardHeader className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="capitalize">
              {puzzle.difficulty} Sokoban
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Use arrow keys or on-screen controls to push crates onto the neon
              pads.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            title="Reset level"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <SokobanBoard
            grid={grid}
            goals={goals}
            boxes={boxes}
            player={player}
          />

          <div className="grid grid-cols-3 gap-2">
            <span />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => attemptMove(DIRECTIONS.ArrowUp)}
              disabled={isGameWon === true}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => attemptMove(DIRECTIONS.ArrowLeft)}
              disabled={isGameWon === true}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => attemptMove(DIRECTIONS.ArrowDown)}
              disabled={isGameWon === true}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => attemptMove(DIRECTIONS.ArrowRight)}
              disabled={isGameWon === true}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              onClick={handleHintRequest}
              disabled={isRequestingHint || isGameWon === true}
            >
              {isRequestingHint ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Get Hint
            </Button>
            {lastHint && (
              <div className="rounded-md border border-dashed border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                {lastHint}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
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
              <span>Moves:</span>
              <span className="font-semibold">{moves}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Pushes:</span>
              <span className="font-semibold">{pushes}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Boxes remaining:</span>
              <span className="font-semibold">{boxesRemaining}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Blocked moves:</span>
              <span className="font-semibold">{blockedMoves}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Hints:</span>
              <span className="font-semibold">{hintsUsed}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
