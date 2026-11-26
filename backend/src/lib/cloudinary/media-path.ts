/**
 * Every uploaded asset lives under a path that names its purpose and its
 * owner, so a lookup can prove both. Ids are random UUIDs, never user input.
 */
export type MediaKind = "thumbnail" | "video";

const FOLDERS: Record<MediaKind, string> = {
  thumbnail: "course-thumbnails",
  video: "lesson-videos",
};

export function mediaFolder(kind: MediaKind) {
  return `lms/${FOLDERS[kind]}`;
}

/** Prefix every upload of this kind by this user must start with. */
export function mediaPrefix(kind: MediaKind, userId: string) {
  return `${mediaFolder(kind)}/${userId}/`;
}

export function mediaPublicId(kind: MediaKind, userId: string, id: string) {
  return `${mediaPrefix(kind, userId)}${id}`;
}

const KINDS_BY_FOLDER: Record<string, MediaKind> = {
  "course-thumbnails": "thumbnail",
  "lesson-videos": "video",
};

/**
 * Reads purpose and owner back out of a public id the app generated. Used to
 * pick the right Cloudinary resource type when discarding an upload.
 */
export function parseMediaPublicId(
  publicId: string,
): { kind: MediaKind; userId: string } | null {
  const [root, folder, userId, ...rest] = publicId.split("/");
  const kind = folder ? KINDS_BY_FOLDER[folder] : undefined;

  if (root !== "lms" || !kind || !userId || !rest[0]) {
    return null;
  }

  return { kind, userId };
}
