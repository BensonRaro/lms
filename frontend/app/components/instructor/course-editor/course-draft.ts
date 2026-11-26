import type {
  Course,
  CourseDraftPayload,
  CourseLevel,
  CoursePricing,
} from "@/lib/api/courses";
import { MIN_COURSE_PRICE_CENTS } from "@/lib/api/courses";
import { EXPERTISE_TOPICS, type ExpertiseTopic } from "@/lib/api/instructors";

/** Saved thumbnail id plus the URL used only for the editor preview. */
export type DraftThumbnail = {
  publicId: string;
  previewUrl: string;
};

export type DraftLesson = {
  /** Client-only React key; never sent to the API. */
  key: string;
  id?: string;
  title: string;
  summary: string;
  content: string;
  videoPublicId: string | null;
};

export type DraftSection = {
  key: string;
  id?: string;
  title: string;
  lessons: DraftLesson[];
};

export type CourseDraft = {
  title: string;
  subtitle: string;
  description: string;
  category: ExpertiseTopic;
  level: CourseLevel;
  pricing: CoursePricing;
  /** USD cents; null when the course is free. */
  priceCents: number | null;
  thumbnail: DraftThumbnail | null;
  sections: DraftSection[];
};

type DraftMeta = Pick<
  CourseDraft,
  "title" | "subtitle" | "description" | "pricing" | "priceCents"
> & {
  category: ExpertiseTopic;
  level: CourseLevel;
};

export type DraftActions = {
  setMeta: (patch: Partial<DraftMeta>) => void;
  setThumbnail: (thumbnail: DraftThumbnail | null) => void;
  addSection: () => void;
  removeSection: (sectionIndex: number) => void;
  setSectionTitle: (sectionIndex: number, title: string) => void;
  addLesson: (sectionIndex: number) => void;
  removeLesson: (sectionIndex: number, lessonIndex: number) => void;
  setLessonVideo: (
    sectionIndex: number,
    lessonIndex: number,
    videoPublicId: string | null,
  ) => void;
  updateLesson: (
    sectionIndex: number,
    lessonIndex: number,
    patch: Partial<Omit<DraftLesson, "key" | "id">>,
  ) => void;
};

export function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `draft-${Math.random().toString(36).slice(2)}`;
}

export function newLesson(): DraftLesson {
  return {
    key: newKey(),
    title: "",
    summary: "",
    content: "",
    videoPublicId: null,
  };
}

/** A blank course with one section so the editor never opens empty. */
export function emptyDraft(): CourseDraft {
  return {
    title: "",
    subtitle: "",
    description: "",
    category: EXPERTISE_TOPICS[0],
    level: "beginner",
    pricing: "free",
    priceCents: null,
    thumbnail: null,
    sections: [{ key: newKey(), title: "", lessons: [newLesson()] }],
  };
}

export function draftFromCourse(course: Course): CourseDraft {
  return {
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    category: course.category,
    level: course.level,
    pricing: course.pricing,
    priceCents: course.priceCents,
    thumbnail:
      course.thumbnailPublicId && course.thumbnailUrl
        ? {
            publicId: course.thumbnailPublicId,
            previewUrl: course.thumbnailUrl,
          }
        : null,
    sections: course.sections.map((section) => ({
      key: newKey(),
      id: section.id,
      title: section.title,
      lessons: section.lessons.map((lesson) => ({
        key: newKey(),
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        content: lesson.content,
        videoPublicId: lesson.videoPublicId,
      })),
    })),
  };
}

/** Strips React keys and trims values before they hit the API. */
export function toPayload(draft: CourseDraft): CourseDraftPayload {
  return {
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim(),
    description: draft.description.trim(),
    category: draft.category,
    level: draft.level,
    pricing: draft.pricing,
    priceCents: draft.pricing === "paid" ? draft.priceCents : null,
    thumbnailPublicId: draft.thumbnail?.publicId ?? null,
    sections: draft.sections.map((section) => ({
      ...(section.id ? { id: section.id } : {}),
      title: section.title.trim(),
      lessons: section.lessons.map((lesson) => ({
        ...(lesson.id ? { id: lesson.id } : {}),
        title: lesson.title.trim(),
        summary: lesson.summary.trim(),
        content: lesson.content.trim(),
        videoPublicId: lesson.videoPublicId,
      })),
    })),
  };
}

/** Every media id the draft points at, for cleanup after a destructive action. */
export function draftMediaIds(draft: CourseDraft): string[] {
  const videoIds = draft.sections.flatMap((section) =>
    section.lessons.flatMap((lesson) =>
      lesson.videoPublicId ? [lesson.videoPublicId] : [],
    ),
  );

  return [draft.thumbnail?.publicId, ...videoIds].filter(
    (id): id is string => Boolean(id),
  );
}

export type ChecklistItem = { label: string; done: boolean };

/** Every publishing requirement with its current state, for the checklist UI. */
export function reviewChecklist(draft: CourseDraft): ChecklistItem[] {
  const lessons = draft.sections.flatMap((section) => section.lessons);

  return [
    {
      label: "A title of at least 5 characters",
      done: draft.title.trim().length >= 5,
    },
    {
      label: "A description of at least 40 characters",
      done: draft.description.trim().length >= 40,
    },
    { label: "A course thumbnail", done: Boolean(draft.thumbnail) },
    ...(draft.pricing === "paid"
      ? [
          {
            label: `A price of at least $${MIN_COURSE_PRICE_CENTS / 100}`,
            done: (draft.priceCents ?? 0) >= MIN_COURSE_PRICE_CENTS,
          },
        ]
      : []),
    { label: "At least one section", done: draft.sections.length > 0 },
    { label: "At least one lesson", done: lessons.length > 0 },
    {
      label: "A title for every section",
      done:
        draft.sections.length > 0 &&
        draft.sections.every((section) => section.title.trim().length > 0),
    },
    {
      label: "A title for every lesson",
      done:
        lessons.length > 0 &&
        lessons.every((lesson) => lesson.title.trim().length > 0),
    },
  ];
}

/** Client mirror of the backend's submit rules. Empty means ready to submit. */
export function missingForReview(draft: CourseDraft): string[] {
  return reviewChecklist(draft)
    .filter((item) => !item.done)
    .map((item) => item.label);
}
