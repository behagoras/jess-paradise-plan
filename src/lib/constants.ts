/**
 * Shared, framework-agnostic constants.
 *
 * Plain TS only — NO Node/React/edge-incompatible imports — so this module is
 * safe to import from both the Edge middleware (`src/middleware.ts`) and client
 * code (`src/lib/useGuestId.ts`).
 */

/** Cookie name for the anonymous guest capability token. */
export const GUEST_COOKIE = "pp_guest";
