import type { ExpertiseTopic } from "@/lib/api/instructors";

/**
 * Shape of the onboarding wizard while it is being filled in. It becomes an
 * `InstructorOnboardingPayload` once submitted.
 */
export type OnboardingDraft = {
  headline: string;
  bio: string;
  expertise: ExpertiseTopic[];
  experienceYears: number;
};
