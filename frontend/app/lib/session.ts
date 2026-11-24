import { authClient } from "./auth-client";

export type UserRole = "student" | "instructor" | "admin" | "superadmin";

type SessionData = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>["data"]
>;

/** Session user plus the platform role added by the backend auth config. */
export type AppUser = SessionData["user"] & { role?: UserRole };

/**
 * Reads the better-auth session with a typed `role`. Treat a missing role as
 * `student` so accounts created before roles existed behave correctly.
 */
export function useSessionUser() {
  const session = authClient.useSession();
  const user = session.data?.user as AppUser | undefined;
  const role: UserRole | undefined = user
    ? (user.role ?? "student")
    : undefined;

  return { ...session, user, role };
}

export function canTeach(role?: UserRole) {
  return role === "instructor" || role === "admin" || role === "superadmin";
}
