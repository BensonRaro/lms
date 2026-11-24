import { Link } from "react-router";
import {
  HiOutlineBookOpen,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineRefresh,
} from "react-icons/hi";
import type { CourseSummary } from "@/lib/api/courses";
import { apiErrorMessage } from "@/lib/api/client";
import { CourseStatusBadge } from "@/components/instructor/course-status-badge";

const DATE_FORMAT = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type CourseListPanelProps = {
  courses: CourseSummary[] | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
};

/**
 * The instructor's course list, shared by the dashboard overview and the
 * courses page. Handles loading, error and empty states so neither caller has
 * to re-implement them.
 */
export function CourseListPanel({
  courses,
  isPending,
  error,
  onRetry,
}: CourseListPanelProps) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Your courses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Drafts and submissions, most recently updated first.
          </p>
        </div>
        <Link
          to="/dashboard/instructor/courses/new"
          className="button-3d inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-indigo-600"
        >
          <HiOutlinePlus className="size-4" />
          New course
        </Link>
      </div>

      <div className="mt-6">
        {isPending ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-16 animate-pulse rounded-2xl bg-slate-100/80"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 text-center">
            <p className="text-sm text-slate-600">
              {apiErrorMessage(error, "Could not load your courses.")}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:text-foreground"
            >
              <HiOutlineRefresh className="size-4" />
              Try again
            </button>
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-primary shadow-sm">
              <HiOutlineBookOpen className="size-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">
              No courses yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
              Start with a title and an outline. You can save a draft at any
              point and submit it for review when it is ready.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {courses.map((course) => (
              <li key={course.id}>
                <Link
                  to={`/dashboard/instructor/courses/${course.id}`}
                  className="group flex items-center gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-slate-50/80"
                >
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="size-10 shrink-0 rounded-xl bg-slate-100 object-cover"
                    />
                  ) : (
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <HiOutlineBookOpen className="size-5" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {course.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {course.category} · {course.lessonCount}{" "}
                      {course.lessonCount === 1 ? "lesson" : "lessons"} ·
                      Updated {DATE_FORMAT.format(new Date(course.updatedAt))}
                    </span>
                  </span>
                  <CourseStatusBadge status={course.status} />
                  <HiOutlineChevronRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
