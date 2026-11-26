import { HiOutlineTrash } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LessonVideoUpload } from "./lesson-video-upload";
import type { DraftLesson } from "./course-draft";

type LessonCardProps = {
  lesson: DraftLesson;
  index: number;
  /** True for the first lesson of the first section — always the free preview. */
  isPreview: boolean;
  disabled: boolean;
  onChange: (patch: Partial<Omit<DraftLesson, "key" | "id">>) => void;
  onVideoUploaded: (publicId: string) => void;
  onVideoRemoved: () => void;
  onUploadingChange: (uploading: boolean) => void;
  onRemove: () => void;
};

/**
 * One lesson inside a section: title, summary, written tutorial and the
 * private video upload for the lesson.
 */
export function LessonCard({
  lesson,
  index,
  isPreview,
  disabled,
  onChange,
  onVideoUploaded,
  onVideoRemoved,
  onUploadingChange,
  onRemove,
}: LessonCardProps) {
  const number = index + 1;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Lesson {number}
          </p>
          {isPreview ? (
            <span
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600"
              title="Learners can watch this lesson before enrolling."
            >
              Free preview
            </span>
          ) : null}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove lesson ${number}`}
            className="grid size-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <HiOutlineTrash className="size-4" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-3">
        <Input
          value={lesson.title}
          maxLength={120}
          disabled={disabled}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Lesson title"
          aria-label={`Lesson ${number} title`}
        />
        <Input
          value={lesson.summary}
          maxLength={300}
          disabled={disabled}
          onChange={(event) => onChange({ summary: event.target.value })}
          placeholder="One-line summary (optional)"
          aria-label={`Lesson ${number} summary`}
        />
        <Textarea
          value={lesson.content}
          maxLength={20000}
          rows={4}
          disabled={disabled}
          onChange={(event) => onChange({ content: event.target.value })}
          placeholder="Written tutorial shown beneath the video…"
          aria-label={`Lesson ${number} notes`}
          className="min-h-24"
        />

        <LessonVideoUpload
          videoPublicId={lesson.videoPublicId}
          disabled={disabled}
          onUploaded={onVideoUploaded}
          onRemoved={onVideoRemoved}
          onUploadingChange={onUploadingChange}
        />
      </div>
    </div>
  );
}
