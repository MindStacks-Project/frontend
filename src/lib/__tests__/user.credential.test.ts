import test from "node:test";
import assert from "node:assert/strict";

import { isEmailValid, validateUserCredential } from "../validation";

test("isEmailValid returns false when email is missing '@'", () => {
  const invalid = "missing-at-symbol";
  assert.equal(
    isEmailValid(invalid),
    false,
    `expected '${invalid}' to be invalid (no @)`
  );
});

test("isEmailValid accepts a basic valid email", () => {
  const valid = "m@example.com";
  assert.equal(isEmailValid(valid), true, `expected '${valid}' to be valid`);
});

test("validateUserCredential throws when email is invalid", () => {
  const bad = { email: "no-at-here" };
  assert.throws(() => validateUserCredential(bad), {
    message: /Invalid email/
  });
});

test("validateUserCredential accepts a credential with valid email", () => {
  const ok = { email: "user@domain.com" };
  assert.equal(validateUserCredential(ok), true);
});
