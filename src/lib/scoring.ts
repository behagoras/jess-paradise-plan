/**
 * Pure destination scoring + cost-model + band/shuffle. Zero React, zero IO.
 *
 * Phase 1 of the reverse-search rebuild inverts the data flow: the candidate
 * source is now the live cheapest-anywhere FEED (one real round-trip flight per
 * destination), and this module's job is to (a) score how well each candidate
 * matches the wizard vibe, (b) assemble an honest cost model from the real
 * lines we have, and (c) band + shuffle so two "surprise me" runs differ in
 * order without ever placing a worse match/value above a clearly better one.
 *
 * `scoreVibe` reuses the same tag/weather/intensity math the old catalog scorer
 * used; `computeOptions` is kept for any remaining catalog-only callers but is
 * no longer the candidate source for `surprise()`.
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

/**
 * Vibe score for one destination against the wizard inputs: +2 per matched
 * tag, +1 for matching weather, +(0..2) for intensity proximity. Higher is a
 * better match. PURE.
 *
 * This is meaningful only for CURATED catalog destinations, which carry real
 * tags/weather/intensity. A live cheapest-anywhere destination with no curated
 * entry has NO vibe data in Phase 1 - do NOT call this on a synthetic card and
 * pretend the zeros are a real (poor) match. Callers must band such cards into a
 * separate "unknown" rank (see `bandAndShuffle` usage in usePlanner, band -1) so
 * they read as "vibe not known yet", not "worst match".
 */
export function scoreVibe(d: Destination, input: ScoringInput): number {
  let sc = 0;
  input.general.forEach((v) => {
    if (d.tags.includes(v)) sc += 2;
  });
  if (input.weather.includes(d.weather)) sc += 1;
  sc += 2 - Math.min(2, Math.abs(d.intensity - input.intensity));
  return sc;
}

const score = scoreVibe;

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

// ---------------------------------------------------------------------------
// Cost model (Phase 1: flight-only; architected so hotel/activity plug in)
// ---------------------------------------------------------------------------

/**
 * How trustworthy a price is, surfaced so the UI never presents a cached number
 * as a bookable quote.
 *  - "live"       - a real-time GDS quote (no source wired yet in Phase 1).
 *  - "indicative" - a recent real fare that may be a few hours stale.
 *  - "cached"     - read straight from the Travelpayouts data cache (what we
 *                   actually have today: cheapest-anywhere + cache.json).
 *  - "estimate"   - a derived/blended figure (never used for fabricated data).
 */
export type CostConfidence = "live" | "indicative" | "cached" | "estimate";

/**
 * The honest cost of a trip, per person, broken into the lines we actually
 * have. Phase 1 only fills `flight` (the real round-trip fare from the feed);
 * `hotel` and `activity` are optional so Phase 2 (LiteAPI/Viator) can populate
 * them without changing this shape. `totalPerPerson` is the sum of the present
 * components - NEVER padded with an estimate for a missing line.
 */
export interface CostModel {
  components: { flight: number; hotel?: number; activity?: number };
  totalPerPerson: number;
  confidence: CostConfidence;
}

/**
 * Assemble a CostModel from the real per-person lines we have. PURE. Only the
 * components passed in (non-undefined) are summed; a missing line is omitted,
 * not estimated. Travelpayouts numbers are cache reads → default "cached".
 */
export function buildCostModel(
  components: { flight: number; hotel?: number; activity?: number },
  confidence: CostConfidence = "cached"
): CostModel {
  const totalPerPerson =
    components.flight +
    (components.hotel ?? 0) +
    (components.activity ?? 0);
  return { components, totalPerPerson, confidence };
}

// ---------------------------------------------------------------------------
// Banding + shuffle (the non-deterministic "surprise me" promise)
// ---------------------------------------------------------------------------

/**
 * Split `items` into score bands and shuffle WITHIN each band, then concatenate
 * the bands best-first. The result is a different-but-equally-valid ordering on
 * every call (driven by `rng`, default `Math.random`): a clearly worse match or
 * value is never lifted above a clearly better one, but comparable options vary
 * run-to-run - which is exactly the "surprise me" contract.
 *
 * `bandOf` maps an item to an integer band rank where HIGHER = better. Callers
 * coarsen the raw score into a few bands (e.g. vibe-matched curated dests vs.
 * unknown synthetic dests) so the shuffle has room to vary order. PURE given a
 * deterministic `rng`; `Math.random` is fine in app code.
 */
export function bandAndShuffle<T>(
  items: T[],
  bandOf: (item: T) => number,
  rng: () => number = Math.random
): T[] {
  // Group by band rank.
  const byBand = new Map<number, T[]>();
  for (const it of items) {
    const b = bandOf(it);
    const arr = byBand.get(b);
    if (arr) arr.push(it);
    else byBand.set(b, [it]);
  }
  // Fisher–Yates within each band.
  const shuffle = (arr: T[]): T[] => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // Bands best-first (highest rank first), shuffled inside.
  return [...byBand.keys()]
    .sort((a, b) => b - a)
    .flatMap((band) => shuffle(byBand.get(band)!));
}
