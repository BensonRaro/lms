import type { Route } from "./+types/instructor";
import { CourseListPanel } from "@/components/instructor/course-list-panel";
import { InstructorStats } from "@/components/instructor/dashboard-stats";
import {
  DashboardErrorState,
  DashboardSkeleton,
} from "@/components/instructor/dashboard-states";
import { InstructorProfileCard } from "@/components/instructor/profile-card";
import { ApiError } from "@/lib/api/client";
import { useMyCourses } from "@/lib/hooks/use-courses";
import { useInstructorAccess } from "@/lib/hooks/use-instructor-access";
import { useInstructorProfile } from "@/lib/hooks/use-instructor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Instructor dashboard · Lumina" },
    {
      name: "description",
      content: "Manage your instructor profile and prepare your first course.",
    },
  ];
}

export default function InstructorDashboardPage() {
  const { user, isPending, allowed } = useInstructorAccess(
    "/dashboard/instructor",
  );

  // `enabled` keeps the queries from firing before the session resolves (and
  // during server rendering, where there is no cookie to send).
  const profileQuery = useInstructorProfile({
    userId: user?.id,
    enabled: allowed,
  });
  const coursesQuery = useMyCourses({ userId: user?.id, enabled: allowed });

  if (isPending || !allowed || profileQuery.isPending) {
    return <DashboardSkeleton />;
  }

  if (profileQuery.error) {
    return (
      <DashboardErrorState
        message={
          profileQuery.error instanceof ApiError
            ? profileQuery.error.message
            : "Could not load your dashboard."
        }
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data ?? null;
  const firstName = (user.name || "there").split(" ")[0];
  const courses = coursesQuery.data ?? [];
  const hasCourse = courses.length > 0;
  const hasSubmission = courses.some((course) => course.status !== "draft");

  const checklist = [
    { label: "Instructor access active", done: true },
    { label: "Teaching profile complete", done: Boolean(profile) },
    { label: "Create your first course", done: hasCourse },
    { label: "Submit it for admin review", done: hasSubmission },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-white bg-white/85 p-6 shadow-soft-3d backdrop-blur-sm sm:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
            Instructor
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Welcome, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-slate-500">
            Build sections and lessons, save drafts as you go, and submit your
            course for admin review when the checklist is green.
          </p>
        </div>
      </section>

      <InstructorStats />

      <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <CourseListPanel
            courses={coursesQuery.data}
            isPending={coursesQuery.isPending}
            error={coursesQuery.error}
            onRetry={() => void coursesQuery.refetch()}
          />

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Getting started
            </h2>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span
                    className={
                      item.done
                        ? "grid size-6 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600"
                        : "grid size-6 place-items-center rounded-full border border-dashed border-slate-300 text-xs font-bold text-slate-400"
                    }
                  >
                    {item.done ? "✓" : ""}
                  </span>
                  <span
                    className={
                      item.done
                        ? "text-sm font-medium text-slate-500 line-through decoration-slate-300"
                        : "text-sm font-medium text-slate-700"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          {profile ? (
            <InstructorProfileCard name={user.name} profile={profile} />
          ) : (
            <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-foreground">Profile missing</h2>
              <p className="mt-1 text-sm text-slate-500">
                Complete onboarding to finish setting up your instructor
                profile.
              </p>
            </section>
          )}

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-foreground">What reviewers look for</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-500">
              <li>Clear outcomes at the start of every lesson.</li>
              <li>Written notes beneath each video, not just slides.</li>
              <li>Accurate difficulty and a realistic course length.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
