"use client";

import type { PuzzleDifficulty, PuzzleType } from "@/lib/types";

export type TelemetryOutcome = "completed" | "failed" | "abandoned";

export interface TelemetryMetadata {
  puzzleId: string;
  puzzleType: PuzzleType;
  difficulty: PuzzleDifficulty;
  source: string;
  puzzleMeta?: Record<string, unknown>;
}

export interface TelemetryEvent {
  id: string;
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface TelemetryAttempt {
  id: string;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  metadata: TelemetryMetadata;
  events: TelemetryEvent[];
  outcome?: TelemetryOutcome;
  metrics?: Record<string, unknown>;
}

type AttemptStore = Map<string, TelemetryAttempt>;

const attempts: AttemptStore = new Map();

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ms_${Math.random().toString(36).slice(2, 11)}`;
};

export const startTelemetryAttempt = (
  metadata: TelemetryMetadata
): TelemetryAttempt => {
  const attempt: TelemetryAttempt = {
    id: generateId(),
    startedAt: Date.now(),
    metadata,
    events: [],
  };

  attempts.set(attempt.id, attempt);
  return attempt;
};

export const appendTelemetryEvent = (
  attemptId: string,
  type: string,
  data?: Record<string, unknown>
): TelemetryEvent | null => {
  const attempt = attempts.get(attemptId);
  if (!attempt || attempt.completedAt) return null;

  const event: TelemetryEvent = {
    id: generateId(),
    type,
    timestamp: Date.now(),
    data,
  };

  attempt.events.push(event);
  return event;
};

const cloneAttempt = (attempt: TelemetryAttempt): TelemetryAttempt => ({
  ...attempt,
  metadata: {
    ...attempt.metadata,
    puzzleMeta: attempt.metadata.puzzleMeta
      ? { ...attempt.metadata.puzzleMeta }
      : undefined,
  },
  events: attempt.events.map((event) => ({
    ...event,
    data: event.data ? { ...event.data } : undefined,
  })),
  metrics: attempt.metrics ? { ...attempt.metrics } : undefined,
});

export const finalizeTelemetryAttempt = (
  attemptId: string,
  outcome: TelemetryOutcome,
  metrics?: Record<string, unknown>
): TelemetryAttempt | null => {
  const attempt = attempts.get(attemptId);
  if (!attempt) return null;
  if (attempt.completedAt) {
    return cloneAttempt(attempt);
  }

  attempt.completedAt = Date.now();
  attempt.durationMs = attempt.completedAt - attempt.startedAt;
  attempt.outcome = outcome;
  attempt.metrics = metrics;

  const snapshot = cloneAttempt(attempt);
  attempts.delete(attemptId);
  return snapshot;
};

export const abandonTelemetryAttempt = (
  attemptId: string,
  reason: string
) => {
  const attempt = attempts.get(attemptId);
  if (!attempt || attempt.completedAt) return null;
  return finalizeTelemetryAttempt(attemptId, "abandoned", { reason });
};
