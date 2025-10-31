import test from "node:test";
import assert from "node:assert/strict";
import { formatTime } from "../utils";

test("shows 0 seconds as 00:00", () => {
  assert.equal(formatTime(0), "00:00");
});

test("formats under 1 minute correctly", () => {
  assert.equal(formatTime(5), "00:05");
});

test("formats minutes and seconds correctly", () => {
  assert.equal(formatTime(125), "02:05");
});

test("formats exactly 1 minute correctly", () => {
  assert.equal(formatTime(60), "01:00");
});
