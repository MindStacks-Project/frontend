"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Cell = { row: number; col: number };
interface SudokuBoardProps {
  board: number[][];
  initialBoard: number[][];
  selectedCell: Cell | null;
  onCellSelect: (cell: Cell | null) => void;
  onCellValueChange: (row: number, col: number, value: number) => void;
}

export function SudokuBoard({
  board,
  initialBoard,
  selectedCell,
  onCellSelect,
  onCellValueChange,
}: SudokuBoardProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    const value = e.target.value;
    if (/^[1-9]$/.test(value)) {
      onCellValueChange(row, col, parseInt(value, 10));
    } else if (value === "") {
      onCellValueChange(row, col, 0);
    }
  };

  const isRelated = (row: number, col: number) => {
    if (!selectedCell) return false;
    const { row: selRow, col: selCol } = selectedCell;
    if (row === selRow || col === selCol) return true;
    if (
      Math.floor(row / 3) === Math.floor(selRow / 3) &&
      Math.floor(col / 3) === Math.floor(selCol / 3)
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="aspect-square w-full grid grid-cols-9 grid-rows-9 gap-px bg-border border-2 border-border overflow-hidden rounded-none">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isInitial = initialBoard[rowIndex][colIndex] !== 0;
          const isSelected =
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isRelatedCell = isRelated(rowIndex, colIndex);
          const hasSameValue =
            selectedCell &&
            board[selectedCell.row][selectedCell.col] !== 0 &&
            board[selectedCell.row][selectedCell.col] === cell;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "relative flex items-center justify-center bg-card",
                (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 ===
                  1 && "bg-secondary/50",
                isSelected && "bg-primary/20",
                isRelatedCell && !isSelected && "bg-primary/10",
                hasSameValue && !isSelected && "bg-accent/40",
                "border-r border-b border-border/50",
                (colIndex + 1) % 3 === 0 &&
                  colIndex !== 8 &&
                  "border-r-2 border-r-border",
                (rowIndex + 1) % 3 === 0 &&
                  rowIndex !== 8 &&
                  "border-b-2 border-b-border"
              )}
            >
              <Input
                type="text"
                maxLength={1}
                value={cell === 0 ? "" : cell}
                readOnly={isInitial}
                onFocus={() => onCellSelect({ row: rowIndex, col: colIndex })}
                onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                aria-label={`Cell R${rowIndex + 1}C${colIndex + 1}`}
                className={cn(
                  "w-full h-full text-center text-lg md:text-2xl font-bold p-0 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  isInitial ? "text-foreground" : "text-primary",
                  !isInitial &&
                    cell !== 0 &&
                    puzzle.solution[rowIndex][colIndex] !== cell &&
                    "text-destructive"
                )}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

// Dummy puzzle object to satisfy TS compiler in the style expression
const puzzle = {
  solution: Array(9).fill(Array(9).fill(0)),
};
