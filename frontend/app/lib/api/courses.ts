import { api } from "./client";
import type { ExpertiseTopic } from "./instructors";

export const COURSE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];
export type CourseStatus = "draft" | "in_review" | "published" | "rejected";

export type CourseLesson = {
  id: string;
  title: string;
  summary: string;
  content: string;
  /** Cloudinary id of the lesson video, or null for a written-only lesson. */
  videoPublicId: string | null;
};

export type CourseSection = {
  id: string;
  title: string;
  lessons: CourseLesson[];
};

/** Mirrors `CourseDTO` on the backend. */
export type Course = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ExpertiseTopic;
  level: CourseLevel;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  status: CourseStatus;
  submittedAt: string | null;
  sections: CourseSection[];
  lessonCount: number;
  updatedAt: string;
};

export type CourseSummary = {
  id: string;
  title: string;
  status: CourseStatus;
  category: ExpertiseTopic;
  level: CourseLevel;
  thumbnailUrl: string | null;
  lessonCount: number;
  updatedAt: string;
};

/** Body accepted by the draft save and submit endpoints. */
export type CourseDraftPayload = {
  title: string;
  subtitle: string;
  description: string;
  category: ExpertiseTopic;
  level: CourseLevel;
  thumbnailPublicId: string | null;
  sections: {
    id?: string;
    title: string;
    lessons: {
      id?: string;
      title: string;
      summary: string;
      content: string;
      videoPublicId: string | null;
    }[];
  }[];
};

/** GET /api/courses/mine */
export async function fetchMyCourses() {
  const response = await api.get<{ data: CourseSummary[] }>(
    "/api/courses/mine",
  );
  return response.data.data;
}

/** GET /api/courses/:courseId */
export async function fetchCourse(courseId: string, signal?: AbortSignal) {
  const response = await api.get<{ data: Course }>(
    `/api/courses/${courseId}`,
    { signal },
  );
  return response.data.data;
}

/** POST /api/courses */
export async function createCourseDraft(payload: CourseDraftPayload) {
  const response = await api.post<{ data: Course }>("/api/courses", payload);
  return response.data.data;
}

/** PUT /api/courses/:courseId */
export async function updateCourseDraft(
  courseId: string,
  payload: CourseDraftPayload,
) {
  const response = await api.put<{ data: Course }>(
    `/api/courses/${courseId}`,
    payload,
  );
  return response.data.data;
}

/** POST /api/courses/:courseId/submit */
export async function submitCourseForReview(
  courseId: string,
  payload: CourseDraftPayload,
) {
  const response = await api.post<{ data: Course }>(
    `/api/courses/${courseId}/submit`,
    payload,
  );
  return response.data.data;
}

/** DELETE /api/courses/:courseId — drafts and rejected courses only. */
export async function deleteCourse(courseId: string) {
  await api.delete(`/api/courses/${courseId}`);
}
