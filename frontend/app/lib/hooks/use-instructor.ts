import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInstructorProfile,
  submitInstructorOnboarding,
  type InstructorOnboardingPayload,
} from "@/lib/api/instructors";
import { instructorKeys } from "@/lib/query/keys";

/**
 * Loads the signed-in user's instructor profile. The key includes the user id
 * so a second account on the same browser never sees a cached profile, and
 * `enabled` keeps it from firing before the session resolves (or during
 * server rendering, where there is no cookie to send).
 */
export function useInstructorProfile({
  userId,
  enabled,
}: {
  userId: string | undefined;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: instructorKeys.me(userId ?? "anonymous"),
    queryFn: ({ signal }) => fetchInstructorProfile(signal),
    enabled,
  });
}

/**
 * Submits onboarding. On success the cached profile is invalidated so the
 * dashboard refetches instead of showing a stale empty state.
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InstructorOnboardingPayload) =>
      submitInstructorOnboarding(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: instructorKeys.all });
    },
  });
}
