import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

/**
 * Destructive action for a draft or rejected course. Two-step by design so a
 * stray click can never delete a course mid-edit.
 */
export function DeleteCourseCard({
  isDeleting,
  onDelete,
}: {
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="rounded-[28px] border border-red-100 bg-red-50/40 p-6">
      <h2 className="text-base font-bold tracking-tight text-red-700">
        Delete course
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-red-600/80">
        Permanently removes this course, its sections, lessons and uploaded
        media. Courses under review can't be deleted.
      </p>

      {confirming ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Yes, delete it"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isDeleting}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <HiOutlineExclamationCircle className="size-4" />
          Delete this course
        </button>
      )}
    </section>
  );
}
