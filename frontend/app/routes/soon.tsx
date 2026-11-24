import { Link, useLocation } from "react-router";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { Brand } from "@/components/globals/brand";

const COPY: Record<string, { title: string; description: string }> = {
  "/courses": {
    title: "Course catalog",
    description:
      "Browse by topic, level and duration once instructors start publishing.",
  },
  "/instructors": {
    title: "Instructors",
    description: "Meet the working experts who build and teach on Lumina.",
  },
  "/pricing": {
    title: "Pricing",
    description: "Simple plans for learners and teams — no surprises.",
  },
  "/about": {
    title: "About Lumina",
    description: "Why we're building a calmer, deeper way to learn online.",
  },
};

export function meta() {
  return [
    { title: "Coming soon · Lumina" },
    { name: "description", content: "This page is on its way." },
  ];
}

/**
 * Temporary destination for nav items whose pages are not built yet, so the
 * header never links to a 404. Replace each route with its real page.
 */
export default function ComingSoon() {
  const { pathname } = useLocation();
  const copy = COPY[pathname] ?? {
    title: "Coming soon",
    description: "We're still building this page.",
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-accent via-accent/50 to-background">
      <div className="mx-auto flex w-full max-w-[90rem] items-center px-4 py-5 sm:px-6 lg:px-8">
        <Brand />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg rounded-[32px] border border-white bg-white/80 p-8 text-center shadow-soft-3d backdrop-blur-sm sm:p-12">
          <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            In the works
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            {copy.description}
          </p>
          <Link
            to="/"
            className="button-3d mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-indigo-600"
          >
            <HiOutlineArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
