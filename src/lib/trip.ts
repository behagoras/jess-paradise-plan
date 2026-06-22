/**
 * Pure date/window helpers for turning the wizard's `when` choice and the REAL
 * flight itinerary (Travelpayouts `departure_at` / `return_at`) into the strings
 * the hotel search and the screens need. Zero React, zero IO.
 *
 * Travelpayouts returns full ISO8601-with-offset timestamps, e.g.
 * "2026-07-03T14:59:00-05:00". The calendar date we want is exactly the leading
 * "YYYY-MM-DD" — we slice it rather than `new Date(...)` so the displayed day
 * never drifts across a timezone boundary.
 */

/**
 * Wizard departure city → IATA, for the flight-search origin. Mirrors the
 * server-side map in `convex/travelpayouts.ts` (kept client-side here because
 * the Convex action module can't be imported into the browser bundle).
 */
export const CITY_TO_IATA: Record<string, string> = {
  "Mexico City": "MEX",
  Monterrey: "MTY",
  Guadalajara: "GDL",
  "New York": "JFK",
  "Los Angeles": "LAX",
};

const CATALOG_CODE_FIXUPS: Record<string, string> = {
  CDMX: "MEX", // Mexico City written in local shorthand
};

/**
 * Normalize a catalog `from`/`to` code into a real IATA code. Returns null for
 * codes that are NOT a flight route (the cruise's "Port"), so the caller can
 * hide that candidate. Mirrors `normalizeIata` in `convex/travelpayouts.ts`.
 */
export function normalizeIata(code: string): string | null {
  if (!code) return null;
  if (code === "Port") return null; // cruise embarkation, not an airport
  return CATALOG_CODE_FIXUPS[code] ?? code;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "Jul"/"Aug"/"Sep"/"Dec" → month index (0-based). null for non-months. */
function whenMonthIndex(when: string): number | null {
  const i = MONTHS.indexOf(when);
  return i >= 0 ? i : null;
}

/**
 * Map the wizard's `when` chip to a `departureAt` for the flight search.
 * "Flexible" / "This summer" → undefined (let TP pick the cheapest upcoming
 * date). A named month → the next "YYYY-MM" at or after the current month.
 */
export function whenToDeparture(
  when: string,
  now: Date = new Date()
): string | undefined {
  const m = whenMonthIndex(when);
  if (m === null) return undefined;
  let year = now.getFullYear();
  // If the chosen month is already behind us this year, roll to next year.
  if (m < now.getMonth()) year += 1;
  return `${year}-${String(m + 1).padStart(2, "0")}`;
}

/** "2026-07-03T14:59:00-05:00" → "2026-07-03" (timezone-safe slice). */
function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

/** Whole-day count between two YYYY-MM-DD dates (UTC midnight, drift-safe). */
function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(checkIn + "T00:00:00Z");
  const b = Date.parse(checkOut + "T00:00:00Z");
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** Add `n` days to a YYYY-MM-DD date, returning YYYY-MM-DD. */
function addDays(date: string, n: number): string {
  const t = Date.parse(date + "T00:00:00Z");
  return new Date(t + n * 86_400_000).toISOString().slice(0, 10);
}

export interface StayWindow {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  /**
   * REAL nights between the outbound and the actual return leg. Null when the
   * itinerary does not support a real overnight count — i.e. a same-day round
   * trip (return on the outbound day) or a one-way fare with no return leg.
   * The UI must NOT display an invented nights number when this is null.
   */
  nights: number | null;
}

/**
 * Derive the hotel stay window from a REAL flight offer. `checkIn` is the real
 * outbound date; `checkOut` is the real return date when the itinerary has one
 * that is at least one night later, else `fallbackNights` after check-in so the
 * hotel search still has a valid range to query.
 *
 * `nights` reports the TRUTH, never the fallback: it is the real overnight count
 * derived from the actual outbound→return dates, or null when the fare cannot
 * support a real count (same-day round trip, or one-way with no return). This
 * keeps the screens from ever printing a nights number the itinerary doesn't
 * back up (the old behaviour showed e.g. "3 nights · Jul 3 – Jul 3").
 */
export function windowFromFlight(
  flight: { departureAt: string; returnAt: string | null },
  fallbackNights: number
): StayWindow {
  const checkIn = isoDate(flight.departureAt);
  if (flight.returnAt) {
    const checkOut = isoDate(flight.returnAt);
    const nights = nightsBetween(checkIn, checkOut);
    // A real return at least one night out: report the real nights.
    if (nights > 0) return { checkIn, checkOut, nights };
    // Same-day round trip: real return exists but is 0 nights. Use a fallback
    // checkout so a hotel query still has a range, but report nights as null
    // so the UI never claims an overnight count the fare doesn't support.
    return { checkIn, checkOut: addDays(checkIn, fallbackNights), nights: null };
  }
  // One-way / no return leg: no real overnight count to show.
  return { checkIn, checkOut: addDays(checkIn, fallbackNights), nights: null };
}

/** "2026-07-03T14:59:00-05:00" → "Jul 3" (timezone-safe). */
export function monthLabel(iso: string): string {
  const date = isoDate(iso);
  const [, mm, dd] = date.split("-");
  const mi = Number(mm) - 1;
  if (mi < 0 || mi > 11) return date;
  return `${MONTHS[mi]} ${Number(dd)}`;
}
