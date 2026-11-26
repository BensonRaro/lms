import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HiOutlineBadgeCheck, HiOutlineClock, HiOutlineSparkles } from "react-icons/hi";
import type { Route } from "./+types/become-instructor";
import { SiteHeader } from "@/components/globals/site-header";
import { PageLoader } from "@/components/globals/page-loader";
import { OnboardingWizard } from "@/components/instructor/onboarding-wizard";
import { canTeach, useSessionUser } from "@/lib/session";

const BENEFITS = [
  {
    icon: HiOutlineClock,
    title: "Teach on your schedule",
    description: "Publish lessons when it suits you. Your draft is always saved.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Learners get help instantly",
    description: "Every lesson pairs with AI answers grounded in your material.",
  },
  {
    icon: HiOutlineBadgeCheck,
    title: "Reviewed before it goes live",
    description: "Our team checks each course so quality stays high.",
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Become an instructor · Lumina" },
    {
      name: "description",
      content:
        "Share what you know. Create a profile, get instructor access, and prepare your first course for review.",
    },
  ];
}

export default function BecomeInstructorPage() {
  const navigate = useNavigate();
  const { user, isPending, role, refetch } = useSessionUser();

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      navigate("/login?next=/become-instructor", { replace: true });
      return;
    }
    if (canTeach(role)) {
      navigate("/dashboard/instructor", { replace: true });
    }
  }, [isPending, user, role, navigate]);

  const handleComplete = async () => {
    await refetch();
    navigate("/dashboard/instructor", { replace: true });
  };

  if (isPending || !user || canTeach(role)) {
    return <PageLoader />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden bg-gradient-to-b from-accent via-accent/60 to-background"
      >
        <div className="absolute inset-0 bg-grid-soft [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <SiteHeader />

      <main className="relative mx-auto w-full max-w-[90rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <aside className="lg:sticky lg:top-32">
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Become an instructor
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              Turn what you know into a course learners{" "}
              <span className="font-display font-normal italic text-primary">
                finish
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Set up your instructor profile in two minutes. Course creation
              opens right after — your first course goes to review before it is
              published.
            </p>

            <ul className="mt-8 space-y-5">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
                    <benefit.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {benefit.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <OnboardingWizard onComplete={handleComplete} />
        </div>
      </main>
    </div>
  );
}
