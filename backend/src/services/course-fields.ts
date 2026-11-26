import { Types } from "mongoose";
import type { CourseStatus } from "../lib/course-dto.js";
import { AppError } from "../middlewares/error.js";
import {
  MIN_COURSE_PRICE_CENTS,
  type CourseDraftInput,
} from "../validators/course.validator.js";
import type { MediaPlan } from "./course-media.service.js";

export type EditableStatus = Extract<CourseStatus, "draft" | "rejected">;

export const EDITABLE: EditableStatus[] = ["draft", "rejected"];

export function isEditable(status: CourseStatus) {
  return (EDITABLE as CourseStatus[]).includes(status);
}

export function toCourseObjectId(courseId: string) {
  if (!Types.ObjectId.isValid(courseId)) {
    throw new AppError(404, "COURSE_NOT_FOUND", "This course could not be found.");
  }
  return new Types.ObjectId(courseId);
}

/**
 * Maps validated input onto document fields. Client-sent ids are reused so
 * lesson ids stay stable across saves; media versions come from the verified
 * plan, never from the request.
 */
export function toFields(input: CourseDraftInput, media: MediaPlan) {
  return {
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    category: input.category,
    level: input.level,
    pricing: input.pricing,
    // Free courses never keep a leftover price from a previous paid draft.
    priceCents: input.pricing === "paid" ? input.priceCents : null,
    thumbnail: media.thumbnail,
    sections: input.sections.map((section, sectionIndex) => ({
      ...(section.id ? { _id: new Types.ObjectId(section.id) } : {}),
      title: section.title,
      lessons: section.lessons.map((lesson, lessonIndex) => ({
        ...(lesson.id ? { _id: new Types.ObjectId(lesson.id) } : {}),
        title: lesson.title,
        summary: lesson.summary,
        content: lesson.content,
        video: media.videos[sectionIndex]?.[lessonIndex] ?? null,
        // Position decides the free preview, so it can never be spoofed.
        isPreview: sectionIndex === 0 && lessonIndex === 0,
      })),
    })),
  };
}

/** Submit-time completeness rules; drafts may be saved without these. */
export function assertReadyForReview(input: CourseDraftInput) {
  const lessons = input.sections.flatMap((section) => section.lessons);
  const missing: string[] = [];

  if (input.title.trim().length < 5) {
    missing.push("a title of at least 5 characters");
  }
  if (input.description.trim().length < 40) {
    missing.push("a description of at least 40 characters");
  }
  if (!input.thumbnailPublicId) {
    missing.push("a course thumbnail");
  }
  if (
    input.pricing === "paid" &&
    (input.priceCents ?? 0) < MIN_COURSE_PRICE_CENTS
  ) {
    missing.push(`a price of at least $${MIN_COURSE_PRICE_CENTS / 100}`);
  }
  if (input.sections.length === 0) {
    missing.push("at least one section");
  } else if (lessons.length === 0) {
    missing.push("at least one lesson");
  }
  if (input.sections.some((section) => section.title.trim().length === 0)) {
    missing.push("a title for every section");
  }
  if (lessons.some((lesson) => lesson.title.trim().length === 0)) {
    missing.push("a title for every lesson");
  }

  if (missing.length > 0) {
    throw new AppError(
      400,
      "COURSE_INCOMPLETE",
      `Before submitting, add ${missing.join(", ")}.`,
    );
  }
}
