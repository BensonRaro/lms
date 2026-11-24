import type { Route } from "./+types/home";
import { SiteHeader } from "@/components/globals/site-header";
import { Hero } from "@/components/home/hero";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lumina · Learn the skills the world is hiring for" },
    {
      name: "description",
      content:
        "Short, practical video courses from working experts, with written tutorials and an AI assistant grounded in the lesson you're on.",
    },
  ];
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden bg-gradient-to-b from-accent via-accent/60 to-background"
      >
        <div className="absolute inset-0 bg-grid-soft [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute -left-32 top-10 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-32 size-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <SiteHeader />
      <main className="relative">
        <Hero />
      </main>
    </div>
  );
}
