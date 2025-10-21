"use client";

import { useEffect, useMemo, useState } from "react";
import type { WordlePuzzle } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, Send } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import { Timer } from "@/components/game/timer";
import { GameSummaryDialog } from "@/components/game/game-summary-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { usePuzzleTelemetry } from "@/hooks/use-telemetry";

type LetterStatus = "correct" | "present" | "absent";
type DisplayStatus = LetterStatus | "pending" | "empty";

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const statusPriority: Record<LetterStatus, number> = {
  correct: 3,
  present: 2,
  absent: 1,
};

const evaluateGuess = (guess: string, solution: string): LetterStatus[] => {
  const guessChars = guess.split("");
  const solutionChars = solution.split("");
  const result: LetterStatus[] = Array(guessChars.length).fill("absent");
  const remaining: Record<string, number> = {};

  solutionChars.forEach((char) => {
    remaining[char] = (remaining[char] ?? 0) + 1;
  });

  guessChars.forEach((char, index) => {
    if (solutionChars[index] === char) {
      result[index] = "correct";
      remaining[char] -= 1;
    }
  });

  guessChars.forEach((char, index) => {
    if (result[index] === "correct") return;
    if (remaining[char] && remaining[char] > 0) {
      result[index] = "present";
      remaining[char] -= 1;
    }
  });

  return result;
};

const getDisplayClass = (status: DisplayStatus) => {
  switch (status) {
    case "correct":
      return "bg-emerald-500 text-white border-emerald-500";
    case "present":
      return "bg-amber-500 text-white border-amber-500";
    case "absent":
      return "bg-muted text-muted-foreground border-muted";
    case "pending":
      return "border-primary text-primary";
    default:
      return "border-border text-muted-foreground";
  }
};

