import { Link } from "react-router";
import { HiOutlineArrowRight, HiOutlineStar } from "react-icons/hi";
import { HeroVisual } from "./hero-visual";

const LEARNERS = [
  { initial: "A", color: "from-violet-400 to-indigo-500" },
  { initial: "J", color: "from-sky-400 to-blue-500" },
  { initial: "S", color: "from-amber-300 to-orange-500" },
  { initial: "T", color: "from-emerald-400 to-teal-500" },
];

const STATS = [
  { value: "94%", label: "Course completion" },
  { value: "120+", label: "Expert instructors" },
  { value: "100K+", label: "Active learners" },
];

/**
 * Landing page hero: value proposition, primary calls to action and social
 * proof. Sits directly under the site header.
 */
export function Hero() {
  return (
    <section className="pb-12 pt-6 sm:pb-14 sm:pt-8 lg:flex lg:min-h-[calc(100svh-6.75rem)] lg:items-center lg:py-4">
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/70 p-6 shadow-soft-3d backdrop-blur-sm sm:rounded-[40px] sm:p-9 lg:p-10 xl:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-32 size-[26rem] rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-24 size-[22rem] rounded-full bg-secondary/10 blur-3xl"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2.5">
                  {LEARNERS.map((learner) => (
                    <span
                      key={learner.initial}
                      className={`grid size-9 place-items-center rounded-full bg-gradient-to-br ${learner.color} text-xs font-bold text-white ring-2 ring-white`}
                    >
                      {learner.initial}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  <HiOutlineStar className="size-3.5 text-amber-400" />
                  4.9
                  <span className="font-medium text-slate-400">
                    · 2,400+ reviews
                  </span>
                </span>
              </div>

              <h1 className="hero-title mt-5 text-[2.35rem] font-extrabold tracking-tight text-foreground sm:text-5xl">
                <span className="block">Master the skills</span>
                <span className="block">the world is</span>
                <span className="block">
                  <span className="font-display font-normal italic text-primary">
                    hiring
                  </span>{" "}
                  for
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
                Short, practical courses from working experts. Watch the lesson,
                read the tutorial beneath it, and ask AI anything about the exact
                moment you&apos;re on.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/signup"
                  className="button-3d inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-indigo-600"
                >
                  Start learning free
                  <HiOutlineArrowRight className="size-5" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-100 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-50"
                >
                  Explore courses
                </Link>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Free to start · No credit card required
              </p>
            </div>

            <HeroVisual />
          </div>

          <dl className="relative mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 sm:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl xl:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
