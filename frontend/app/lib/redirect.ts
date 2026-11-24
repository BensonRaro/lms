const DEFAULT_PATH = "/";

/**
 * Reads the `?next=` destination used by auth pages. Only same-origin
 * absolute paths are accepted so the parameter can never act as an open
 * redirect; anything suspicious falls back to the home page.
 */
export function safeNext(search: string, fallback = DEFAULT_PATH) {
  const next = new URLSearchParams(search).get("next");

  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  // `//host` and `/\host` are protocol-relative URLs, not app paths.
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;

  return next;
}
