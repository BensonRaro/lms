import type { Route } from "./+types/courses";
import { CourseListPanel } from "@/components/instructor/course-list-panel";
import { DashboardSkeleton } from "@/components/instructor/dashboard-states";
import { useMyCourses } from "@/lib/hooks/use-courses";
import { useSessionUser } from "@/lib/session";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your courses · Lumina" },
    {
      name: "description",
      content: "Create, edit and submit your courses for review.",
    },
  ];
}

export default function InstructorCoursesPage() {
  // Access is enforced by the dashboard layout; the session only gates queries.
  const { user } = useSessionUser();
  const coursesQuery = useMyCourses({
    userId: user?.id,
    enabled: Boolean(user?.id),
  });

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Teaching
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          Your courses
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
          Keep drafts private while you build, then submit a course for admin
          review. Editing locks once it is in review.
        </p>
      </header>

      <CourseListPanel
        courses={coursesQuery.data}
        isPending={coursesQuery.isPending}
        error={coursesQuery.error}
        onRetry={() => void coursesQuery.refetch()}
      />
    </div>
  );
}
