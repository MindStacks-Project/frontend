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

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, nickname: "LogicLord", score: 12450, country: "USA" },
  { rank: 2, nickname: "SudokuSavant", score: 11980, country: "Germany" },
  { rank: 3, nickname: "PuzzleProdigy", score: 11500, country: "Canada" },
  { rank: 4, nickname: "GridGuru", score: 10850, country: "Japan" },
  { rank: 5, nickname: "Enigma", score: 10200, country: "UK" },
  { rank: 6, nickname: "CodeCrusher", score: 9800, country: "Australia" },
  { rank: 7, nickname: "TheThinker", score: 9540, country: "Brazil" },
  { rank: 8, nickname: "MazeMaster", score: 9210, country: "India" },
  { rank: 9, nickname: "WordWizard", score: 8990, country: "France" },
  { rank: 10, nickname: "NumberNinja", score: 8750, country: "South Korea" },
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
          <CardDescription>Updated every 15 minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry) => (
                <TableRow key={entry.rank}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.nickname}</TableCell>
                  <TableCell>{entry.country}</TableCell>
                  <TableCell className="text-right">
                    {entry.score.toLocaleString()}
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
