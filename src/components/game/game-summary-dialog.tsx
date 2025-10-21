"use client";

import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface GameSummaryDialogProps {
  open: boolean;
  isSuccess: boolean;
  time: number;
  mistakes: number;
  hintsUsed: number;
  successDescription?: string;
  failureDescription?: string;
  extraActions?: ReactNode;
}

export function GameSummaryDialog({
  open,
  isSuccess,
  time,
  mistakes,
  hintsUsed,
  successDescription,
  failureDescription,
  extraActions,
}: GameSummaryDialogProps) {
  const router = useRouter();
  const defaultSuccessMessage =
    "Congratulations! You've successfully solved the puzzle.";
  const defaultFailureMessage =
    "It looks like there are some mistakes. Feel free to continue and correct them.";
  const description = isSuccess
    ? successDescription ?? defaultSuccessMessage
    : failureDescription ?? defaultFailureMessage;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center">
            {isSuccess ? (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-destructive" />
            )}
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            {isSuccess ? "Puzzle Solved!" : "Incorrect Solution"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-3 gap-4 text-center py-4">
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-bold text-lg">{formatTime(time)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mistakes</p>
            <p className="font-bold text-lg">{mistakes}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hints Used</p>
            <p className="font-bold text-lg">{hintsUsed}</p>
          </div>
        </div>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row">
          {extraActions}
          <AlertDialogAction
            onClick={() => router.push("/puzzles")}
            className="w-full"
          >
            {isSuccess ? "Play Another Puzzle" : "Back to Puzzles"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
