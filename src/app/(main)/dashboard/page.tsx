import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Star, Trophy, Clock } from "lucide-react";

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
    </div>
  );
}
