/**
 * Base URL of the Express API. Kept free of axios so the auth client can read
 * it without pulling the HTTP client into every page's bundle.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";
