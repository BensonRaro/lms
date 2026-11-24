import { z } from "zod";

/**
 * Topics an instructor can claim. Keep in sync with the onboarding UI
 * (`frontend/app/components/instructor/onboarding-wizard.tsx`).
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

export const instructorOnboardingSchema = z
  .object({
    headline: z
      .string()
      .trim()
      .min(10, "Headline needs at least 10 characters.")
      .max(120, "Headline must be 120 characters or fewer."),
    bio: z
      .string()
      .trim()
      .min(40, "Bio needs at least 40 characters.")
      .max(1000, "Bio must be 1000 characters or fewer."),
    expertise: z
      .array(z.enum(EXPERTISE_TOPICS))
      .min(1, "Pick at least one topic.")
      .max(5, "Pick up to five topics."),
    experienceYears: z
      .number()
      .int("Experience must be a whole number.")
      .min(0)
      .max(60),
  })
  .strict();

export type InstructorOnboardingInput = z.infer<
  typeof instructorOnboardingSchema
>;
