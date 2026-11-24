import { HiOutlineCheckCircle } from "react-icons/hi";

const SKILLS = ["Design", "AI", "Data"];

/**
 * Hero artwork: the learner illustration with floating proof cards.
 * Used only on the landing page hero.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[40px] bg-dots-soft opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-x-10 bottom-4 top-12 rounded-[40px] bg-primary/25 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-[32px] border-4 border-white bg-primary-soft shadow-soft-3d">
        <img
          src="/auth-image.png"
          alt="A learner following a video lesson on a laptop"
          className="h-[clamp(320px,46vh,440px)] w-full object-cover sm:h-[clamp(340px,48vh,480px)] lg:h-[clamp(340px,52vh,520px)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/15 to-transparent"
        />
      </div>

      <div className="animate-float-soft absolute -right-1 top-5 flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-2 shadow-lg shadow-slate-900/5 sm:-right-4">
        <HiOutlineCheckCircle className="size-4 text-emerald-500" />
        <span className="text-xs font-semibold text-slate-700">
          Live Q&amp;A with instructors
        </span>
      </div>

      <div
        className="animate-float-soft absolute -left-3 top-[34%] hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-5 py-4 text-primary-foreground shadow-xl shadow-primary/30 sm:block lg:-left-8"
        style={{ animationDelay: "1.2s" }}
      >
        <p className="text-2xl font-extrabold leading-none">500+</p>
        <p className="mt-1 text-xs font-medium text-white/80">
          expert-led courses
        </p>
      </div>

      <div
        className="animate-float-soft absolute -left-2 bottom-16 hidden w-56 rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-900/5 sm:block lg:-left-6"
        style={{ animationDelay: "0.6s" }}
      >
        <p className="text-sm font-bold text-foreground">Build your skills</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SKILLS.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              +{skill}
            </span>
          ))}
        </div>
      </div>

      <div
        className="animate-float-soft absolute -bottom-4 right-2 rounded-3xl bg-foreground px-5 py-4 text-white shadow-xl shadow-slate-900/20 sm:right-5"
        style={{ animationDelay: "1.8s" }}
      >
        <p className="text-2xl font-extrabold leading-none">1,500+</p>
        <p className="mt-1 text-xs font-medium text-white/70">
          free lessons to start
        </p>
      </div>
    </div>
  );
}
