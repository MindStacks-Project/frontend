import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/shadcn-io/retro-grid";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">
        <section className="relative flex min-h-screen w-full items-center overflow-hidden border-b bg-gradient-to-br from-slate-100 via-background to-slate-200 py-16 dark:from-slate-900 dark:via-background dark:to-slate-800 sm:py-24 lg:py-32">
          <RetroGrid
            angle={70}
            cellSize={50}
            opacity={0.2}
            lightLineColor="#64748b"
            darkLineColor="#475569"
          />
          <header className="absolute inset-x-0 top-0 z-20">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
              <Logo />
              <nav className="flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </nav>
            </div>
          </header>
          <div className="container mx-auto relative z-10 px-4 pt-24 md:px-6 sm:pt-28">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
              <span className="border border-border/60 bg-background/80 px-4 py-1 text-sm font-medium text-foreground shadow-sm backdrop-blur">
                A Retro Playground for Modern Minds
              </span>
              <h1 className="font-press text-3xl font-normal tracking-tighter text-foreground drop-shadow-sm sm:text-4xl lg:text-5xl">
                Unlock the Power of Human Problem-Solving
              </h1>
              <p className="max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
                MindStacks turns retro-inspired puzzles into a living lab. Play,
                compete, and help researchers understand how real people reason
                through challenges.
              </p>
              <div className="flex flex-col gap-3 min-[420px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-background py-16 text-foreground sm:py-20 lg:py-20">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-12 md:ml-auto md:mr-0 md:text-left">
            <p className="font-press text-xs uppercase tracking-[0.3em] text-foreground/60">
              About
            </p>
            <p className="max-w-4xl text-balance text-xl font-light leading-relaxed text-foreground/90 sm:text-2xl lg:text-2xl">
              MindStacks is a retro puzzle playground capturing human problem
              solving to advance trustworthy AI. We blend nostalgia, competitive
              play, and rigorous research to illuminate how people think through
              challenges then turn those insights into better tools for
              everyone.
            </p>
          </div>
        </section>

        <section className="w-full bg-background py-16 sm:py-24 lg:py-32">
          <div className="px-4 sm:px-6 lg:px-4 lg:pr-25">
            <div className="space-y-5 text-left">
              <div className="font-press text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Play with Purpose
              </div>
              {/* <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Discover the MindStacks experience
              </h2> */}
            </div>

            {/* Card 1 */}
            <div className="mt-10 flex justify-start">
              <article className="group relative flex min-h-[48rem] w-full max-w-[calc(100%-2rem)] flex-col justify-between overflow-hidden border border-border bg-background shadow-sm transition hover:shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=2000&q=80"
                  alt="Player surrounded by glowing retro puzzle cabinets"
                  className="absolute inset-0 h-full w-full origin-center scale-105 object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:opacity-80"
                />

                <header className="relative flex flex-col gap-3 px-8 py-12 text-left sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-background">
                      Immersion
                    </p>
                    <h3 className="font-headline text-4xl tracking-tight text-background sm:text-5xl">
                      The MindStacks Arcade
                    </h3>
                  </div>
                  <p className="max-w-xs text-xs uppercase tracking-[0.3em] text-background">
                    Daily challenges • Multiplayer runs • Retro analytics
                  </p>
                </header>

                <footer className="relative flex items-end justify-between px-8 pb-10 text-sm text-muted-foreground sm:text-base">
                  <p className="max-w-xl leading-relaxed text-background">
                    Step into cinematic puzzle storylines where every decision
                    helps train more intuitive agents. Earn streaks, unlock
                    co-op labs, and watch your strategy replayed through
                    nostalgic dashboards.
                  </p>
                  <button className="flex items-center justify-center text-2xl text-background/70 sm:h-12 sm:w-12 sm:rounded-full sm:border sm:border-background/40 sm:transition-transform sm:duration-300 sm:ease-out sm:group-hover:-rotate-45">
                    <span className="block sm:hidden">↗</span>
                    <span className="hidden sm:block">→</span>
                  </button>
                </footer>
              </article>
            </div>

            {/* Card 2 */}
            <div className="mt-4 flex justify-start">
              <article className="group relative flex min-h-[48rem] w-full max-w-[calc(100%-2rem)] flex-col justify-between overflow-hidden border border-border bg-background shadow-sm transition hover:shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2200&q=80"
                  alt="Friends celebrating a co-op puzzle victory under neon lights"
                  className="absolute inset-0 h-full w-full origin-center scale-105 object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:opacity-80"
                />

                <header className="relative flex flex-col gap-3 px-8 py-12 text-left sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-background">
                      Community Play
                    </p>
                    <h3 className="font-headline text-4xl tracking-tight text-background sm:text-5xl">
                      Squad Challenge Arenas
                    </h3>
                  </div>
                  <p className="max-w-xs text-xs uppercase tracking-[0.3em] text-background">
                    Co-op gauntlets • Shared telemetry • Team badges
                  </p>
                </header>

                <footer className="relative flex items-end justify-between px-8 pb-10 text-sm text-muted-foreground sm:text-base">
                  <p className="max-w-xl leading-relaxed text-background">
                    Coordinate in timed raids, sync live telemetry across your
                    squad, and stack neon accolades that celebrate collaborative
                    brilliance.
                  </p>
                  <button className="flex items-center justify-center text-2xl text-background/70 sm:h-12 sm:w-12 sm:rounded-full sm:border sm:border-background/40 sm:transition-transform sm:duration-300 sm:ease-out sm:group-hover:-rotate-45">
                    <span className="block sm:hidden">↗</span>
                    <span className="hidden sm:block">→</span>
                  </button>
                </footer>
              </article>
            </div>

            {/* Card 3 */}
            <div className="mt-4 flex justify-start">
              <article className="group relative flex min-h-[48rem] w-full max-w-[calc(100%-2rem)] flex-col justify-between overflow-hidden border border-border bg-background shadow-sm transition hover:shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=2200&q=80"
                  alt="Analyst reviewing retro-styled data dashboards in a dark studio"
                  className="absolute inset-0 h-full w-full origin-center scale-105 object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:opacity-80"
                />

                <header className="relative flex flex-col gap-3 px-8 py-12 text-left sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-background">
                      Insight Lab
                    </p>
                    <h3 className="font-headline text-4xl tracking-tight text-background sm:text-5xl">
                      Retro Analytics Studio
                    </h3>
                  </div>
                  <p className="max-w-xs text-xs uppercase tracking-[0.3em] text-background">
                    Heatmaps • Strategy replays • AI comparisons
                  </p>
                </header>

                <footer className="relative flex items-end justify-between px-8 pb-10 text-sm text-muted-foreground sm:text-base">
                  <p className="max-w-xl leading-relaxed text-background">
                    Dive into neon data bays to study heatmaps, replay pivotal
                    moves, and contrast your intuition with MindStacks'
                    collaborative agents.
                  </p>
                  <button className="flex items-center justify-center text-2xl text-background/70 sm:h-12 sm:w-12 sm:rounded-full sm:border sm:border-background/40 sm:transition-transform sm:duration-300 sm:ease-out sm:group-hover:-rotate-45">
                    <span className="block sm:hidden">↗</span>
                    <span className="hidden sm:block">→</span>
                  </button>
                </footer>
              </article>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center p-6 md:p-8">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 MindStacks. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
