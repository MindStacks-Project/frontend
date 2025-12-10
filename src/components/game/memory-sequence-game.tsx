"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameSummaryDialog } from "./game-summary-dialog";
import { Timer } from "./timer";
import { useTimer } from "@/hooks/use-timer";
import { usePuzzleTelemetry } from "@/hooks/use-telemetry";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_LENGTHS: Record<Difficulty, number> = {
  easy: 6,
  medium: 8,
  hard: 10,
};

type Direction = "up" | "down" | "left" | "right";
const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

const directionIcon = (dir: Direction) => {
  switch (dir) {
    case "up":
      return <ArrowUp />;
    case "down":
      return <ArrowDown />;
    case "left":
      return <ArrowLeft />;
    case "right":
      return <ArrowRight />;
  }
};

export function MemorySequenceGame({
  difficulty = "easy",
  puzzleId,
}: {
  difficulty?: Difficulty;
  puzzleId?: string;
}) {
  const length = DIFFICULTY_LENGTHS[difficulty];
  const [sequence, setSequence] = useState<Direction[]>(() =>
    generateSequence(length)
  );
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameResult, setGameResult] = useState<"completed" | "failed" | null>(null);

  const { time, startTimer, stopTimer, resetTimer } = useTimer();

  const attemptId = puzzleId ?? `memory-seq-${difficulty}-${Date.now()}`;

  const { logEvent, finalizeAttempt, resetAttempt } = usePuzzleTelemetry({
    puzzleId: attemptId,
    puzzleType: "memory-sequence" as any,
    difficulty,
    source: "Local",
    puzzleMeta: { length },
  });

  const finishedRef = useRef(false);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // start attempt when component mounts
    startRound(false);
    return () => {
      cleanupPlayback();
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupPlayback = useCallback(() => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
  }, []);

  function generateSequence(n: number) {
    const out: Direction[] = [];
    for (let i = 0; i < n; i++) {
      out.push(DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]);
    }
    return out;
  }

  const playSequence = useCallback((autoStartAfter = 0) => {
    cleanupPlayback();
    setIsPlayingBack(true);
    setHighlightIndex(null);
    logEvent("sequence_playback_started", { length: sequence.length });
    let idx = 0;
    const step = () => {
      if (finishedRef.current) return;
      if (idx >= sequence.length) {
        setIsPlayingBack(false);
        setHighlightIndex(null);
        logEvent("sequence_playback_finished");
        return;
      }
      setHighlightIndex(idx);
      logEvent("sequence_step_shown", { index: idx, direction: sequence[idx] });
      playbackTimeoutRef.current = setTimeout(() => {
        setHighlightIndex(null);
        playbackTimeoutRef.current = setTimeout(() => {
          idx += 1;
          step();
        }, 250);
      }, 600);
    };
    playbackTimeoutRef.current = setTimeout(step, autoStartAfter);
  }, [cleanupPlayback, logEvent, sequence]);

  const startRound = useCallback((isRestart = true) => {
    cleanupPlayback();
    finishedRef.current = false;
    setPlayerIndex(0);
    setMistakes(0);
    setHintsUsed(0);
    setGameResult(null);
    setSequence(generateSequence(length));
    resetTimer();
    startTimer();
    if (isRestart) resetAttempt();
    logEvent("round_initialized", { length, difficulty });
    // small timeout so UI updates before playback
    playSequence(300);
  }, [cleanupPlayback, difficulty, length, playSequence, resetAttempt, resetTimer, startTimer, logEvent]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (isPlayingBack || finishedRef.current) return;
    const map: Record<string, Direction | undefined> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    logEvent("key_pressed", { key: e.key, expected: sequence[playerIndex] });
    if (dir === sequence[playerIndex]) {
      const next = playerIndex + 1;
      setPlayerIndex(next);
      if (next === sequence.length) {
        // success
        finishedRef.current = true;
        stopTimer();
        setGameResult("completed");
        logEvent("sequence_completed", { durationSeconds: time });
        finalizeAttempt({ outcome: "completed", metrics: { durationSeconds: time, mistakes, hintsUsed } });
      }
    } else {
      // incorrect -> restart sequence input from beginning
      setMistakes((m) => m + 1);
      logEvent("sequence_incorrect", { pressed: dir, expected: sequence[playerIndex], mistakes: mistakes + 1 });
      setPlayerIndex(0);
      // replay sequence after short pause
      playSequence(500);
    }
  }, [isPlayingBack, playerIndex, sequence, playSequence, logEvent, stopTimer, time, finalizeAttempt, mistakes, hintsUsed]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const useHint = useCallback(() => {
    if (finishedRef.current) return;
    setHintsUsed((h) => h + 1);
    logEvent("hint_used", { hintsUsed: hintsUsed + 1 });
    playSequence(200);
  }, [hintsUsed, logEvent, playSequence]);

  const buildMetrics = useCallback(() => ({
    durationSeconds: time,
    mistakes,
    hintsUsed,
    length: sequence.length,
  }), [time, mistakes, hintsUsed, sequence.length]);

  const failure = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopTimer();
    setGameResult("failed");
    logEvent("sequence_failed", { mistakes, hintsUsed, durationSeconds: time });
    finalizeAttempt({ outcome: "failed", metrics: buildMetrics() });
  }, [buildMetrics, finalizeAttempt, hintsUsed, logEvent, mistakes, stopTimer, time]);

  const arrowClass = (dir: Direction, idx: number) =>
    cn(
      "flex items-center justify-center h-20 w-20 rounded-md border",
      highlightIndex === idx ? "bg-primary text-white" : "bg-muted"
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <GameSummaryDialog
        open={Boolean(gameResult)}
        isSuccess={gameResult === "completed"}
        time={time}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
        successDescription={`Completed sequence of ${sequence.length} arrows.`}
        failureDescription={"You failed the round. Try again!"}
        extraActions={
          <div className="flex w-full flex-col gap-2">
            <Button onClick={() => startRound(true)}>Play Again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Back to Play</Button>
          </div>
        }
      />

      <Card className="lg:row-span-2">
        <CardHeader>
          <CardTitle className="capitalize">Memory Sequence ({difficulty})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Watch the sequence, then repeat using your arrow keys.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 justify-center items-center">
            <div />
            <div className={cn("flex items-center justify-center")}>{/* up */}
              <div className={arrowClass("up", 0)}>{directionIcon("up")}</div>
            </div>
            <div />

            <div className={cn("flex items-center justify-center")}>{/* left */}
              <div className={arrowClass("left", 1)}>{directionIcon("left")}</div>
            </div>
            <div className="flex items-center justify-center">{/* center */}
              <div className="text-center">{playerIndex}/{sequence.length}</div>
            </div>
            <div className={cn("flex items-center justify-center")}>{/* right */}
              <div className={arrowClass("right", 2)}>{directionIcon("right")}</div>
            </div>

            <div />
            <div className={cn("flex items-center justify-center")}>{/* down */}
              <div className={arrowClass("down", 3)}>{directionIcon("down")}</div>
            </div>
            <div />
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
          <div className="flex items-center justify-between text-lg">
            <span>Mistakes</span>
            <span className="font-semibold">{mistakes}</span>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span>Hints</span>
            <span className="font-semibold">{hintsUsed}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => playSequence(0)} disabled={isPlayingBack}>Replay Sequence</Button>
            <Button variant="outline" onClick={useHint}>Hint (Show Again)</Button>
            <Button variant="ghost" onClick={() => startRound(true)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Restart
            </Button>
            <Button variant="destructive" onClick={failure}>Give Up</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
