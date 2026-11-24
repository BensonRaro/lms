import { randomUUID } from "node:crypto";
import {
  cloudinaryPublicConfig,
  cloudinaryUploadUrl,
  signCloudinaryParams,
  type CloudinaryDeliveryType,
  type CloudinaryResourceType,
} from "../lib/cloudinary/index.js";
import {
  mediaPublicId,
  type MediaKind,
} from "../lib/cloudinary/media-path.js";
import type { UploadSignInput } from "../validators/upload.validator.js";

export type UploadPurpose = UploadSignInput["purpose"];

type PurposeConfig = {
  kind: MediaKind;
  resourceType: CloudinaryResourceType;
  /** `authenticated` assets need a signed, expiring delivery URL. */
  deliveryType: CloudinaryDeliveryType;
  maxBytes: number;
  accept: readonly string[];
};

/**
 * What each upload kind is allowed to be. Thumbnails are public catalog
 * artwork; lesson videos stay authenticated until an enrolled learner is
 * granted a signed URL.
 */
const PURPOSES: Record<UploadPurpose, PurposeConfig> = {
  "course-thumbnail": {
    kind: "thumbnail",
    resourceType: "image",
    deliveryType: "upload",
    maxBytes: 5 * 1024 * 1024,
    accept: ["image/jpeg", "image/png", "image/webp"],
  },
  "lesson-video": {
    kind: "video",
    resourceType: "video",
    deliveryType: "authenticated",
    maxBytes: 100 * 1024 * 1024,
    accept: ["video/mp4", "video/webm", "video/quicktime"],
  },
};

/** Everything the browser needs to POST the file straight to Cloudinary. */
export interface UploadTicket {
  purpose: UploadPurpose;
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  signature: string;
  params: {
    timestamp: number;
    public_id: string;
    type: CloudinaryDeliveryType;
  };
  maxBytes: number;
  accept: readonly string[];
}

/**
 * Issues a one-shot signature for a direct browser upload. The secret never
 * leaves the server: the client only echoes the signed params back.
 */
export function createUploadTicket(
  userId: string,
  input: UploadSignInput,
): UploadTicket {
  const config = PURPOSES[input.purpose];
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    public_id: mediaPublicId(config.kind, userId, randomUUID()),
    type: config.deliveryType,
  };

  return {
    purpose: input.purpose,
    ...cloudinaryPublicConfig(),
    uploadUrl: cloudinaryUploadUrl(config.resourceType),
    signature: signCloudinaryParams(params),
    params,
    maxBytes: config.maxBytes,
    accept: config.accept,
  };
}
