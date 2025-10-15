import { puzzles } from "@/lib/puzzles";
import { PuzzleCard } from "@/components/puzzles/puzzle-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PuzzlesPage() {
  const difficulties = ["easy", "medium", "hard"];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Puzzles</h1>
        <p className="text-muted-foreground">
          Choose a puzzle to test your skills.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            {puzzles.map((puzzle) => (
              <PuzzleCard key={puzzle.id} puzzle={puzzle} />
            ))}
          </div>
        </TabsContent>
        {difficulties.map((difficulty) => (
          <TabsContent key={difficulty} value={difficulty}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
              {puzzles
                .filter((p) => p.difficulty === difficulty)
                .map((puzzle) => (
                  <PuzzleCard key={puzzle.id} puzzle={puzzle} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
