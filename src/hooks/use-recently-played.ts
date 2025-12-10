"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchRecentlyPlayed,
  type RecentlyPlayedEntry,
} from "@/lib/recently-played";
import { useToast } from "@/hooks/use-toast";

export function useRecentlyPlayed(take = 6) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<RecentlyPlayedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.uid) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchRecentlyPlayed(user.uid, take);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load recent games", error);
      toast({
        title: "Could not load recent games",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [take, toast, user]);

  useEffect(() => {
    void load();
  }, [load]);

  return { entries, loading, reload: load };
}
