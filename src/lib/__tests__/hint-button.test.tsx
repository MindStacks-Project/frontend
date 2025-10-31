import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import Module from "module";

import type { WordlePuzzle } from "../types";

const setupDom = () => {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id='root'></div></body></html>",
    { url: "http://localhost" }
  );

  const previousGlobals = new Map<string, unknown>();
  const assignGlobal = (key: string, value: unknown) => {
    previousGlobals.set(key, (globalThis as Record<string, unknown>)[key]);
    Object.defineProperty(globalThis as Record<string, unknown>, key, {
      configurable: true,
      writable: true,
      value,
    });
  };

  assignGlobal("window", dom.window);
  assignGlobal("document", dom.window.document);
  assignGlobal("navigator", dom.window.navigator);
  assignGlobal("HTMLElement", dom.window.HTMLElement);
  assignGlobal("HTMLInputElement", dom.window.HTMLInputElement);
  assignGlobal("Event", dom.window.Event);
  assignGlobal("MouseEvent", dom.window.MouseEvent);
  assignGlobal("Blob", dom.window.Blob);
  assignGlobal("React", React);

  if (!dom.window.URL.createObjectURL) {
    dom.window.URL.createObjectURL = () => "blob:test";
  }
  if (!dom.window.URL.revokeObjectURL) {
    dom.window.URL.revokeObjectURL = () => {};
  }
  assignGlobal("URL", dom.window.URL);

  return {
    window: dom.window,
    cleanup: () => {
      previousGlobals.forEach((value, key) => {
        if (value === undefined) {
          delete (globalThis as Record<string, unknown>)[key];
        } else {
          Object.defineProperty(globalThis as Record<string, unknown>, key, {
            configurable: true,
            writable: true,
            value,
          });
        }
      });
      dom.window.close();
    },
  };
};

const installNextNavigationMock = () => {
  const modulePrototype = (
    Module as unknown as {
      prototype: {
        require: (...args: unknown[]) => unknown;
      };
    }
  ).prototype;
  const originalRequire = modulePrototype.require as (
    ...args: unknown[]
  ) => unknown;

  modulePrototype.require = function patchedRequire(
    this: unknown,
    ...requestArgs: unknown[]
  ) {
    const [id, ...rest] = requestArgs as [string, ...unknown[]];
    if (id === "next/navigation") {
      return {
        useRouter: () => ({ push: () => {} }),
      };
    }
    return originalRequire.apply(this, [id, ...rest]);
  } as (...args: unknown[]) => unknown;

  return () => {
    modulePrototype.require = originalRequire;
  };
};

test("clicking Get Hint triggers the hint workflow and shows the returned hint", async () => {
  const { window, cleanup } = setupDom();

  const hintText = "Try focusing on vowels.";
  let fetchCalledWith: RequestInit | null = null;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_input, init) => {
    fetchCalledWith = init ?? null;
    return {
      ok: true,
      json: async () => ({ result: { hint: hintText } }),
    } as Response;
  }) as typeof fetch;

  const puzzle: WordlePuzzle = {
    id: "wordle-fixture",
    type: "wordle",
    difficulty: "easy",
    solution: "APPLE",
    wordLength: 5,
    maxGuesses: 6,
    source: "unit-test",
  };

  const container = window.document.getElementById("root");
  assert.ok(container, "expected container element to be present");

  const restoreNavigationMock = installNextNavigationMock();
  const { WordleGame } = await import("../../components/game/wordle-game");
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(<WordleGame puzzle={puzzle} />);
    });

    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button")
    );
    const hintButton = buttons.find((button) =>
      button.textContent?.includes("Get Hint")
    );
    assert.ok(hintButton, "expected the Get Hint button to render");
    const targetButton = hintButton;

    await act(async () => {
      targetButton.dispatchEvent(
        new window.MouseEvent("click", { bubbles: true, cancelable: true })
      );
      await Promise.resolve();
    });

    assert.ok(fetchCalledWith, "expected fetch to be invoked when requesting a hint");
    const init = fetchCalledWith as RequestInit;
    const body = init.body as string | undefined;
    assert.ok(body, "expected hint request to include a JSON payload");
    const payload = JSON.parse(body);
    assert.equal(
      payload.data.puzzleType,
      "Wordle",
      "expected hint request to target the Wordle flow"
    );
    assert.ok(
      payload.data.attemptId,
      "expected hint request to include the current attempt id"
    );

    const hintDisplay = Array.from(
      container.querySelectorAll<HTMLElement>("div")
    ).find((node) => node.textContent?.includes(hintText));
    assert.ok(
      hintDisplay,
      "expected the returned hint text to appear after clicking the button"
    );
  } finally {
    await act(async () => {
      root.unmount();
    });
    restoreNavigationMock();
    cleanup();
    globalThis.fetch = originalFetch;
  }
});
