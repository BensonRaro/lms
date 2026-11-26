import { destroyCloudinaryAssets } from "../lib/cloudinary/index.js";
import {
  mediaPrefix,
  parseMediaPublicId,
  type MediaKind,
} from "../lib/cloudinary/media-path.js";
import type { LeanCourse } from "../lib/course-dto.js";
import { AppError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { MEDIA_RULES, type MediaPlan } from "./course-media.service.js";

/**
 * Deletes only assets no course still points at. Two courses can legitimately
 * share an id (an instructor copying a public id), so a blind destroy could
 * break the other course's cover.
 */
async function discardUnreferencedMedia(
  kind: MediaKind,
  publicIds: (string | null)[],
) {
  const ids = publicIds.filter((id): id is string => Boolean(id));

  if (ids.length === 0) {
    return;
  }

  const path =
    kind === "thumbnail"
      ? "thumbnail.publicId"
      : "sections.lessons.video.publicId";

  let unused: string[];

  try {
    const checks = await Promise.all(
      ids.map(async (publicId) =>
        (await Course.exists({ [path]: publicId })) ? null : publicId,
      ),
    );
    unused = checks.filter((id): id is string => Boolean(id));
  } catch {
    // A lookup failure leaves the asset in place; an orphan is harmless.
    return;
  }

  await destroyCloudinaryAssets({ ...MEDIA_RULES[kind], publicIds: unused });
}

/**
 * Deletes uploads the editor dropped before they were saved. Ids a course
 * still points at are skipped, so a saved asset is only ever removed by the
 * save that actually detached it — never by an abandoned edit.
 */
export async function discardOwnedUploads(
  userId: string,
  publicIds: string[],
) {
  const byKind: Record<MediaKind, string[]> = { thumbnail: [], video: [] };

  for (const publicId of publicIds) {
    const parsed = parseMediaPublicId(publicId);

    if (!parsed || !publicId.startsWith(mediaPrefix(parsed.kind, userId))) {
      throw new AppError(
        400,
        "MEDIA_NOT_OWNED",
        "That upload belongs to another account.",
      );
    }

    byKind[parsed.kind].push(publicId);
  }

  await Promise.all([
    discardUnreferencedMedia("thumbnail", byKind.thumbnail),
    discardUnreferencedMedia("video", byKind.video),
  ]);
}

/**
 * Deletes replaced or removed uploads. Best-effort by design: an orphan in
 * Cloudinary is harmless, while failing the user's save would not be.
 */
export async function discardPlannedMedia(plan: MediaPlan) {
  await Promise.all([
    discardUnreferencedMedia("thumbnail", [plan.removedThumbnail]),
    discardUnreferencedMedia("video", plan.removedVideos),
  ]);
}

/** Deletes everything a removed course owned, unless another course uses it. */
export async function discardCourseMedia(course: LeanCourse) {
  const videos = course.sections.flatMap((section) =>
    section.lessons.flatMap((lesson) =>
      lesson.video ? [lesson.video.publicId] : [],
    ),
  );

  await Promise.all([
    discardUnreferencedMedia("thumbnail", [course.thumbnail?.publicId ?? null]),
    discardUnreferencedMedia("video", videos),
  ]);
}
