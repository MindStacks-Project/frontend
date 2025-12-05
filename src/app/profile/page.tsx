// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebase.client";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Loader2, Trophy, Flame, Target } from "lucide-react";

// Define the shape of our calculated stats
type PlayerStats = {
  totalGames: number;
  winRate: number;
  currentStreak: number;
  avgGuesses: number;
  guessDistribution: number[]; // Array of 6 numbers (for 1-6 guesses)
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  // Fetch and calculate stats when user loads
  useEffect(() => {
    async function fetchGameStats() {
      if (!user?.uid) return;

      try {
        // Fetch last 100 games to calculate stats
        const gamesRef = collection(db, "users", user.uid, "games");
        const q = query(gamesRef, orderBy("timestamp", "desc"), limit(100));
        const querySnapshot = await getDocs(q);

        const games = querySnapshot.docs.map((doc) => doc.data());

        if (games.length === 0) {
          setStats(null);
        } else {
          // --- CALCULATION LOGIC ---
          const totalGames = games.length;
          const wins = games.filter((g) => g.outcome === "won");
          const winRate = Math.round((wins.length / totalGames) * 100);

          // Calculate Average Guesses (only for wins)
          const totalGuesses = wins.reduce((acc, curr) => acc + (curr.totalGuesses || 0), 0);
          const avgGuesses = wins.length > 0 ? parseFloat((totalGuesses / wins.length).toFixed(1)) : 0;

          // Calculate Streak (iterating backwards from most recent)
          let currentStreak = 0;
          for (const game of games) {
            if (game.outcome === "won") currentStreak++;
            else break; // Stop counting at the first loss
          }

          // Calculate Guess Distribution (How many wins in 1 guess, 2 guesses, etc.)
          const dist = [0, 0, 0, 0, 0, 0]; // Index 0 = 1 guess, Index 5 = 6 guesses
          wins.forEach((game) => {
            const gNum = game.totalGuesses;
            if (gNum >= 1 && gNum <= 6) {
              dist[gNum - 1]++;
            }
          });

          setStats({
            totalGames,
            winRate,
            currentStreak,
            avgGuesses,
            guessDistribution: dist,
          });
        }
      } catch (error) {
        console.error("Error fetching game stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchGameStats();
  }, [user]);

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4 space-y-8">
      
      {/* --- SECTION 1: Identity (Your Original Code) --- */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback>
              {user?.displayName?.substring(0, 2).toUpperCase() || "PL"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle>{user?.displayName || "Player"}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <div className="grid gap-1">
            <h3 className="font-medium">Account Details</h3>
            <div className="text-sm border p-3 rounded-md bg-muted/50">
              <p>
                <strong>User ID:</strong> {user?.uid}
              </p>
              <p>
                <strong>Provider:</strong>{" "}
                {user?.providerData[0]?.providerId || "Email"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 2: Advanced Game Statistics --- */}
      <h3 className="text-xl font-bold tracking-tight">Performance Stats</h3>
      
      {loadingStats ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Key Metrics Grid */}
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">{stats.totalGames}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    Played
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold">{stats.winRate}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    Win %
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold flex items-center gap-1">
                    {stats.currentStreak} <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    Streak
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guess Distribution Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" /> Guess Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.guessDistribution.map((count, index) => {
                  const guessNum = index + 1;
                  // Calculate width percentage relative to the max count (for scaling)
                  const maxVal = Math.max(...stats.guessDistribution, 1);
                  const width = Math.max((count / maxVal) * 100, 5); // Min 5% width for visibility

                  return (
                    <div key={guessNum} className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-center font-mono text-muted-foreground">
                        {guessNum}
                      </span>
                      <div className="flex-1 bg-muted rounded-r-sm h-6 relative overflow-hidden">
                        <div
                          className={`h-full flex items-center justify-end pr-2 text-xs font-medium text-white transition-all ${
                            count > 0 ? "bg-emerald-500" : "bg-muted-foreground/20"
                          }`}
                          style={{ width: `${width}%` }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No game data available yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Play a game to see your stats!</p>
        </div>
      )}
    </div>
  );
}