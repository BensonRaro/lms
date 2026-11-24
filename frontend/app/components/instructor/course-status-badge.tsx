import type { CourseStatus } from "@/lib/api/courses";

const STATUS: Record<CourseStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-500" },
  in_review: { label: "In review", className: "bg-amber-50 text-amber-600" },
  published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-600",
  },
  rejected: {
    label: "Changes requested",
    className: "bg-red-50 text-red-600",
  },
};

/** Small pill for a course's review state, shared by lists and the editor. */
export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const config = STATUS[status];

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
