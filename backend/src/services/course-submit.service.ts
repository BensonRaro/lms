import mongoose from "mongoose";
import { writeAuditLog } from "../lib/audit-log.js";
import { toCourseDTO, type CourseDTO, type LeanCourse } from "../lib/course-dto.js";
import { AppError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import type { CourseDraftInput } from "../validators/course.validator.js";
import { assertReadyForReview, isEditable, toCourseObjectId, toFields, EDITABLE } from "./course-fields.js";
import { planMedia } from "./course-media.service.js";
import { discardPlannedMedia } from "./media-cleanup.service.js";

/**
 * Saves the latest edits and sends the course to admin review in one
 * transaction, so the audit entry can never describe a change that failed.
 */
export async function submitForReview(params: {
  instructorId: string;
  courseId: string;
  input: CourseDraftInput;
}): Promise<CourseDTO> {
  const { instructorId, courseId, input } = params;
  assertReadyForReview(input);

  const _id = toCourseObjectId(courseId);
  const existing = await Course.findOne({ _id, instructorId }).lean<LeanCourse>();

  if (!existing) {
    throw new AppError(404, "COURSE_NOT_FOUND", "This course could not be found.");
  }
  if (!isEditable(existing.status)) {
    throw new AppError(
      409,
      "COURSE_LOCKED",
      "This course is already under review or published.",
    );
  }

  const media = await planMedia({ input, existing, userId: instructorId });
  const fields = toFields(input, media);
  const session = await mongoose.startSession();

  try {
    let result: LeanCourse | null = null;

    await session.withTransaction(async () => {
      const current = await Course.findOne({ _id, instructorId })
        .session(session)
        .lean<LeanCourse>();

      if (!current) {
        throw new AppError(
          404,
          "COURSE_NOT_FOUND",
          "This course could not be found.",
        );
      }
      if (!isEditable(current.status)) {
        throw new AppError(
          409,
          "COURSE_LOCKED",
          "This course is already under review or published.",
        );
      }

      const updated = await Course.findOneAndUpdate(
        { _id, instructorId, status: { $in: EDITABLE } },
        { $set: { ...fields, status: "in_review", submittedAt: new Date() } },
        { new: true, session },
      ).lean<LeanCourse>();

      if (!updated) {
        throw new AppError(
          409,
          "COURSE_LOCKED",
          "This course is already under review.",
        );
      }

      await writeAuditLog(
        {
          actorId: instructorId,
          action: "course.submitted",
          targetType: "course",
          targetId: String(_id),
          metadata: {
            title: updated.title,
            sectionCount: updated.sections.length,
            lessonCount: updated.sections.reduce(
              (total, section) => total + section.lessons.length,
              0,
            ),
          },
        },
        session,
      );

      result = updated;
    });

    if (!result) {
      throw new AppError(500, "COURSE_WRITE_FAILED", "Could not submit your course.");
    }

    await discardPlannedMedia(media);
    return toCourseDTO(result);
  } finally {
    await session.endSession();
  }
}
