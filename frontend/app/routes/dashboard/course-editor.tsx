import { Link, useParams } from "react-router";
import type { Route } from "./+types/course-editor";
import { CourseEditor } from "@/components/instructor/course-editor/course-editor";
import {
  DashboardErrorState,
  DashboardSkeleton,
} from "@/components/instructor/dashboard-states";
import { apiErrorMessage } from "@/lib/api/client";
import { useCourse } from "@/lib/hooks/use-courses";
import { useInstructorAccess } from "@/lib/hooks/use-instructor-access";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Course editor · Lumina" },
    {
      name: "description",
      content: "Build your course sections and lessons, then submit for review.",
    },
  ];
}

export default function CourseEditorPage() {
  const { courseId } = useParams();
  const isNew = courseId === "new";
  const { user, isPending, allowed } = useInstructorAccess(
    `/dashboard/instructor/courses/${courseId ?? "new"}`,
  );
  const courseQuery = useCourse({
    userId: user?.id,
    courseId: courseId ?? "",
    enabled: allowed && !isNew,
  });

  if (isPending || !allowed) {
    return <DashboardSkeleton />;
  }

  if (isNew) {
    return <CourseEditor key="new" />;
  }

  if (courseQuery.isPending) {
    return <DashboardSkeleton />;
  }

  if (courseQuery.error) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Link
          to="/dashboard/instructor/courses"
          className="text-sm font-semibold text-slate-500 hover:text-foreground"
        >
          ← All courses
        </Link>
        <DashboardErrorState
          title="We couldn't load this course"
          message={apiErrorMessage(
            courseQuery.error,
            "Please try again in a moment.",
          )}
          onRetry={() => void courseQuery.refetch()}
        />
      </div>
    );
  }

  if (!courseQuery.data) {
    return (
      <div className="mx-auto max-w-lg rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Course not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          It may have been deleted, or it belongs to another instructor.
        </p>
        <Link
          to="/dashboard/instructor/courses"
          className="button-3d mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-indigo-600"
        >
          Back to your courses
        </Link>
      </div>
    );
  }

  return <CourseEditor key={courseQuery.data.id} course={courseQuery.data} />;
}
