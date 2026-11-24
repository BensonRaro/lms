import { createHash } from "node:crypto";
import { env } from "../env.js";

export type CloudinaryResourceType = "image" | "video" | "raw";
export type CloudinaryDeliveryType = "upload" | "authenticated";

/**
 * Server-only Cloudinary configuration. Env validation fails fast at startup,
 * so these are always present here — and the API secret never leaves the server.
 */
const config = {
  cloudName: env.CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
} as const;

const API_ROOT = `https://api.cloudinary.com/v1_1/${config.cloudName}`;

function basicAuth() {
  return `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}`;
}

/** Direct-upload endpoint the browser posts the signed file to. */
export function cloudinaryUploadUrl(resourceType: CloudinaryResourceType) {
  return `${API_ROOT}/${resourceType}/upload`;
}

/** Public values a signed-upload response may include. */
export function cloudinaryPublicConfig() {
  return { cloudName: config.cloudName, apiKey: config.apiKey };
}

/**
 * Signs the parameters of a direct upload. Cloudinary hashes the alphabetically
 * sorted `key=value` pairs followed by the API secret (SHA-1) — the client must
 * post every signed parameter back exactly as received.
 */
export function signCloudinaryParams(
  params: Record<string, string | number>,
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(`${toSign}${config.apiSecret}`)
    .digest("hex");
}

export type CloudinaryConnection =
  | { ok: true; cloudName: string }
  | { ok: false; cloudName: string; status: number };

/**
 * Verifies the configured credentials with the Admin API ping endpoint. Used
 * by startup checks and diagnostics; it does not read or modify any assets.
 */
export async function checkCloudinaryConnection(): Promise<CloudinaryConnection> {
  const response = await fetch(`${API_ROOT}/ping`, {
    headers: { Authorization: basicAuth() },
    signal: AbortSignal.timeout(10_000),
  });

  return response.ok
    ? { ok: true, cloudName: config.cloudName }
    : { ok: false, cloudName: config.cloudName, status: response.status };
}

export type CloudinaryAsset = {
  publicId: string;
  version: number;
  resourceType: string;
  deliveryType: string;
};

/**
 * Lookups are tri-state on purpose: a missing asset means the caller sent a
 * stale id (client error), while `unavailable` is an infrastructure problem.
 */
export type CloudinaryAssetLookup =
  | { status: "found"; asset: CloudinaryAsset }
  | { status: "missing" }
  | { status: "unavailable" };

type AssetEnvelope = {
  public_id?: string;
  version?: number;
  resource_type?: string;
  type?: string;
};

/** Reads one asset by id, so uploads are verified instead of trusted. */
export async function getCloudinaryAsset(params: {
  resourceType: CloudinaryResourceType;
  deliveryType: CloudinaryDeliveryType;
  publicId: string;
}): Promise<CloudinaryAssetLookup> {
  const url = `${API_ROOT}/resources/${params.resourceType}/${params.deliveryType}/${encodeURIComponent(params.publicId)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Authorization: basicAuth() },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 404) {
    return { status: "missing" };
  }

  if (!response.ok) {
    return { status: "unavailable" };
  }

  const body = (await response.json()) as AssetEnvelope;

  if (
    typeof body.public_id !== "string" ||
    typeof body.version !== "number"
  ) {
    return { status: "unavailable" };
  }

  return {
    status: "found",
    asset: {
      publicId: body.public_id,
      version: body.version,
      resourceType: body.resource_type ?? params.resourceType,
      deliveryType: body.type ?? params.deliveryType,
    },
  };
}

/**
 * Deletes assets that are no longer referenced. Cleanup is best-effort: a
 * failure only leaves an orphan in Cloudinary, it must never fail the request.
 */
export async function destroyCloudinaryAssets(params: {
  resourceType: CloudinaryResourceType;
  deliveryType: CloudinaryDeliveryType;
  publicIds: string[];
}): Promise<boolean> {
  if (params.publicIds.length === 0) {
    return true;
  }

  try {
    const body = new URLSearchParams();
    for (const publicId of params.publicIds) {
      body.append("public_ids[]", publicId);
    }

    const response = await fetch(
      `${API_ROOT}/resources/${params.resourceType}/${params.deliveryType}`,
      {
        method: "DELETE",
        headers: {
          Authorization: basicAuth(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: AbortSignal.timeout(10_000),
      },
    );

    return response.ok;
  } catch {
    return false;
  }
}

const THUMBNAIL_TRANSFORMATION = "c_fill,w_1280,h_720,f_auto,q_auto";

/** Catalog cover URL, built on the server so clients never supply URLs. */
export function cloudinaryThumbnailUrl(publicId: string, version?: number) {
  const versionSegment = version ? `v${version}/` : "";
  return `https://res.cloudinary.com/${config.cloudName}/image/upload/${THUMBNAIL_TRANSFORMATION}/${versionSegment}${publicId}`;
}
