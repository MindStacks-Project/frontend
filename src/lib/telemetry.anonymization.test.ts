import test from "node:test";
import assert from "node:assert/strict";

import {
  appendTelemetryEvent,
  finalizeTelemetryAttempt,
  startTelemetryAttempt,
} from "../../../frontend/src/lib/telemetry.ts";

const metadata = {
  puzzleId: "sudoku-easy-fixture",
  puzzleType: "sudoku" as const,
  difficulty: "easy" as const,
  source: "unit-test",
  puzzleMeta: {
    variant: "classic",
    seed: "fixture-seed-001",
  },
};

const sensitiveKeys = new Set(["userId", "email", "nickname", "displayName"]);
const sensitivePatterns = [/user/i, /email/i, /@/];

const collectKeys = (value: unknown, keys = new Set<string>()) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectKeys(item, keys);
    }
    return keys;
  }

  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>
    )) {
      keys.add(key);
      collectKeys(nested, keys);
    }
  }
  return keys;
};

test("telemetry snapshots omit user identifying data", () => {
  const attempt = startTelemetryAttempt(metadata);
  appendTelemetryEvent(attempt.id, "attempt_started", {
    boardHash: "start-0001",
    difficulty: metadata.difficulty,
  });
  appendTelemetryEvent(attempt.id, "move", { row: 0, col: 1, value: 5 });

  const snapshot = finalizeTelemetryAttempt(attempt.id, "completed", {
    totalMoves: 1,
  });

  assert.ok(snapshot, "expected a telemetry snapshot after finalization");

  const snapshotKeys = Array.from(collectKeys(snapshot));
  for (const key of sensitiveKeys) {
    assert(
      !snapshotKeys.includes(key),
      `expected snapshot to omit sensitive key "${key}"`
    );
  }

  const serialized = JSON.stringify(snapshot);
  for (const pattern of sensitivePatterns) {
    assert(
      !pattern.test(serialized),
      `expected serialized snapshot to exclude pattern ${pattern}`
    );
  }

  assert.match(
    snapshot.id,
    /^(?:ms_[a-z0-9]{9}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
    "expected telemetry id to be pseudonymous"
  );

  const lateEvent = appendTelemetryEvent(snapshot.id, "should_not_record");
  assert.equal(
    lateEvent,
    null,
    "expected telemetry store to drop attempts after finalization"
  );
});
