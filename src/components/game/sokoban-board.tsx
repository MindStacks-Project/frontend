"use client";

import { cn } from "@/lib/utils";

type CellType = "wall" | "floor" | "goal";

export type SokobanGrid = CellType[][];

export type Position = {
  row: number;
  col: number;
};

export interface SokobanBoardProps {
  grid: SokobanGrid;
  goals: ReadonlySet<string>;
  boxes: ReadonlySet<string>;
  player: Position;
}

const getCellClass = (type: CellType, isGoal: boolean) => {
  switch (type) {
    case "wall":
      return "bg-slate-900 border-slate-700";
    case "goal":
      return "bg-purple-800/40 border-purple-500/60";
    default:
      return isGoal
        ? "bg-purple-800/25 border-purple-500/40"
        : "bg-slate-800 border-slate-700/60";
  }
};

const coordinateKey = (row: number, col: number) => `${row},${col}`;

export function SokobanBoard({
  grid,
  goals,
  boxes,
  player,
}: SokobanBoardProps) {
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="grid gap-1 rounded-md border border-border bg-slate-950/70 p-2 shadow-inner"
      style={{ gridTemplateColumns: `repeat(${cols}, 2.75rem)` }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = coordinateKey(rowIndex, colIndex);
          const isGoalCell = goals.has(key);
          const hasBox = boxes.has(key);
          const isPlayer =
            player.row === rowIndex && player.col === colIndex;

          return (
            <div
              key={key}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-sm border text-lg font-bold",
                "transition-colors duration-150 ease-out",
                getCellClass(cell, isGoalCell)
              )}
            >
              {isGoalCell && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.9rem] text-purple-300/70">
                  ✹
                </span>
              )}
              {hasBox && (
                <span className="pointer-events-none text-amber-300 drop-shadow-sm">
                  {isGoalCell ? "★" : "▣"}
                </span>
              )}
              {isPlayer && (
                <span className="pointer-events-none text-cyan-200 drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]">
                  ☺
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
