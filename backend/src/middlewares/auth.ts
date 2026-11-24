import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { AppError } from "./error.js";

export type Role = "student" | "instructor" | "admin" | "superadmin";

export type AppSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

/**
 * Reads the session that `requireAuth` attached to the response. Controllers
 * call this instead of touching `res.locals` directly.
 */
export function getSession(res: Response): AppSession {
  return res.locals.session as AppSession;
}

export function roleOf(session: AppSession): Role {
  return ((session.user as { role?: Role }).role ?? "student") as Role;
}

/**
 * Resolves the better-auth session from the request cookie and stops
 * unauthenticated calls before they reach a controller.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError(401, "UNAUTHORIZED", "You must be signed in.");
    }

    res.locals.session = session;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Gate for endpoints limited to specific roles. Must run after `requireAuth`.
 * Missing role is treated as `student` so legacy users stay locked out.
 */
export function requireRole(...roles: Role[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const role = roleOf(getSession(res));
    if (!roles.includes(role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have access to this."));
      return;
    }
    next();
  };
}
