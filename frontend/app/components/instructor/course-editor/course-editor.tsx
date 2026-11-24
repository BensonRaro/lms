import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import type { Course, CourseStatus } from "@/lib/api/courses";
import { apiErrorMessage } from "@/lib/api/client";
import {
  useDeleteCourse,
  useSaveCourseDraft,
  useSubmitCourse,
} from "@/lib/hooks/use-courses";
import { CourseBasicsCard } from "./course-basics-card";
import { CourseCurriculum } from "./course-curriculum";
import { DeleteCourseCard } from "./delete-course-card";
import {
  draftFromCourse,
  emptyDraft,
  missingForReview,
  toPayload,
} from "./course-draft";
import { useCourseDraft } from "./use-course-draft";
import { EditorHeader } from "./editor-header";
import { EditorStatusNotice } from "./editor-status-notice";
import { PublishingChecklist } from "./publishing-checklist";

const REVIEW_STEPS = [
  { title: "Draft", copy: "Only you can see the course while you build it." },
  { title: "In review", copy: "An admin checks structure, accuracy and depth." },
  { title: "Published", copy: "Approved courses go live in the catalog." },
];

/**
 * One editor for both create and edit. A new course starts from a blank draft
 * and gets its id on the first save; a submitted course opens read-only.
 */
export function CourseEditor({ course }: { course?: Course }) {
  const navigate = useNavigate();
  const initial = useMemo(
    () => (course ? draftFromCourse(course) : emptyDraft()),
    [course],
  );
  const { draft, actions, dirty, reset } = useCourseDraft(initial);

  const [courseId, setCourseId] = useState<string | undefined>(course?.id);
  const [status, setStatus] = useState<CourseStatus>(course?.status ?? "draft");
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);

  const saveMutation = useSaveCourseDraft();
  const submitMutation = useSubmitCourse();
  const deleteMutation = useDeleteCourse();

  const uploading = uploadCount > 0;
  const locked = status === "in_review" || status === "published";
  const missing = missingForReview(draft);
  const titleValid = draft.title.trim().length >= 3;
  const busy = saveMutation.isPending || submitMutation.isPending || uploading;
  const canSave = titleValid && !busy && !locked;
  const canSubmit = missing.length === 0 && !busy && !locked;

  // Uploaders report start/finish, so overlapping uploads can't unlock saving
  // while one of them is still running.
  const handleUploadingChange = (active: boolean) =>
    setUploadCount((count) => Math.max(0, count + (active ? 1 : -1)));

  const applySaved = (saved: Course) => {
    reset(draftFromCourse(saved));
    setStatus(saved.status);
    setNotice(null);

    if (!courseId) {
      setCourseId(saved.id);
      navigate(`/dashboard/instructor/courses/${saved.id}`, {
        replace: true,
      });
    }
  };

  const handleSave = () => {
    setNotice(null);
    saveMutation.mutate(
      { courseId, payload: toPayload(draft) },
      {
        onSuccess: applySaved,
        onError: (error) =>
          setNotice(apiErrorMessage(error, "Could not save your course.")),
      },
    );
  };

  const handleSubmit = () => {
    setNotice(null);

    if (missing.length > 0) {
      setNotice("Complete the publishing checklist before submitting.");
      return;
    }

    submitMutation.mutate(
      { courseId, payload: toPayload(draft) },
      {
        onSuccess: applySaved,
        onError: (error) =>
          setNotice(apiErrorMessage(error, "Could not submit your course.")),
      },
    );
  };

  const handleDelete = () => {
    if (!courseId) {
      return;
    }

    setNotice(null);
    deleteMutation.mutate(courseId, {
      onSuccess: () =>
        navigate("/dashboard/instructor/courses", { replace: true }),
      onError: (error) =>
        setNotice(apiErrorMessage(error, "Could not delete your course.")),
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <EditorHeader
        title={draft.title}
        status={status}
        dirty={dirty}
        locked={locked}
        isNew={!courseId}
        isSaving={saveMutation.isPending}
        isSubmitting={submitMutation.isPending}
        isUploading={uploading}
        canSave={canSave}
        canSubmit={canSubmit}
        onSave={handleSave}
        onSubmit={handleSubmit}
      />

      <EditorStatusNotice status={status} />

      {notice ? (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700"
        >
          <HiOutlineExclamationCircle className="mt-0.5 size-5 shrink-0" />
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <CourseBasicsCard
            draft={draft}
            actions={actions}
            disabled={locked}
            onUploadingChange={handleUploadingChange}
          />
          <CourseCurriculum
            draft={draft}
            actions={actions}
            disabled={locked}
            onVideoUploaded={(sectionIndex, lessonIndex, publicId) =>
              actions.setLessonVideo(sectionIndex, lessonIndex, publicId)
            }
            onVideoRemoved={(sectionIndex, lessonIndex) =>
              actions.setLessonVideo(sectionIndex, lessonIndex, null)
            }
            onUploadingChange={handleUploadingChange}
          />
        </div>

        <aside className="space-y-6">
          <PublishingChecklist draft={draft} locked={locked} />

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              How review works
            </h2>
            <ol className="mt-4 space-y-4">
              {REVIEW_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {step.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {courseId && !locked ? (
            <DeleteCourseCard
              isDeleting={deleteMutation.isPending}
              onDelete={handleDelete}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
