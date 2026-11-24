import type { NextFunction, Request, Response } from "express";
import { getSession } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import {
  deleteCourse,
  getCourseForOwner,
  listMyCourses,
  saveDraft,
} from "../services/course.service.js";
import { submitForReview } from "../services/course-submit.service.js";
import {
  courseDraftSchema,
  type CourseDraftInput,
} from "../validators/course.validator.js";

function parseDraft(body: unknown): CourseDraftInput {
  const parsed = courseDraftSchema.safeParse(body);

  if (!parsed.success) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid course details.",
    );
  }

  return parsed.data;
}

/** Express 5 types params loosely; a malformed id is simply not found. */
function courseIdFrom(req: Request) {
  const value = req.params.courseId;

  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(404, "COURSE_NOT_FOUND", "This course could not be found.");
  }

  return value;
}

/** GET /api/courses/mine — the caller's courses, newest first. */
export async function listMine(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = getSession(res);
    const courses = await listMyCourses(session.user.id);
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
}

/** GET /api/courses/:courseId — full course, owner only. */
export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = getSession(res);
    const course = await getCourseForOwner(session.user.id, courseIdFrom(req));

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "This course could not be found.");
    }

    res.json({ data: course });
  } catch (error) {
    next(error);
  }
}

/** POST /api/courses — creates a draft owned by the caller. */
export async function createCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = getSession(res);
    const course = await saveDraft({
      instructorId: session.user.id,
      input: parseDraft(req.body),
    });
    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/courses/:courseId — saves edits while the course is a draft. */
export async function updateCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = getSession(res);
    const course = await saveDraft({
      instructorId: session.user.id,
      courseId: courseIdFrom(req),
      input: parseDraft(req.body),
    });
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
}

/** POST /api/courses/:courseId/submit — saves and sends the course to review. */
export async function submitCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = getSession(res);
    const course = await submitForReview({
      instructorId: session.user.id,
      courseId: courseIdFrom(req),
      input: parseDraft(req.body),
    });
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/courses/:courseId — removes a draft or rejected course. */
export async function removeCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = getSession(res);
    await deleteCourse({
      instructorId: session.user.id,
      courseId: courseIdFrom(req),
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
