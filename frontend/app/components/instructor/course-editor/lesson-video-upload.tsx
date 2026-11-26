import { useEffect, useRef, useState } from "react";
import {
  HiOutlineFilm,
  HiOutlineTrash,
  HiOutlineUpload,
} from "react-icons/hi";
import { discardUploads, uploadMedia } from "@/lib/api/uploads";

type LessonVideoUploadProps = {
  videoPublicId: string | null;
  disabled: boolean;
  onUploaded: (publicId: string) => void;
  onRemoved: () => void;
  /** Lets the editor block saving while bytes are still in flight. */
  onUploadingChange: (uploading: boolean) => void;
};

/**
 * Per-lesson video picker. Videos upload as Cloudinary `authenticated` assets,
 * so nothing is publicly playable until the server signs a delivery URL for an
 * enrolled learner.
 */
export function LessonVideoUpload({
  videoPublicId,
  disabled,
  onUploaded,
  onRemoved,
  onUploadingChange,
}: LessonVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = progress !== null;

  // Leaving the editor cancels the upload instead of orphaning a half file.
  useEffect(() => () => abortRef.current?.abort(), []);

  const startUpload = async (file: File | undefined) => {
    if (!file || disabled || uploading) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const previousId = videoPublicId;
    setError(null);
    setFileName(file.name);
    setProgress(0);
    onUploadingChange(true);

    try {
      const media = await uploadMedia(file, "lesson-video", {
        onProgress: setProgress,
        signal: controller.signal,
      });
      if (previousId && previousId !== media.publicId) {
        void discardUploads([previousId]);
      }
      onUploaded(media.publicId);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") {
        setFileName(null);
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : "The upload failed. Please try again.",
        );
      }
    } finally {
      abortRef.current = null;
      setProgress(null);
      onUploadingChange(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => void startUpload(event.target.files?.[0])}
      />

      {uploading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
              {progress !== null && progress >= 100
                ? "Processing video…"
                : `Uploading ${fileName ?? "video"}… ${progress ?? 0}%`}
            </p>
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="shrink-0 text-xs font-semibold text-slate-500 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress ?? 0}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>
      ) : videoPublicId ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
          <HiOutlineFilm className="size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-emerald-700">
              {fileName ?? "Lesson video attached"}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-600/80">
              Private — learners get a signed link after enrolling.
            </p>
          </div>
          {!disabled && (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-white/70"
              >
                <HiOutlineUpload className="size-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  void discardUploads([videoPublicId]);
                  onRemoved();
                }}
                aria-label="Remove lesson video"
                className="grid size-8 shrink-0 place-items-center rounded-full text-emerald-600/70 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <HiOutlineTrash className="size-4" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <HiOutlineFilm className="size-4 shrink-0 text-slate-300" />
            <p className="text-xs leading-relaxed text-slate-500">
              MP4, WebM or MOV · up to 100 MB · private
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlineUpload className="size-3.5" />
            Add video
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-2 text-xs leading-relaxed text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
