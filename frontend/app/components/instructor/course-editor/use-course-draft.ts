import { useState } from "react";
import {
  newKey,
  newLesson,
  type CourseDraft,
  type DraftActions,
} from "./course-draft";

export type CourseDraftState = {
  draft: CourseDraft;
  actions: DraftActions;
  /** True while local edits have not been saved to the server. */
  dirty: boolean;
  /** Replaces the draft with a server response and clears the dirty flag. */
  reset: (next: CourseDraft) => void;
};

/** Local editor state for one course, seeded once from the loaded document. */
export function useCourseDraft(initial: CourseDraft): CourseDraftState {
  const [draft, setDraft] = useState<CourseDraft>(initial);
  const [dirty, setDirty] = useState(false);

  // Every action funnels through `edit` so the unsaved-changes flag can never
  // drift from the actual draft.
  const edit = (update: (current: CourseDraft) => CourseDraft) => {
    setDraft(update);
    setDirty(true);
  };

  const actions: DraftActions = {
    setMeta: (patch) => edit((current) => ({ ...current, ...patch })),
    setThumbnail: (thumbnail) =>
      edit((current) => ({ ...current, thumbnail })),
    addSection: () =>
      edit((current) => ({
        ...current,
        sections: [
          ...current.sections,
          { key: newKey(), title: "", lessons: [newLesson()] },
        ],
      })),
    removeSection: (sectionIndex) =>
      edit((current) => ({
        ...current,
        sections: current.sections.filter((_, index) => index !== sectionIndex),
      })),
    setSectionTitle: (sectionIndex, title) =>
      edit((current) => ({
        ...current,
        sections: current.sections.map((section, index) =>
          index === sectionIndex ? { ...section, title } : section,
        ),
      })),
    addLesson: (sectionIndex) =>
      edit((current) => ({
        ...current,
        sections: current.sections.map((section, index) =>
          index === sectionIndex
            ? { ...section, lessons: [...section.lessons, newLesson()] }
            : section,
        ),
      })),
    removeLesson: (sectionIndex, lessonIndex) =>
      edit((current) => ({
        ...current,
        sections: current.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                lessons: section.lessons.filter(
                  (_, position) => position !== lessonIndex,
                ),
              }
            : section,
        ),
      })),
    setLessonVideo: (sectionIndex, lessonIndex, videoPublicId) =>
      edit((current) => ({
        ...current,
        sections: current.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                lessons: section.lessons.map((lesson, position) =>
                  position === lessonIndex
                    ? { ...lesson, videoPublicId }
                    : lesson,
                ),
              }
            : section,
        ),
      })),
    updateLesson: (sectionIndex, lessonIndex, patch) =>
      edit((current) => ({
        ...current,
        sections: current.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                lessons: section.lessons.map((lesson, position) =>
                  position === lessonIndex ? { ...lesson, ...patch } : lesson,
                ),
              }
            : section,
        ),
      })),
  };

  return {
    draft,
    actions,
    dirty,
    reset: (next) => {
      setDraft(next);
      setDirty(false);
    },
  };
}
