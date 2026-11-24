import type { NextFunction, Request, Response } from "express";
import { getSession, roleOf } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import {
  getInstructorProfile,
  onboardInstructor,
} from "../services/instructor.service.js";
import { instructorOnboardingSchema } from "../validators/instructor.validator.js";

/**
 * POST /api/instructors/onboarding — saves the instructor profile and grants
 * the instructor role. Request body is validated with a strict schema.
 */
export async function postOnboarding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = instructorOnboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid onboarding details.",
      );
    }

    const session = getSession(res);
    const profile = await onboardInstructor({
      userId: session.user.id,
      currentRole: roleOf(session),
      input: parsed.data,
    });

    res.status(201).json({ data: profile });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instructors/me — the caller's own instructor profile.
 * Returns `{ data: null }` until onboarding is complete.
 */
export async function getMyProfile(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = getSession(res);
    const profile = await getInstructorProfile(session.user.id);
    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
}
