import assert from "node:assert/strict";
import test from "node:test";

import { leaderboardData } from "@/app/(main)/leaderboard/page";

test("leaderboard entries include games played and points", () => {
  assert.ok(leaderboardData.length > 0, "no leaderboard entries found");

  for (const entry of leaderboardData) {
    assert.ok(entry.rank > 0, "rank should be positive");
    assert.ok(entry.gamesPlayed >= 0, "games played should be non-negative");
    assert.ok(entry.points >= 0, "points should be non-negative");
    assert.ok(entry.nickname.length > 0, "nickname should be defined");
  }
});

test("leaderboard is ordered correctly", () => {
  for (let i = 1; i < leaderboardData.length; i += 1) {
    const prev = leaderboardData[i - 1];
    const current = leaderboardData[i];

    assert.ok(prev.rank < current.rank, "ranks should be ascending");
    assert.ok(
      prev.points >= current.points,
      "points should not increase for lower ranks"
    );
  }
});
