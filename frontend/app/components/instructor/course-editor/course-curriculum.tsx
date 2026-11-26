import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import { discardUploads } from "@/lib/api/uploads";
import { LessonCard } from "./lesson-card";
import type { CourseDraft, DraftActions } from "./course-draft";

type CourseCurriculumProps = {
  draft: CourseDraft;
  actions: DraftActions;
  disabled: boolean;
  onVideoUploaded: (
    sectionIndex: number,
    lessonIndex: number,
    publicId: string,
  ) => void;
  onVideoRemoved: (sectionIndex: number, lessonIndex: number) => void;
  onUploadingChange: (uploading: boolean) => void;
};

/** Sections → lessons editor, including the per-lesson video upload. */
export function CourseCurriculum({
  draft,
  actions,
  disabled,
  onVideoUploaded,
  onVideoRemoved,
  onUploadingChange,
}: CourseCurriculumProps) {
  const lessonCount = draft.sections.reduce(
    (total, section) => total + section.lessons.length,
    0,
  );

  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Curriculum
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {draft.sections.length}{" "}
            {draft.sections.length === 1 ? "section" : "sections"} ·{" "}
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={actions.addSection}
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <HiOutlinePlus className="size-4" />
            Add section
          </button>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {draft.sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              No sections yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add a section to group your lessons.
            </p>
          </div>
        ) : (
          draft.sections.map((section, sectionIndex) => {
            const number = sectionIndex + 1;

            return (
              <article
                key={section.key}
                className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-slate-400 shadow-sm">
                    {number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Input
                      value={section.title}
                      maxLength={120}
                      disabled={disabled}
                      onChange={(event) =>
                        actions.setSectionTitle(sectionIndex, event.target.value)
                      }
                      placeholder={`Section ${number} title`}
                      aria-label={`Section ${number} title`}
                      className="bg-white"
                    />
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => {
                        void discardUploads(
                          section.lessons.flatMap((lesson) =>
                            lesson.videoPublicId ? [lesson.videoPublicId] : [],
                          ),
                        );
                        actions.removeSection(sectionIndex);
                      }}
                      aria-label={`Remove section ${number}`}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <HiOutlineTrash className="size-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {section.lessons.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-400">
                      This section has no lessons yet.
                    </p>
                  ) : (
                    section.lessons.map((lesson, lessonIndex) => (
                      <LessonCard
                        key={lesson.key}
                        lesson={lesson}
                        index={lessonIndex}
                        isPreview={sectionIndex === 0 && lessonIndex === 0}
                        disabled={disabled}
                        onChange={(patch) =>
                          actions.updateLesson(
                            sectionIndex,
                            lessonIndex,
                            patch,
                          )
                        }
                        onVideoUploaded={(publicId) =>
                          onVideoUploaded(sectionIndex, lessonIndex, publicId)
                        }
                        onVideoRemoved={() =>
                          onVideoRemoved(sectionIndex, lessonIndex)
                        }
                        onUploadingChange={onUploadingChange}
                        onRemove={() => {
                          void discardUploads(
                            lesson.videoPublicId ? [lesson.videoPublicId] : [],
                          );
                          actions.removeLesson(sectionIndex, lessonIndex);
                        }}
                      />
                    ))
                  )}
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => actions.addLesson(sectionIndex)}
                    className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                  >
                    <HiOutlinePlus className="size-4" />
                    Add lesson
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
