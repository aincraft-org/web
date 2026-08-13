/**
 * Discourse integration configuration for the `/forum` launch page.
 *
 * The page never embeds the community inside an iframe. Instead it renders a
 * safe, external call-to-action that opens the Discourse instance in a new
 * tab (see `src/forum/ForumApp.tsx`). The target origin is supplied at build
 * or deploy time via `VITE_DISCOURSE_URL` and must be an absolute http/https
 * URL. Any other value is treated as "not configured" so the page degrades to
 * an explicit setup state instead of emitting an unsafe link.
 */

import { normalizeDiscourseUrl } from './normalizeDiscourseUrl';

export { normalizeDiscourseUrl };

/** Env var holding the community origin. Kept out of any committed file. */
const DISCOURSE_ENV_KEY = 'VITE_DISCOURSE_URL';

/**
 * Integration-test seam: lets an e2e test render the configured state without
 * touching build-time env. Not part of the production contract — a page with
 * this global set renders the same CTA as a build that set the env var.
 */
const OVERRIDE_KEY = '__AZOTHMC_DISCOURSE_URL__';

/**
 * The Discourse origin players should be sent to, or `null` when it is not
 * configured. Reads `VITE_DISCOURSE_URL` (http/https only). Prefers an
 * explicit integration-test override on `window` when present.
 */
export function getDiscourseUrl(): string | null {
  const override =
    typeof window !== 'undefined'
      ? (window as unknown as Record<string, unknown>)[OVERRIDE_KEY]
      : undefined;
  if (typeof override === 'string') return normalizeDiscourseUrl(override);

  const fromEnv = import.meta.env?.[DISCOURSE_ENV_KEY];
  return normalizeDiscourseUrl(fromEnv);
}
