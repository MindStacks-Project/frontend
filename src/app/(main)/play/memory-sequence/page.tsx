"use client";

import { useState } from "react";
import { MemorySequenceGame } from "@/components/game/memory-sequence-game";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Memory Sequence</h1>
        <p className="text-sm text-muted-foreground">Repeat the shown arrow sequence using your keyboard arrow keys.</p>
        <div className="flex gap-2">
          <Button variant={difficulty === "easy" ? "default" : "ghost"} onClick={() => setDifficulty("easy")}>Easy (6)</Button>
          <Button variant={difficulty === "medium" ? "default" : "ghost"} onClick={() => setDifficulty("medium")}>Medium (8)</Button>
          <Button variant={difficulty === "hard" ? "default" : "ghost"} onClick={() => setDifficulty("hard")}>Hard (10)</Button>
        </div>
        <div>
          <Button onClick={() => setStarted(true)}>Start</Button>
        </div>
      </div>
    );
  }

  return <MemorySequenceGame difficulty={difficulty} puzzleId={`memory-seq-${difficulty}`} />;
}
