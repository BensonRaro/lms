/**
 * Query key factory for the instructor resource. Keys are hierarchical so
 * `instructorKeys.all` can invalidate everything after an onboarding submit,
 * and user-scoped so one account never reads another account's cache.
 */
export const instructorKeys = {
  all: ["instructors"] as const,
  me: (userId: string) => [...instructorKeys.all, "me", userId] as const,
};

/**
 * Query key factory for courses. `all` invalidates every course query after a
 * save or submit; list and detail keys include the user id for the same
 * isolation reason as `instructorKeys`.
 */
export const courseKeys = {
  all: ["courses"] as const,
  mine: (userId: string) => [...courseKeys.all, "mine", userId] as const,
  detail: (userId: string, courseId: string) =>
    [...courseKeys.all, "detail", userId, courseId] as const,
};
