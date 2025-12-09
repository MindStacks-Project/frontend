"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemoryPuzzle, PuzzleDifficulty } from "@/lib/types";
import { isMemoryPuzzle } from "@/lib/types";
import { puzzles } from "@/lib/puzzles";
import { buildMemoryDeck, type MemoryCardBlueprint } from "@/lib/memory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameSummaryDialog } from "./game-summary-dialog";
import { Timer } from "./timer";
import { useTimer } from "@/hooks/use-timer";
import { usePuzzleTelemetry } from "@/hooks/use-telemetry";
import { cn, formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, SkipForward } from "lucide-react";

const difficultyOrder: PuzzleDifficulty[] = ["easy", "medium", "hard"];

const FLIP_BACK_DELAY_MS = 900;

type MemoryCardState = MemoryCardBlueprint & {
  index: number;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameResult = {
  outcome: "completed" | "failed";
  reason?: "time_limit" | "move_limit";
};

const createDeckState = (puzzle: MemoryPuzzle): MemoryCardState[] => {
  const seed = puzzle.deckSeed ?? puzzle.id;
  const blueprint = buildMemoryDeck(puzzle.emojiPool, seed);
  return blueprint.map((card, index) => ({
    ...card,
    index,
    isFlipped: false,
    isMatched: false,
  }));
};

const findNextDifficultyPuzzle = (
  currentDifficulty: PuzzleDifficulty
): MemoryPuzzle | null => {
  const currentIndex = difficultyOrder.indexOf(currentDifficulty);
  if (currentIndex === -1) return null;
  const nextDifficulty = difficultyOrder[currentIndex + 1];
  if (!nextDifficulty) return null;
  const nextPuzzle = puzzles.find(
    (puzzle) => isMemoryPuzzle(puzzle) && puzzle.difficulty === nextDifficulty
  );
  return (nextPuzzle as MemoryPuzzle | undefined) ?? null;
};

const formatDifficultyLabel = (difficulty: PuzzleDifficulty) =>
  `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`;

const average = (values: number[]) => {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
};

const MemoryCard = ({
  card,
  onFlip,
  disabled,
}: {
  card: MemoryCardState;
  onFlip: (index: number) => void;
  disabled: boolean;
}) => {
  const showFace = card.isFlipped || card.isMatched;
  return (
    <button
      type="button"
      aria-label={showFace ? `Emoji ${card.emoji}` : "Hidden card"}
      onClick={() => onFlip(card.index)}
      disabled={disabled || card.isMatched || card.isFlipped}
      className={cn(
        "relative aspect-square rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        showFace
          ? "bg-background border-primary text-5xl"
          : "bg-gradient-to-br from-slate-900 to-slate-700 text-transparent border-transparent shadow-lg",
        disabled ? "cursor-not-allowed opacity-75" : "hover:-translate-y-0.5"
      )}
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center text-3xl sm:text-4xl transition-opacity duration-200",
          showFace ? "opacity-100" : "opacity-0"
        )}
      >
        {card.emoji}
      </span>
    </button>
  );
};

