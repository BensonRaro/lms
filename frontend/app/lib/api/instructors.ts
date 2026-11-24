import { api } from "./client";

/**
 * Topics an instructor can claim during onboarding. Mirrors
 * `backend/src/validators/instructor.validator.ts` — update both together.
 */
export const EXPERTISE_TOPICS = [
  "Web Development",
  "Data Science",
  "Design",
  "AI & Machine Learning",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Languages",
  "Personal Development",
] as const;

export type ExpertiseTopic = (typeof EXPERTISE_TOPICS)[number];

/** Mirrors `InstructorProfileDTO` from the backend service. */
export type InstructorProfile = {
  headline: string;
  bio: string;
  expertise: ExpertiseTopic[];
  experienceYears: number;
  status: "active";
  createdAt: string;
  updatedAt: string;
};

export type InstructorOnboardingPayload = {
  headline: string;
  bio: string;
  expertise: ExpertiseTopic[];
  experienceYears: number;
};

/** GET /api/instructors/me — the caller's profile, or null before onboarding. */
export async function fetchInstructorProfile(signal?: AbortSignal) {
  const response = await api.get<{ data: InstructorProfile | null }>(
    "/api/instructors/me",
    { signal },
  );
  return response.data.data;
}

/** POST /api/instructors/onboarding — saves the profile and grants the role. */
export async function submitInstructorOnboarding(
  payload: InstructorOnboardingPayload,
) {
  const response = await api.post<{ data: InstructorProfile }>(
    "/api/instructors/onboarding",
    payload,
  );
  return response.data.data;
}
