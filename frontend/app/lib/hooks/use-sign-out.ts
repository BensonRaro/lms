import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

/**
 * Signs the current user out, clears cached business data so the next account
 * starts clean, and returns to the landing page. Used by the header menu and
 * the dashboard sidebar.
 */
export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Could not sign out. Please try again.");
      return;
    }

    queryClient.clear();
    toast.success("Signed out");
    navigate("/");
  };
}