export function MemoryGame({ puzzle }: { puzzle: MemoryPuzzle }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deck, setDeck] = useState<MemoryCardState[]>(() => createDeckState(puzzle));
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [mismatches, setMismatches] = useState(0);
  const [consecutiveMatches, setConsecutiveMatches] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [restartCount, setRestartCount] = useState(0);
  const [flipDurations, setFlipDurations] = useState<number[]>([]);
  const [lastFlipAt, setLastFlipAt] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const finishedRef = useRef(false);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { time, startTimer, stopTimer, resetTimer } = useTimer();

  const telemetryOptions = useMemo(
    () => ({
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      difficulty: puzzle.difficulty,
      source: puzzle.source,
      puzzleMeta: {
        grid: puzzle.grid,
        pairs: puzzle.pairs,
        emojiPool: puzzle.emojiPool,
        timeLimitMs: puzzle.timeLimitMs,
        moveLimit: puzzle.moveLimit,
        deckSeed: puzzle.deckSeed,
      },
      attemptContext: {
        gridArea: puzzle.grid.rows * puzzle.grid.cols,
        pairs: puzzle.pairs,
        moveLimit: puzzle.moveLimit,
        timeLimitMs: puzzle.timeLimitMs,
      },
    }),
    [puzzle]
  );

  const {
    logEvent,
    finalizeAttempt,
    resetAttempt,
    downloadTelemetry,
    downloadUrl,
  } = usePuzzleTelemetry(telemetryOptions);

  const remainingTimeMs = useMemo(() => {
    if (!puzzle.timeLimitMs) return null;
    const remaining = puzzle.timeLimitMs - time * 1000;
    return Math.max(0, remaining);
  }, [puzzle.timeLimitMs, time]);

  const moveLimitRemaining = useMemo(() => {
    if (!puzzle.moveLimit) return null;
    return Math.max(0, puzzle.moveLimit - moves);
  }, [moves, puzzle.moveLimit]);

  const averageFlipIntervalMs = useMemo(
    () => average(flipDurations),
    [flipDurations]
  );

  const nextPuzzle = useMemo(
    () => findNextDifficultyPuzzle(puzzle.difficulty),
    [puzzle.difficulty]
  );
  const nextPuzzleLabel = nextPuzzle
    ? `${formatDifficultyLabel(nextPuzzle.difficulty)} Memory`
    : null;

  const cleanupTimeout = useCallback(() => {
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
  }, []);

  const buildMetrics = useCallback(
    (extra?: Record<string, unknown>) => ({
      durationSeconds: time,
      moves,
      mismatches,
      pairsMatched: matches,
      pairsAvailable: puzzle.pairs,
      consecutiveMatches,
      bestStreak,
      averageFlipIntervalMs,
      restartCount,
      remainingTimeMs: remainingTimeMs ?? undefined,
      timeLimitMs: puzzle.timeLimitMs,
      moveLimit: puzzle.moveLimit,
      moveLimitRemaining: moveLimitRemaining ?? undefined,
      boardSeed: puzzle.deckSeed,
      ...extra,
    }),
    [
      averageFlipIntervalMs,
      consecutiveMatches,
      matches,
      mismatches,
      moveLimitRemaining,
      moves,
      puzzle.deckSeed,
      puzzle.moveLimit,
      puzzle.pairs,
      puzzle.timeLimitMs,
      remainingTimeMs,
      restartCount,
      time,
    ]
  );

  const concludeGame = useCallback(
    (outcome: "completed" | "failed", reason?: GameResult["reason"]) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setGameResult({ outcome, reason });
      stopTimer();
      logEvent(
        outcome === "completed" ? "memory Game Completed" : "memory Game Failed",
        {
          outcome,
          reason,
          moves,
          mismatches,
          matches,
          elapsedSeconds: time,
        }
      );
      finalizeAttempt({ outcome, metrics: buildMetrics({ reason }) });
      if (outcome === "completed") {
        toast({
          title: "All pairs matched!",
          description: `Solved in ${moves} moves and ${formatTime(time)}.`,
        });
      } else {
        const reasonCopy = reason === "time_limit" ? "Time limit reached" : "Move limit reached";
        toast({
          title: "Round over",
          description: reasonCopy,
          variant: "destructive",
        });
      }
    },
    [
      buildMetrics,
      finalizeAttempt,
      logEvent,
      mismatches,
      moves,
      stopTimer,
      time,
      toast,
    ]
  );

  const initializeGame = useCallback(
    (shouldIncrementRestart = false) => {
      cleanupTimeout();
      finishedRef.current = false;
      setDeck(createDeckState(puzzle));
      setFlippedIndices([]);
      setMoves(0);
      setMatches(0);
      setMismatches(0);
      setConsecutiveMatches(0);
      setBestStreak(0);
      setFlipDurations([]);
      setLastFlipAt(null);
      setIsResolving(false);
      setGameResult(null);
      if (shouldIncrementRestart) {
        setRestartCount((count) => {
          const next = count + 1;
          logEvent("memory_game_restarted", { restartCount: next });
          return next;
        });
      }
      resetTimer();
      startTimer();
      if (shouldIncrementRestart) {
        resetAttempt();
      }
      logEvent("timer_started");
      logEvent("memory_game_initialized", {
        grid: puzzle.grid,
        pairs: puzzle.pairs,
        moveLimit: puzzle.moveLimit,
        timeLimitMs: puzzle.timeLimitMs,
      });
    },
    [
      cleanupTimeout,
      logEvent,
      puzzle,
      resetAttempt,
      resetTimer,
      startTimer,
    ]
  );

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    return () => {
      cleanupTimeout();
      stopTimer();
      logEvent("timer_stopped");
    };
  }, [cleanupTimeout, logEvent, stopTimer]);

  useEffect(() => {
    if (!puzzle.timeLimitMs || finishedRef.current) return;
    if (remainingTimeMs === 0) {
      concludeGame("failed", "time_limit");
    }
  }, [concludeGame, puzzle.timeLimitMs, remainingTimeMs]);

  useEffect(() => {
    if (!puzzle.moveLimit || finishedRef.current) return;
    if (moves >= puzzle.moveLimit) {
      concludeGame("failed", "move_limit");
    }
  }, [concludeGame, moves, puzzle.moveLimit]);

  const scheduleFlipBack = useCallback(
    (firstIndex: number, secondIndex: number) => {
      setIsResolving(true);
      cleanupTimeout();
      flipTimeoutRef.current = setTimeout(() => {
        setDeck((current) =>
          current.map((card, idx) =>
            idx === firstIndex || idx === secondIndex
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setFlippedIndices([]);
        setIsResolving(false);
        flipTimeoutRef.current = null;
      }, FLIP_BACK_DELAY_MS);
    },
    [cleanupTimeout]
  );

  const handleCardFlip = useCallback(
    (index: number) => {
      if (isResolving || finishedRef.current) return;
      const card = deck[index];
      if (!card || card.isMatched || card.isFlipped) return;

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (lastFlipAt !== null) {
        setFlipDurations((prev) => [...prev, now - lastFlipAt]);
      }
      setLastFlipAt(now);

      const nextDeck = deck.map((item, idx) =>
        idx === index ? { ...item, isFlipped: true } : item
      );
      setDeck(nextDeck);
      const nextFlipped = [...flippedIndices, index];
      setFlippedIndices(nextFlipped);

      logEvent("card_flipped", {
        cardId: card.id,
        pairKey: card.pairKey,
        flipIndex: nextFlipped.length,
        elapsedSeconds: time,
      });

      if (nextFlipped.length < 2) {
        return;
      }

      const [firstIndex, secondIndex] = nextFlipped;
      const firstCard = nextDeck[firstIndex];
      const secondCard = nextDeck[secondIndex];
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      const isMatch = firstCard.pairKey === secondCard.pairKey;
      if (isMatch) {
        const updatedDeck = nextDeck.map((item, idx) =>
          idx === firstIndex || idx === secondIndex
            ? { ...item, isMatched: true }
            : item
        );
        setDeck(updatedDeck);
        setFlippedIndices([]);
        setIsResolving(false);
        const nextMatches = matches + 1;
        setMatches(nextMatches);
        setConsecutiveMatches((prev) => {
          const streak = prev + 1;
          setBestStreak((best) => Math.max(best, streak));
          return streak;
        });
        logEvent("pair_matched", {
          pairKey: firstCard.pairKey,
          moves: nextMoves,
          matches: nextMatches,
          elapsedSeconds: time,
        });
        if (nextMatches === puzzle.pairs) {
          concludeGame("completed");
        }
      } else {
        setMismatches((prev) => prev + 1);
        setConsecutiveMatches(0);
        logEvent("pair_mismatched", {
          firstCard: firstCard.id,
          secondCard: secondCard.id,
          moves: nextMoves,
          mismatches: mismatches + 1,
          elapsedSeconds: time,
        });
        scheduleFlipBack(firstIndex, secondIndex);
      }
    },
    [
      concludeGame,
      deck,
      flippedIndices,
      isResolving,
      lastFlipAt,
      logEvent,
      matches,
      mismatches,
      moves,
      puzzle.pairs,
      scheduleFlipBack,
      time,
    ]
  );

  const successDescription = `Matched all ${puzzle.pairs} pairs in ${moves} moves.`;
  const failureDescription = gameResult?.reason === "time_limit"
    ? "Time expired before all pairs were matched."
    : gameResult?.reason === "move_limit"
    ? "Move limit reached. Try a more deliberate approach."
    : "Round ended early.";

  const extraActions = (
    <div className="flex w-full flex-col gap-2">
      {downloadUrl && (
        <Button variant="outline" onClick={downloadTelemetry}>
          Download Attempt Data
        </Button>
      )}
      <Button onClick={() => initializeGame(true)} className="w-full">
        Play Again
      </Button>
      <Button
        variant="secondary"
        disabled={!nextPuzzle}
        onClick={() => nextPuzzle && router.push(`/play/${nextPuzzle.id}`)}
        className="w-full"
      >
        {nextPuzzleLabel ? `Next: ${nextPuzzleLabel}` : "Next Difficulty"}
      </Button>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <GameSummaryDialog
        open={Boolean(gameResult)}
        isSuccess={gameResult?.outcome === "completed"}
        time={time}
        mistakes={mismatches}
        hintsUsed={0}
        successDescription={successDescription}
        failureDescription={failureDescription}
        extraActions={extraActions}
      />

      <Card className="lg:row-span-2">
        <CardHeader>
          <CardTitle className="capitalize">{puzzle.difficulty} Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${puzzle.grid.cols}, minmax(0, 1fr))`,
            }}
          >
            {deck.map((card) => (
              <MemoryCard
                key={card.id}
                card={card}
                onFlip={handleCardFlip}
                disabled={Boolean(gameResult)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Round Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-lg">
            <span>Elapsed</span>
            <Timer time={time} />
          </div>
          {puzzle.timeLimitMs && (
            <div className="flex items-center justify-between text-lg">
              <span>Time Left</span>
              <span className="font-semibold">
                {formatTime(Math.floor((remainingTimeMs ?? 0) / 1000))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg">
            <span>Moves</span>
            <span className="font-semibold">
              {moves}
              {puzzle.moveLimit ? ` / ${puzzle.moveLimit}` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span>Mismatches</span>
            <span className="font-semibold">{mismatches}</span>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span>Best Streak</span>
            <span className="font-semibold">{bestStreak}</span>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span>Avg Flip Pace</span>
            <span className="font-semibold">
              {averageFlipIntervalMs ? `${averageFlipIntervalMs}ms` : "--"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => initializeGame(true)}
          disabled={Boolean(gameResult)}
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Restart Round
        </Button>
        {nextPuzzle && (
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => router.push(`/play/${nextPuzzle.id}`)}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            {nextPuzzleLabel ? `Jump to ${nextPuzzleLabel}` : "Jump to Next Puzzle"}
          </Button>
        )}
      </div>
    </div>
  );
}
