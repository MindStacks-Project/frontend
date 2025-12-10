"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Puzzle } from "@/lib/types";
import {
  addFavorite,
  fetchFavorites,
  removeFavorite,
  type FavoriteEntry,
} from "@/lib/favorites";
import { useToast } from "@/hooks/use-toast";

type FavoritesState = {
  entries: FavoriteEntry[];
  ids: Set<string>;
  pending: Set<string>;
  loading: boolean;
  toggleFavorite: (puzzle: Puzzle, title?: string) => Promise<void>;
};

const buildIdSet = (entries: FavoriteEntry[]) =>
  new Set(entries.map((entry) => entry.puzzleId));

export function useFavorites(): FavoritesState {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user?.uid) {
        setEntries([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchFavorites(user.uid);
        setEntries(
          data.sort((a, b) => {
            const aTime = a.savedAt?.toMillis?.() ?? 0;
            const bTime = b.savedAt?.toMillis?.() ?? 0;
            return bTime - aTime;
          })
        );
      } catch (error) {
        console.error("Failed to load favorites", error);
        toast({
          title: "Could not load favorites",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [toast, user]);

  const ids = useMemo(() => buildIdSet(entries), [entries]);

  const toggleFavorite = useCallback(
    async (puzzle: Puzzle, title?: string) => {
      if (!user?.uid) {
        toast({
          title: "Sign in required",
          description: "Log in to save puzzles to your favorites.",
          variant: "destructive",
        });
        return;
      }
      const puzzleId = puzzle.id;
      setPending((prev) => {
        const next = new Set(prev);
        next.add(puzzleId);
        return next;
      });
      try {
        if (ids.has(puzzleId)) {
          await removeFavorite(user.uid, puzzleId);
          setEntries((prev) => prev.filter((entry) => entry.puzzleId !== puzzleId));
        } else {
          const entry = await addFavorite(user.uid, puzzle, title);
          setEntries((prev) => [entry, ...prev]);
        }
      } catch (error) {
        console.error("Failed to toggle favorite", error);
        toast({
          title: "Could not update favorites",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(puzzleId);
          return next;
        });
      }
    },
    [ids, toast, user]
  );

  return { entries, ids, pending, loading, toggleFavorite };
}
