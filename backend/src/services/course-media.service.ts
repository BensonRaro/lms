import {
  getCloudinaryAsset,
  type CloudinaryDeliveryType,
  type CloudinaryResourceType,
} from "../lib/cloudinary/index.js";
import { mediaPrefix, type MediaKind } from "../lib/cloudinary/media-path.js";
import type { LeanCourse, MediaAsset } from "../lib/course-dto.js";
import { AppError } from "../middlewares/error.js";
import type { CourseDraftInput } from "../validators/course.validator.js";

/** Cloudinary target for each media kind, shared with the cleanup service. */
export const MEDIA_RULES: Record<
  MediaKind,
  { resourceType: CloudinaryResourceType; deliveryType: CloudinaryDeliveryType }
> = {
  thumbnail: { resourceType: "image", deliveryType: "upload" },
  video: { resourceType: "video", deliveryType: "authenticated" },
};

/** Which stored assets a save detaches, so they can be deleted afterwards. */
export type MediaPlan = {
  thumbnail: MediaAsset | null;
  /** Indexed by [sectionIndex][lessonIndex]; null clears the lesson video. */
  videos: (MediaAsset | null)[][];
  removedThumbnail: string | null;
  removedVideos: string[];
};

function isSameMedia(inputId: string | null, existing: MediaAsset | null) {
  return inputId === (existing?.publicId ?? null);
}

/**
 * Confirms an upload exists and belongs to this instructor. Ownership is part
 * of the public id, so a known id from another account is rejected outright.
 */
async function verifyMedia(
  kind: MediaKind,
  userId: string,
  publicId: string,
): Promise<MediaAsset> {
  if (!publicId.startsWith(mediaPrefix(kind, userId))) {
    throw new AppError(
      400,
      "MEDIA_NOT_OWNED",
      "That upload belongs to another account.",
    );
  }

  const lookup = await getCloudinaryAsset({ ...MEDIA_RULES[kind], publicId });

  if (lookup.status === "missing") {
    throw new AppError(
      400,
      "MEDIA_NOT_FOUND",
      "We couldn't find that upload. Please upload the file again.",
    );
  }

  if (lookup.status === "unavailable") {
    throw new AppError(
      503,
      "MEDIA_UNAVAILABLE",
      "We couldn't verify that upload right now. Please save again in a moment.",
    );
  }

  // The server's version wins: it decides the delivered URL, not the client.
  return { publicId: lookup.asset.publicId, version: lookup.asset.version };
}

/**
 * Compares the draft's media ids with what is stored. Unchanged assets are
 * reused without an API call; new ones are verified; dropped ones are queued
 * for cleanup.
 */
export async function planMedia(params: {
  input: CourseDraftInput;
  existing: LeanCourse | null;
  userId: string;
}): Promise<MediaPlan> {
  const { input, existing, userId } = params;

  const previousVideos = new Map<string, MediaAsset>();
  for (const section of existing?.sections ?? []) {
    for (const lesson of section.lessons) {
      if (lesson.video) {
        previousVideos.set(String(lesson._id), lesson.video);
      }
    }
  }

  const verified = new Map<string, Promise<MediaAsset>>();
  const verify = (kind: MediaKind, publicId: string) => {
    const cacheKey = `${kind}:${publicId}`;
    let pending = verified.get(cacheKey);

    if (!pending) {
      pending = verifyMedia(kind, userId, publicId);
      verified.set(cacheKey, pending);
    }

    return pending;
  };

  const previousThumbnail = existing?.thumbnail ?? null;
  let thumbnail = previousThumbnail;
  let removedThumbnail: string | null = null;

  if (!isSameMedia(input.thumbnailPublicId, previousThumbnail)) {
    removedThumbnail = previousThumbnail?.publicId ?? null;
    thumbnail = input.thumbnailPublicId
      ? await verify("thumbnail", input.thumbnailPublicId)
      : null;
  }

  const removedVideos: string[] = [];

  // A deleted lesson or section never reaches the comparison below, so its
  // video has to be queued here or it would stay in Cloudinary forever.
  const keptLessonIds = new Set<string>();
  for (const section of input.sections) {
    for (const lesson of section.lessons) {
      if (lesson.id) {
        keptLessonIds.add(lesson.id);
      }
    }
  }
  for (const [lessonId, video] of previousVideos) {
    if (!keptLessonIds.has(lessonId)) {
      removedVideos.push(video.publicId);
    }
  }

  const videos = await Promise.all(
    input.sections.map((section) =>
      Promise.all(
        section.lessons.map(async (lesson) => {
          const previous = lesson.id ? (previousVideos.get(lesson.id) ?? null) : null;

          if (isSameMedia(lesson.videoPublicId, previous)) {
            return previous;
          }

          if (previous) {
            removedVideos.push(previous.publicId);
          }

          return lesson.videoPublicId
            ? verify("video", lesson.videoPublicId)
            : null;
        }),
      ),
    ),
  );

  return { thumbnail, videos, removedThumbnail, removedVideos };
}
