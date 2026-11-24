import mongoose from "mongoose";
import { writeAuditLog } from "../lib/audit-log.js";
import {
  toCourseDTO,
  toCourseSummaryDTO,
  type CourseDTO,
  type CourseSummaryDTO,
  type LeanCourse,
} from "../lib/course-dto.js";
import { AppError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import type { CourseDraftInput } from "../validators/course.validator.js";
import { isEditable, toCourseObjectId, toFields, EDITABLE } from "./course-fields.js";
import {
  discardCourseMedia,
  discardPlannedMedia,
  planMedia,
} from "./course-media.service.js";

/** Newest-first list of the caller's courses (drafts and submissions). */
export async function listMyCourses(
  instructorId: string,
): Promise<CourseSummaryDTO[]> {
  const docs = await Course.find({ instructorId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean<LeanCourse[]>();

  return docs.map(toCourseSummaryDTO);
}

/** Full course for its owner, or null when it does not exist. */
export async function getCourseForOwner(
  instructorId: string,
  courseId: string,
): Promise<CourseDTO | null> {
  const doc = await Course.findOne({
    _id: toCourseObjectId(courseId),
    instructorId,
  }).lean<LeanCourse>();

  return doc ? toCourseDTO(doc) : null;
}

/** Creates a draft, or updates one that is still editable. */
export async function saveDraft(params: {
  instructorId: string;
  courseId?: string;
  input: CourseDraftInput;
}): Promise<CourseDTO> {
  const { instructorId, courseId, input } = params;

  if (!courseId) {
    const media = await planMedia({ input, existing: null, userId: instructorId });
    const created = await Course.create({
      instructorId,
      ...toFields(input, media),
      status: "draft",
    });
    const doc = await Course.findById(created._id).lean<LeanCourse>();

    if (!doc) {
      throw new AppError(500, "COURSE_WRITE_FAILED", "Could not save your course.");
    }
    discardPlannedMedia(media);
    return toCourseDTO(doc);
  }

  const _id = toCourseObjectId(courseId);
  const existing = await Course.findOne({ _id, instructorId }).lean<LeanCourse>();

  if (!existing) {
    throw new AppError(404, "COURSE_NOT_FOUND", "This course could not be found.");
  }
  // Rejected courses reopen for edits; anything in review or published is locked.
  if (!isEditable(existing.status)) {
    throw new AppError(
      409,
      "COURSE_LOCKED",
      "This course is under review or published and can no longer be edited.",
    );
  }

  const media = await planMedia({ input, existing, userId: instructorId });
  const updated = await Course.findOneAndUpdate(
    { _id, instructorId, status: { $in: EDITABLE } },
    { $set: toFields(input, media) },
    { new: true },
  ).lean<LeanCourse>();

  if (!updated) {
    throw new AppError(
      409,
      "COURSE_LOCKED",
      "This course is under review or published and can no longer be edited.",
    );
  }

  discardPlannedMedia(media);
  return toCourseDTO(updated);
}

/**
 * Deletes a draft or rejected course and audits it in the same transaction.
 * Submitted and published courses are locked so their history stays intact.
 */
export async function deleteCourse(params: {
  instructorId: string;
  courseId: string;
}): Promise<void> {
  const { instructorId, courseId } = params;
  const _id = toCourseObjectId(courseId);
  const existing = await Course.findOne({ _id, instructorId }).lean<LeanCourse>();

  if (!existing) {
    throw new AppError(404, "COURSE_NOT_FOUND", "This course could not be found.");
  }
  if (!isEditable(existing.status)) {
    throw new AppError(
      409,
      "COURSE_LOCKED",
      "Courses under review or published can't be deleted.",
    );
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const removed = await Course.findOneAndDelete(
        { _id, instructorId, status: { $in: EDITABLE } },
        { session },
      ).lean<LeanCourse>();

      if (!removed) {
        throw new AppError(
          409,
          "COURSE_LOCKED",
          "Courses under review or published can't be deleted.",
        );
      }

      await writeAuditLog(
        {
          actorId: instructorId,
          action: "course.deleted",
          targetType: "course",
          targetId: String(_id),
          metadata: {
            title: removed.title,
            status: removed.status,
            lessonCount: removed.sections.reduce(
              (total, section) => total + section.lessons.length,
              0,
            ),
          },
        },
        session,
      );
    });
  } finally {
    await session.endSession();
  }

  discardCourseMedia(existing);
}
