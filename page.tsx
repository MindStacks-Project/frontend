import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry } from "@/lib/types";

export const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, nickname: "LogicLord", gamesPlayed: 142, points: 12450, country: "USA" },
  {
    rank: 2,
    nickname: "SudokuSavant",
    gamesPlayed: 135,
    points: 11980,
    country: "Germany",
  },
  {
    rank: 3,
    nickname: "PuzzleProdigy",
    gamesPlayed: 128,
    points: 11500,
    country: "Canada",
  },
  { rank: 4, nickname: "GridGuru", gamesPlayed: 121, points: 10850, country: "Japan" },
  { rank: 5, nickname: "Enigma", gamesPlayed: 118, points: 10200, country: "UK" },
  {
    rank: 6,
    nickname: "CodeCrusher",
    gamesPlayed: 112,
    points: 9800,
    country: "Australia",
  },
  { rank: 7, nickname: "TheThinker", gamesPlayed: 109, points: 9540, country: "Brazil" },
  { rank: 8, nickname: "MazeMaster", gamesPlayed: 105, points: 9210, country: "India" },
  { rank: 9, nickname: "WordWizard", gamesPlayed: 101, points: 8990, country: "France" },
  {
    rank: 10,
    nickname: "NumberNinja",
    gamesPlayed: 98,
    points: 8750,
    country: "South Korea",
  },
];

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Leaderboard</h1>
        <p className="text-muted-foreground">
          See who's at the top of their game today.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Players</CardTitle>
          <CardDescription>
            Updated every 15 minutes with games played and total points earned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Games Played</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry) => (
                <TableRow key={entry.rank}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.nickname}</TableCell>
                  <TableCell>{entry.gamesPlayed.toLocaleString()}</TableCell>
                  <TableCell>{entry.country}</TableCell>
                  <TableCell className="text-right">
                    {entry.points.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
