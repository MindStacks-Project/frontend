"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Star, Trophy, Clock, Bookmark } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecentlyPlayed } from "@/hooks/use-recently-played";
import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Points",
    value: "12,450",
    icon: Star,
    description: "+20% from last month",
  },
  {
    title: "Current Streak",
    value: "14 days",
    icon: Flame,
    description: "Keep it going!",
  },
  {
    title: "Puzzles Completed",
    value: "82",
    icon: Trophy,
    description: "5 this week",
  },
  {
    title: "Completion Rate",
    value: "89%",
    icon: Target,
    description: "Your overall accuracy",
  },
];

const badges = [
  {
    name: "No-Hints",
    icon: Star,
    description: "Completed a puzzle without hints",
  },
  { name: "Accuracy ≥95%", icon: Target, description: "High precision solver" },
  {
    name: "7-day streak",
    icon: Flame,
    description: "Played every day for a week",
  },
  {
    name: "Speedster",
    icon: Clock,
    description: "Finished a puzzle in record time",
  },
  {
    name: "Strategist",
    icon: Trophy,
    description: "Low error rate on a hard puzzle",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { entries: favoriteEntries, loading: favoritesLoading } = useFavorites();
  const { entries: recentEntries, loading: recentLoading } = useRecentlyPlayed(5);

  const favoriteList = useMemo(
    () => favoriteEntries.slice(0, 6),
    [favoriteEntries]
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, PuzzleMaster!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Your Badges</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {badges.map((badge) => (
            <Card
              key={badge.name}
              className="flex flex-col items-center p-4 text-center"
            >
              <div className="p-4 bg-accent/20 mb-2">
                <badge.icon className="h-8 w-8 text-accent-foreground" />
              </div>
              <p className="font-semibold">{badge.name}</p>
              <p className="text-xs text-muted-foreground">
                {badge.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
              Favorites
            </CardTitle>
            {!user && (
              <Badge variant="secondary" className="uppercase">
                Sign in
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {favoritesLoading ? (
              <p className="text-sm text-muted-foreground">Loading favorites…</p>
            ) : user && favoriteList.length > 0 ? (
              <div className="space-y-2">
                {favoriteList.map((fav) => (
                  <div
                    key={fav.puzzleId}
                    className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">
                        {fav.title || fav.puzzleType}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {fav.puzzleType} • {fav.difficulty}
                      </span>
                    </div>
                    <Link href={`/play/${fav.puzzleId}`} className="text-primary text-xs underline">
                      Play
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {user
                  ? "No favorites yet. Save puzzles from the Puzzles tab."
                  : "Sign in to start saving your favorite puzzles."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Recently Played</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLoading ? (
              <p className="text-sm text-muted-foreground">Loading recent games…</p>
            ) : user && recentEntries.length > 0 ? (
              <div className="space-y-2">
                {recentEntries.map((entry) => {
                  const playedAt = entry.lastPlayed?.toDate?.();
                  return (
                    <div
                      key={entry.puzzleId}
                      className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">
                          {entry.title || entry.puzzleType}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {entry.puzzleType} • {entry.difficulty}
                          {playedAt
                            ? ` • ${playedAt.toLocaleDateString()}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link href={`/play/${entry.puzzleId}`} className="text-primary text-xs underline">
                          Resume
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {user
                  ? "Play a puzzle to see it here."
                  : "Sign in to track your recent puzzles."}
              </div>
            )}
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/puzzles">Browse Puzzles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
