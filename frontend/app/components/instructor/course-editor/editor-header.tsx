import { Link } from "react-router";
import {
  HiOutlineArrowLeft,
  HiOutlinePaperAirplane,
  HiOutlineSave,
} from "react-icons/hi";
import type { CourseStatus } from "@/lib/api/courses";
import { CourseStatusBadge } from "@/components/instructor/course-status-badge";

type EditorHeaderProps = {
  title: string;
  status: CourseStatus;
  dirty: boolean;
  locked: boolean;
  isNew: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  canSave: boolean;
  canSubmit: boolean;
  onSave: () => void;
  onSubmit: () => void;
};

/**
 * Editor title bar: back link, live title, save state and the two actions.
 * Hidden actions while locked keep the review rule obvious in the UI.
 */
export function EditorHeader({
  title,
  status,
  dirty,
  locked,
  isNew,
  isSaving,
  isSubmitting,
  isUploading,
  canSave,
  canSubmit,
  onSave,
  onSubmit,
}: EditorHeaderProps) {
  const busy = isSaving || isSubmitting || isUploading;

  return (
    <header className="rounded-[28px] border border-white bg-white/85 p-6 shadow-soft-3d backdrop-blur-sm">
      <Link
        to="/dashboard/instructor/courses"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-foreground"
      >
        <HiOutlineArrowLeft className="size-4" />
        All courses
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {title || "Untitled course"}
            </h1>
            <CourseStatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {dirty
              ? "Unsaved changes"
              : isNew
                ? "Not saved yet"
                : "All changes saved"}
          </p>
        </div>

        {!locked && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-100 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlineSave className="size-4" />
              {isSaving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className="button-3d inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlinePaperAirplane className="size-4 -rotate-45" />
              {isSubmitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        )}
      </div>

      {!locked && !canSave && (
        <p className="mt-3 text-xs text-slate-400">
          {isUploading
            ? "Wait for the upload to finish before saving."
            : busy
              ? "Hold on while we save your changes."
              : "Add a course title of at least 3 characters to save."}
        </p>
      )}
    </header>
  );
}
