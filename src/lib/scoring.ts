/**
 * Pure destination scoring + filtering against the STATIC catalog. Zero React.
 *
 * Extracted from the old `usePlanner` god object. `computeOptions` is the single
 * place where collected wizard inputs turn into a ranked Results set, so the
 * "which inputs actually drive output" question has exactly one answer here.
 */

import { DESTS, DEST_BASE, type Destination } from "./data";

/** Inputs that affect which destinations surface (and in what order). */
export interface ScoringInput {
  general: string[];
  weather: string[];
  intensity: number;
  budget: number;
  /** Inclusive nights range from the optional "Trip length" filter. */
  daysMin: number;
  daysMax: number;
}

/** Trip-length presets (chip row in "More filters"). Map to dest.nights. */
export const TRIP_LENGTHS: { label: string; min: number; max: number }[] = [
  { label: "Any", min: 0, max: 99 },
  { label: "Weekend", min: 0, max: 3 },
  { label: "3–4 nights", min: 3, max: 4 },
  { label: "5–7 nights", min: 5, max: 7 },
  { label: "1 week+", min: 7, max: 99 },
];

/**
 * Budget tolerance: a destination's seed base may exceed the per-person budget
 * by up to this factor and still surface (so a $400 budget tolerates ~$520).
 * Keeps the 6-destination catalog from going empty on tight budgets.
 */
export const BUDGET_TOLERANCE = 1.3;

interface Scored {
  d: Destination;
  sc: number;
}

function score(d: Destination, input: ScoringInput): number {
  let sc = 0;
  input.general.forEach((v) => {
    if (d.tags.includes(v)) sc += 2;
  });
  if (input.weather.includes(d.weather)) sc += 1;
  sc += 2 - Math.min(2, Math.abs(d.intensity - input.intensity));
  return sc;
}

/**
 * Score every destination, apply the optional budget + trip-length filters
 * against the static catalog, and return the top 3.
 *
 * Filters are applied as a soft funnel: if budget/length knock the catalog
 * below 3 results, we fall back to the closest-by-score matches so Results is
 * never empty. `widened` signals that fallback to the UI.
 */
export function computeOptions(input: ScoringInput): {
  options: Destination[];
  widened: boolean;
} {
  const scored: Scored[] = DESTS.map((d) => ({ d, sc: score(d, input) })).sort(
    (a, b) => b.sc - a.sc,
  );

  const passesBudget = (d: Destination) =>
    DEST_BASE[d.key] <= input.budget * BUDGET_TOLERANCE;
  const passesLength = (d: Destination) =>
    d.nights >= input.daysMin && d.nights <= input.daysMax;

  const filtered = scored.filter((x) => passesBudget(x.d) && passesLength(x.d));

  if (filtered.length >= 3) {
    return { options: filtered.slice(0, 3).map((x) => x.d), widened: false };
  }

  // Too few matches: keep what passed, then backfill with the next-best scored
  // destinations (ignoring the filters) so the user always sees three options.
  const chosen = filtered.map((x) => x.d);
  for (const x of scored) {
    if (chosen.length >= 3) break;
    if (!chosen.includes(x.d)) chosen.push(x.d);
  }
  return { options: chosen.slice(0, 3), widened: filtered.length < 3 };
}
