/**
 * Pure URL normalization for Discourse origins.
 *
 * Kept free of Vite-only runtime (no `import.meta`) and dropped into the app
 * bundle harmlessly, so the same function can be imported by Node-based
 * tooling (e.g. Playwright's CommonJS runner) and by the browser build.
 */

/**
 * Normalize a candidate origin into a concrete http/https URL, or `null` when
 * the value is absent, malformed, uses a non-web scheme, or is otherwise not
 * safe to hand to a browser as a link target.
 *
 * Identity of `value`: any non-string, blank string, unparseable string, or
 * non-`http:`/`https:` scheme resolves to `null`.
 */
export function normalizeDiscourseUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;

  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return parsed.toString();
}
