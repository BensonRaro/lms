import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineLockClosed,
} from "react-icons/hi";
import type { CourseStatus } from "@/lib/api/courses";

/**
 * Explains why a course is or isn't editable. Review locks editing; a
 * rejected course reopens so the instructor can address the feedback.
 */
export function EditorStatusNotice({ status }: { status: CourseStatus }) {
  if (status === "draft") return null;

  if (status === "in_review") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-700">
        <HiOutlineLockClosed className="mt-0.5 size-5 shrink-0" />
        <p>
          <span className="font-semibold">In review.</span> Editing is locked
          until an admin responds. You can keep this page open to review what
          you submitted.
        </p>
      </div>
    );
  }

  if (status === "published") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-700">
        <HiOutlineCheckCircle className="mt-0.5 size-5 shrink-0" />
        <p>
          <span className="font-semibold">Published.</span> This course is live
          and can no longer be edited.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700">
      <HiOutlineExclamationCircle className="mt-0.5 size-5 shrink-0" />
      <p>
        <span className="font-semibold">Changes requested.</span> Update the
        course and submit it again for review.
      </p>
    </div>
  );
}
