import type { Types } from "mongoose";
import { cloudinaryThumbnailUrl } from "./cloudinary/index.js";

export type CourseStatus = "draft" | "in_review" | "published" | "rejected";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

/** Stored Cloudinary reference; the delivery URL is built from it. */
export type MediaAsset = { publicId: string; version: number };

/** Plain shapes returned by `.lean()`, used for DTO mapping only. */
export type LeanLesson = {
  _id: Types.ObjectId;
  title: string;
  summary: string;
  content: string;
  video: MediaAsset | null;
};

export type LeanSection = {
  _id: Types.ObjectId;
  title: string;
  lessons: LeanLesson[];
};

export type LeanCourse = {
  _id: Types.ObjectId;
  instructorId: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: CourseLevel;
  thumbnail: MediaAsset | null;
  status: CourseStatus;
  submittedAt: Date | null;
  sections: LeanSection[];
  createdAt: Date;
  updatedAt: Date;
};

export type LessonDTO = {
  id: string;
  title: string;
  summary: string;
  content: string;
  videoPublicId: string | null;
};

export type SectionDTO = {
  id: string;
  title: string;
  lessons: LessonDTO[];
};

export type CourseDTO = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: CourseLevel;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  status: CourseStatus;
  submittedAt: string | null;
  sections: SectionDTO[];
  lessonCount: number;
  updatedAt: string;
};

/** Row shape for the instructor's course list. */
export type CourseSummaryDTO = {
  id: string;
  title: string;
  status: CourseStatus;
  category: string;
  level: CourseLevel;
  thumbnailUrl: string | null;
  lessonCount: number;
  updatedAt: string;
};

export function countLessons(sections: { lessons: unknown[] }[]) {
  return sections.reduce((total, section) => total + section.lessons.length, 0);
}

function thumbnailUrl(media: MediaAsset | null) {
  return media ? cloudinaryThumbnailUrl(media.publicId, media.version) : null;
}

/** Strips Mongo internals so no raw document ever leaves the API. */
export function toCourseDTO(doc: LeanCourse): CourseDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    subtitle: doc.subtitle,
    description: doc.description,
    category: doc.category,
    level: doc.level,
    thumbnailUrl: thumbnailUrl(doc.thumbnail),
    thumbnailPublicId: doc.thumbnail?.publicId ?? null,
    status: doc.status,
    submittedAt: doc.submittedAt ? doc.submittedAt.toISOString() : null,
    sections: doc.sections.map((section) => ({
      id: String(section._id),
      title: section.title,
      lessons: section.lessons.map((lesson) => ({
        id: String(lesson._id),
        title: lesson.title,
        summary: lesson.summary,
        content: lesson.content,
        videoPublicId: lesson.video?.publicId ?? null,
      })),
    })),
    lessonCount: countLessons(doc.sections),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toCourseSummaryDTO(doc: LeanCourse): CourseSummaryDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    status: doc.status,
    category: doc.category,
    level: doc.level,
    thumbnailUrl: thumbnailUrl(doc.thumbnail),
    lessonCount: countLessons(doc.sections),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
