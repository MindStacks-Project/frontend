import test from "node:test";
import assert from "node:assert/strict";

// Simple test that validates GoogleButton can be imported
test("GoogleButton exists and exports default", async () => {
  const module = await import("../GoogleButton");
  assert.ok(module.default, "GoogleButton should export a default function");
  assert.equal(typeof module.default, "function", "GoogleButton should be a function");
});
