import { useEffect } from "react";
import { useNavigate } from "react-router";
import { canTeach, useSessionUser } from "@/lib/session";

/**
 * Session gate shared by every instructor dashboard page: sends anonymous
 * visitors to sign in (returning to `nextPath`) and non-instructors to
 * onboarding. `allowed` is false until both checks pass.
 */
export function useInstructorAccess(nextPath: string) {
  const navigate = useNavigate();
  const { user, isPending, role } = useSessionUser();
  const allowed = Boolean(user?.id) && canTeach(role);

  useEffect(() => {
    if (isPending) return;

    if (!user?.id) {
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, {
        replace: true,
      });
      return;
    }

    if (!canTeach(role)) {
      navigate("/become-instructor", { replace: true });
    }
  }, [isPending, user?.id, role, navigate, nextPath]);

  return { user, isPending, allowed };
}
