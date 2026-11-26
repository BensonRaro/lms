import { useEffect, useRef, useState } from "react";
import {
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiOutlineUpload,
} from "react-icons/hi";
import { discardUploads, uploadMedia } from "@/lib/api/uploads";
import { cn } from "@/lib/utils";
import type { DraftThumbnail } from "./course-draft";

type ThumbnailUploadProps = {
  thumbnail: DraftThumbnail | null;
  disabled: boolean;
  onUploaded: (thumbnail: DraftThumbnail) => void;
  onRemoved: () => void;
  /** Lets the editor block saving while bytes are still in flight. */
  onUploadingChange: (uploading: boolean) => void;
};

/**
 * Course cover picker: drag and drop or browse, signed direct upload to
 * Cloudinary, with progress and a preview of the chosen image.
 */
export function ThumbnailUpload({
  thumbnail,
  disabled,
  onUploaded,
  onRemoved,
  onUploadingChange,
}: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const uploading = progress !== null;

  // Leaving the editor cancels the upload instead of orphaning a half file.
  useEffect(() => () => abortRef.current?.abort(), []);

  const startUpload = async (file: File | undefined) => {
    if (!file || disabled || uploading) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const previousId = thumbnail?.publicId ?? null;
    setError(null);
    setProgress(0);
    onUploadingChange(true);

    try {
      const media = await uploadMedia(file, "course-thumbnail", {
        onProgress: setProgress,
        signal: controller.signal,
      });
      if (previousId && previousId !== media.publicId) {
        void discardUploads([previousId]);
      }
      onUploaded({
        publicId: media.publicId,
        previewUrl: media.secureUrl,
      });
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === "AbortError")) {
        setError(
          cause instanceof Error
            ? cause.message
            : "The upload failed. Please try again.",
        );
      }
    } finally {
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
        accept="image/*"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => void startUpload(event.target.files?.[0])}
      />

      {thumbnail ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <img
            src={thumbnail.previewUrl}
            alt="Course thumbnail preview"
            className="aspect-[16/9] w-full bg-slate-100 object-cover"
          />
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-2">
            <p className="min-w-0 flex-1 truncate text-xs text-slate-500">
              {uploading ? "Uploading a new cover…" : "Cover image"}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                <HiOutlineUpload className="size-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  void discardUploads([thumbnail.publicId]);
                  onRemoved();
                }}
                disabled={disabled || uploading}
                aria-label="Remove course thumbnail"
                className="grid size-8 place-items-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
              >
                <HiOutlineTrash className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          onDragOver={(event) => {
            if (disabled || uploading) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void startUpload(event.dataTransfer.files[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
            dragging
              ? "border-primary bg-primary-soft/50"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50",
            (disabled || uploading) && "cursor-not-allowed opacity-60",
          )}
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-white text-slate-300 shadow-sm">
            <HiOutlinePhotograph className="size-5" />
          </span>
          <span className="text-sm font-semibold text-slate-600">
            {uploading ? "Uploading…" : "Add a course cover"}
          </span>
          <span className="text-xs text-slate-400">
            Drag and drop or browse · JPG, PNG or WebP · up to 5 MB
          </span>
          <span className="text-xs font-semibold text-primary">Browse files</span>
        </button>
      )}

      {progress !== null ? (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          <p className="mt-1 text-right text-[11px] font-medium text-slate-400">
            {progress >= 100 ? "Finishing…" : `${progress}%`}
          </p>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-xs leading-relaxed text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
