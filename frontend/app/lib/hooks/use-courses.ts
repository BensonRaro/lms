import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourseDraft,
  deleteCourse,
  fetchCourse,
  fetchMyCourses,
  submitCourseForReview,
  updateCourseDraft,
  type CourseDraftPayload,
} from "@/lib/api/courses";
import { courseKeys } from "@/lib/query/keys";

/** The signed-in instructor's courses, newest first. */
export function useMyCourses({
  userId,
  enabled,
}: {
  userId: string | undefined;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: courseKeys.mine(userId ?? "anonymous"),
    queryFn: fetchMyCourses,
    enabled,
  });
}

/** One course for the editor. `courseId` is ignored while `enabled` is false. */
export function useCourse({
  userId,
  courseId,
  enabled,
}: {
  userId: string | undefined;
  courseId: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: courseKeys.detail(userId ?? "anonymous", courseId),
    queryFn: ({ signal }) => fetchCourse(courseId, signal),
    enabled,
  });
}

/** Creates the course when `courseId` is absent, otherwise updates it. */
export function useSaveCourseDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId?: string;
      payload: CourseDraftPayload;
    }) =>
      courseId
        ? updateCourseDraft(courseId, payload)
        : createCourseDraft(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/**
 * Saves the latest edits and sends the course to admin review. A course that
 * has never been saved is created first so submitting from a new editor works.
 */
export function useSubmitCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      payload,
    }: {
      courseId?: string;
      payload: CourseDraftPayload;
    }) => {
      const id = courseId ?? (await createCourseDraft(payload)).id;
      return submitCourseForReview(id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/** Deletes a draft or rejected course and refreshes lists and cached details. */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      // Drop cached course details so a return visit can't show a deleted course.
      queryClient.removeQueries({ queryKey: [...courseKeys.all, "detail"] });
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