const getKeyboardClass = (status: LetterStatus | undefined) => {
  switch (status) {
    case "correct":
      return "bg-emerald-500 text-white";
    case "present":
      return "bg-amber-500 text-white";
    case "absent":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

interface WordleBoardProps {
  guesses: string[];
  evaluations: LetterStatus[][];
  currentGuess: string;
  wordLength: number;
  maxGuesses: number;
  isLocked: boolean;
}

function WordleBoard({
  guesses,
  evaluations,
  currentGuess,
  wordLength,
  maxGuesses,
  isLocked,
}: WordleBoardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
        const guess = guesses[rowIndex] ?? "";
        const isActiveRow = rowIndex === guesses.length && !isLocked;
        const rowValue = isActiveRow ? currentGuess : guess;
        const evaluation = evaluations[rowIndex];

        return (
          <div key={rowIndex} className="flex gap-2">
            {Array.from({ length: wordLength }).map((__, cellIndex) => {
              const letter = rowValue[cellIndex] ?? "";
              let status: DisplayStatus = "empty";
              if (evaluation) {
                status = evaluation[cellIndex];
              } else if (isActiveRow && letter) {
                status = "pending";
              }

              return (
                <div
                  key={`${rowIndex}-${cellIndex}`}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-sm border text-2xl font-bold uppercase transition-colors",
                    getDisplayClass(status)
                  )}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

interface WordleKeyboardProps {
  letterStatuses: Map<string, LetterStatus>;
}

function WordleKeyboard({ letterStatuses }: WordleKeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {KEYBOARD_ROWS.map((row) => (
        <div key={row} className="flex justify-center gap-1">
          {row.split("").map((letter) => {
            const status = letterStatuses.get(letter);
            return (
              <span
                key={letter}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded text-sm font-medium",
                  getKeyboardClass(status)
                )}
              >
                {letter}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function WordleGame({ puzzle }: { puzzle: WordlePuzzle }) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<LetterStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [isGameWon, setIsGameWon] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [lastHint, setLastHint] = useState<string | null>(null);
  const { time, startTimer, stopTimer } = useTimer();
  const { toast } = useToast();
  const telemetryOptions = useMemo(
    () => ({
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      difficulty: puzzle.difficulty,
      source: puzzle.source,
      puzzleMeta: {
        solution: puzzle.solution,
        wordLength: puzzle.wordLength,
        maxGuesses: puzzle.maxGuesses,
      },
      attemptContext: {
        wordLength: puzzle.wordLength,
        maxGuesses: puzzle.maxGuesses,
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

  const targetWord = useMemo(
    () => puzzle.solution.trim().toUpperCase(),
    [puzzle.solution]
  );

  useEffect(() => {
    startTimer();
    logEvent("timer_started");
    return () => {
      stopTimer();
      logEvent("timer_stopped");
    };
  }, [logEvent, startTimer, stopTimer]);

  const letterStatuses = useMemo(() => {
    const statusMap = new Map<string, LetterStatus>();
    evaluations.forEach((row, rowIndex) => {
      row.forEach((status, columnIndex) => {
        const letter = guesses[rowIndex]?.[columnIndex];
        if (!letter) return;
        const existing = statusMap.get(letter);
        if (!existing || statusPriority[status] > statusPriority[existing]) {
          statusMap.set(letter, status);
        }
      });
    });
    return statusMap;
  }, [evaluations, guesses]);

  const handleGuessChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setCurrentGuess(sanitized.slice(0, puzzle.wordLength));
  };

  const handleSubmitGuess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGameWon !== null) return;

    if (currentGuess.length !== puzzle.wordLength) {
      logEvent("guess_rejected", {
        reason: "length_mismatch",
        guess: currentGuess,
        elapsedSeconds: time,
      });
      toast({
        title: "Incomplete guess",
        description: `Enter a ${puzzle.wordLength}-letter word.`,
        variant: "destructive",
      });
      return;
    }

    if (puzzle.allowedGuesses && !puzzle.allowedGuesses.includes(currentGuess)) {
      logEvent("guess_rejected", {
        reason: "not_in_dictionary",
        guess: currentGuess,
        elapsedSeconds: time,
      });
      toast({
        title: "Word not recognized",
        description: "Try another valid guess from the word list.",
        variant: "destructive",
      });
      return;
    }

    logEvent("guess_submitted", {
      guess: currentGuess,
      guessNumber: guesses.length + 1,
      elapsedSeconds: time,
    });

    const evaluation = evaluateGuess(currentGuess, targetWord);
    const nextGuesses = [...guesses, currentGuess];
    const nextEvaluations = [...evaluations, evaluation];
    setGuesses(nextGuesses);
    setEvaluations(nextEvaluations);
    setCurrentGuess("");
    logEvent("guess_evaluated", {
      guess: currentGuess,
      guessNumber: nextGuesses.length,
      evaluation,
      remainingGuesses: puzzle.maxGuesses - nextGuesses.length,
    });

    const isCorrect = currentGuess === targetWord;
    let updatedMistakes = mistakes;
    if (!isCorrect) {
      updatedMistakes = mistakes + 1;
      setMistakes(updatedMistakes);
      logEvent("guess_incorrect", {
        guess: currentGuess,
        guessNumber: nextGuesses.length,
        mistakes: updatedMistakes,
        elapsedSeconds: time,
      });
    }

    if (isCorrect) {
      setIsGameWon(true);
      stopTimer();
      logEvent("game_completed", {
        outcome: "completed",
        totalGuesses: nextGuesses.length,
      });
      finalizeAttempt({
        outcome: "completed",
        metrics: {
          durationSeconds: time,
          totalGuesses: nextGuesses.length,
          hintsUsed,
          mistakes: updatedMistakes,
          guesses: nextGuesses,
          solution: targetWord,
        },
      });
    } else if (nextGuesses.length >= puzzle.maxGuesses) {
      setIsGameWon(false);
      stopTimer();
      logEvent("game_completed", {
        outcome: "failed",
        totalGuesses: nextGuesses.length,
        failureReason: "out_of_guesses",
      });
      finalizeAttempt({
        outcome: "failed",
        metrics: {
          durationSeconds: time,
          totalGuesses: nextGuesses.length,
          hintsUsed,
          mistakes: updatedMistakes,
          guesses: nextGuesses,
          solution: targetWord,
        },
      });
      toast({
        title: "Out of guesses",
        description: `The correct word was ${targetWord}.`,
      });
    }
  };

  const handleGetHint = async () => {
    setIsRequestingHint(true);
    logEvent("hint_requested", {
      elapsedSeconds: time,
      guessesMade: guesses.length,
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
            puzzleType: "Wordle",
            difficulty: puzzle.difficulty,
            currentState: JSON.stringify({
              guesses,
              evaluations,
              remainingGuesses: puzzle.maxGuesses - guesses.length,
            }),
            attemptId,
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to get hint");

      const payload = await response.json();
      const result = payload.result ?? payload;
      const hintText: string | undefined = result?.hint;
      if (typeof hintText === "string") {
        const nextHints = hintsUsed + 1;
        setHintsUsed(nextHints);
        setLastHint(hintText);
        logEvent("hint_received", {
          hint: hintText,
          totalHints: nextHints,
          elapsedSeconds: time,
        });
        toast({
          title: "Hint unlocked",
          description: hintText,
        });
      } else {
        throw new Error("Hint response malformed");
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

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <GameSummaryDialog
        open={isGameWon !== null}
        isSuccess={isGameWon === true}
        time={time}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
        successDescription={`You cracked the code in ${guesses.length} guesses!`}
        failureDescription={`The correct word was "${targetWord}". Give another puzzle a shot!`}
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
              {puzzle.difficulty} Wordle
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <WordleBoard
              guesses={guesses}
              evaluations={evaluations}
              currentGuess={currentGuess}
              wordLength={puzzle.wordLength}
              maxGuesses={puzzle.maxGuesses}
              isLocked={isGameWon !== null}
            />
            <form
              onSubmit={handleSubmitGuess}
              className="flex w-full max-w-md gap-2"
            >
              <Input
                value={currentGuess}
                onChange={(event) => handleGuessChange(event.target.value)}
                maxLength={puzzle.wordLength}
                placeholder={`${puzzle.wordLength}-letter word`}
                disabled={isGameWon !== null}
                aria-label="Enter your guess"
              />
              <Button type="submit" disabled={isGameWon !== null}>
                <Send className="mr-2 h-4 w-4" />
                Guess
              </Button>
            </form>
            <div className="flex w-full max-w-md flex-col gap-2">
              <Button
                variant="outline"
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
              {lastHint && (
                <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-sm text-primary">
                  {lastHint}
                </div>
              )}
            </div>
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
              <span>Incorrect guesses:</span>
              <span className="font-semibold">{mistakes}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Hints:</span>
              <span className="font-semibold">{hintsUsed}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Attempts left:</span>
              <span className="font-semibold">
                {Math.max(puzzle.maxGuesses - guesses.length, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Letter Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Keep an eye on what the puzzle has already told you.
            </p>
            <WordleKeyboard letterStatuses={letterStatuses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
