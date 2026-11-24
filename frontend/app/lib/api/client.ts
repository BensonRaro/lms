import axios, { type AxiosError } from "axios";
import { API_URL } from "./config";

/** Shape every backend error uses: `{ error: { code, message } }`. */
type ErrorEnvelope = { error?: { code?: string; message?: string } };

/**
 * Normalised API failure so components never branch on Axios internals.
 * `status` is 0 when the request never reached the server.
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Single axios instance for all business data. Sends the better-auth session
 * cookie and unwraps the backend's error envelope into an `ApiError`.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorEnvelope>) => {
    // A cancelled request isn't a failure — TanStack Query discards it, so
    // pass the original error through instead of turning it into an ApiError.
    if (axios.isCancel(error)) {
      throw error;
    }

    if (!error.response) {
      throw new ApiError(
        "NETWORK_ERROR",
        "We couldn't reach the server. Check your connection and try again.",
        0,
      );
    }

    const envelope = error.response.data;

    throw new ApiError(
      envelope?.error?.code ?? "REQUEST_FAILED",
      envelope?.error?.message ?? "Something went wrong. Please try again.",
      error.response.status,
    );
  },
);

/** Message to show for a failed request, falling back for unknown errors. */
export function apiErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
