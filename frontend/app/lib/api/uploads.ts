import { api } from "./client";

/** Upload kinds the backend signs. Mirrors `upload.validator.ts`. */
export type UploadPurpose = "course-thumbnail" | "lesson-video";

/** Mirrors `UploadTicket` on the backend. */
export type UploadTicket = {
  purpose: UploadPurpose;
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  signature: string;
  params: { timestamp: number; public_id: string; type: string };
  maxBytes: number;
  accept: string[];
};

/** The parts of Cloudinary's upload response this app stores and previews. */
export type UploadedMedia = {
  publicId: string;
  version: number;
  secureUrl: string;
  bytes: number;
  durationSeconds: number | null;
};

type UploadResponse = {
  public_id?: string;
  version?: number;
  secure_url?: string;
  bytes?: number;
  duration?: number;
  error?: { message?: string };
};

type UploadSuccess = UploadResponse & {
  public_id: string;
  version: number;
  secure_url: string;
};

function isUploadSuccess(body: UploadResponse): body is UploadSuccess {
  return (
    typeof body.public_id === "string" &&
    typeof body.version === "number" &&
    typeof body.secure_url === "string"
  );
}

export type UploadOptions = {
  onProgress?: (percent: number) => void;
  /** Abort to cancel an in-flight upload. */
  signal?: AbortSignal;
};

const TYPE_LABELS: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "video/mp4": "MP4",
  "video/webm": "WebM",
  "video/quicktime": "MOV",
};

export function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${Math.round(megabytes)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function acceptLabel(ticket: UploadTicket) {
  return ticket.accept
    .map((type) => TYPE_LABELS[type] ?? type)
    .join(", ");
}

async function requestTicket(purpose: UploadPurpose) {
  const response = await api.post<{ data: UploadTicket }>(
    "/api/uploads/sign",
    { purpose },
  );
  return response.data.data;
}

/**
 * Checks the pick before spending bandwidth. The signed ticket is the source
 * of truth for size and format, so this can never drift from the server.
 */
function preflight(file: File, ticket: UploadTicket) {
  if (file.size > ticket.maxBytes) {
    return `That file is ${formatFileSize(file.size)}. The limit is ${formatFileSize(ticket.maxBytes)}.`;
  }

  if (file.type && !ticket.accept.includes(file.type)) {
    return `Use ${acceptLabel(ticket)} files only.`;
  }

  return null;
}

/**
 * Uploads one file straight to Cloudinary with the ticket's signature.
 * XHR is used instead of fetch because only XHR reports upload progress.
 */
export async function uploadMedia(
  file: File,
  purpose: UploadPurpose,
  { onProgress, signal }: UploadOptions = {},
): Promise<UploadedMedia> {
  const ticket = await requestTicket(purpose);
  const problem = preflight(file, ticket);

  if (problem) {
    throw new Error(problem);
  }

  return new Promise<UploadedMedia>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", ticket.apiKey);
    for (const [key, value] of Object.entries(ticket.params)) {
      form.append(key, String(value));
    }
    form.append("signature", ticket.signature);

    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.open("POST", ticket.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      cleanup();

      let body: UploadResponse = {};
      try {
        body = JSON.parse(xhr.responseText) as UploadResponse;
      } catch {
        // Cloudinary answered with something that isn't JSON; treated as failure.
      }

      if (
        xhr.status < 200 ||
        xhr.status >= 300 ||
        !isUploadSuccess(body)
      ) {
        reject(new Error(body.error?.message ?? "The upload failed. Please try again."));
        return;
      }

      resolve({
        publicId: body.public_id,
        version: body.version,
        secureUrl: body.secure_url,
        bytes: body.bytes ?? file.size,
        durationSeconds:
          typeof body.duration === "number" ? body.duration : null,
      });
    };

    xhr.onerror = () => {
      cleanup();
      reject(
        new Error(
          "The upload was interrupted. Check your connection and try again.",
        ),
      );
    };

    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload cancelled.", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
    xhr.send(form);
  });
}
