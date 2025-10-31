import test from "node:test";
import assert from "node:assert/strict";
import Module from "module";

// Simple test that validates GoogleButton can be imported
test("GoogleButton exists and exports default", async () => {
  const requiredEnv = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  ] as const;

  const previousEnv = new Map<string, string | undefined>();
  for (const key of requiredEnv) {
    previousEnv.set(key, process.env[key]);
    process.env[key] = process.env[key] ?? `test-${key.toLowerCase()}`;
  }

  const modulePrototype = (Module as unknown as {
    prototype: {
      require: (...args: unknown[]) => unknown;
    };
  }).prototype;
  const previousRequire = modulePrototype.require as (
    ...args: unknown[]
  ) => unknown;

  modulePrototype.require = function patchedRequire(
    this: unknown,
    ...requestArgs: unknown[]
  ) {
    const [id, ...rest] = requestArgs as [string, ...unknown[]];
    if (id === "firebase/app") {
      return {
        initializeApp: () => ({}),
        getApps: () => [],
        getApp: () => ({}),
      };
    }
    if (id === "firebase/auth") {
      return {
        getAuth: () => ({}),
        GoogleAuthProvider: function GoogleAuthProvider() {},
        signInWithPopup: async () => ({
          user: { getIdToken: async () => "token" },
        }),
        setPersistence: async () => {},
        browserLocalPersistence: {},
      };
    }
    if (id === "firebase/firestore") {
      return { getFirestore: () => ({}) };
    }
    return previousRequire.apply(this, [id, ...rest]);
  } as (...args: unknown[]) => unknown;

  try {
    const module = await import("../GoogleButton");
    assert.ok(module.default, "GoogleButton should export a default function");
    assert.equal(
      typeof module.default,
      "function",
      "GoogleButton should be a function"
    );
  } finally {
    modulePrototype.require = previousRequire;
    for (const key of requiredEnv) {
      const previous = previousEnv.get(key);
      if (previous === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous;
      }
    }
  }
});
