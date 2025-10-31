import test from "node:test";
import assert from "node:assert/strict";

import { hasActiveUser, type AuthSession } from "../session";

test("hasActiveUser only passes once a logged-in user reaches the dashboard", () => {
  const base: AuthSession = { user: null, loading: true, route: "/dashboard" };

  assert.equal(
    hasActiveUser(base),
    false,
    "expected loading sessions to be treated as inactive"
  );

  const wrongRoute: AuthSession = { ...base, loading: false, route: "/puzzles" };
  assert.equal(
    hasActiveUser(wrongRoute),
    false,
    "expected off-dashboard sessions to remain inactive"
  );

  const noUser: AuthSession = { ...base, loading: false, user: null };
  assert.equal(
    hasActiveUser(noUser),
    false,
    "expected sessions without a user to be inactive"
  );

  const active: AuthSession = {
    route: "/dashboard",
    loading: false,
    user: { id: "user-001", email: "player@example.com" },
  };
  assert.equal(
    hasActiveUser(active),
    true,
    "expected logged-in dashboard visitors to be marked active"
  );
});
