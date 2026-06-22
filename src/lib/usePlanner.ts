"use client";

import { useCallback, useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DESTS, type Destination } from "./data";
import {
  scoreVibe,
  buildCostModel,
  bandAndShuffle,
  BUDGET_TOLERANCE,
  type CostModel,
  type ScoringInput,
} from "./scoring";
import { computePricing, fmt, type Pricing } from "./pricing";
import {
  CITY_TO_IATA,
  normalizeIata,
  windowFromFlight,
  monthLabel,
  whenToDeparture,
} from "./trip";
import type { FlightOffer } from "@/convex/travelpayouts";
import type { HotelLiteOffer } from "@/convex/liteapi";
import type { ActivityOffer } from "@/convex/viator";
import type { DestVibe } from "@/convex/destIndex";

export { fmt };

export type Screen =
  | "landing"
  | "wizard"
  | "generating"
  | "results"
  | "detail"
  | "handoff";

/**
 * The wizard is a 2-step filter layer (see ADR in README):
 *   Step 1 - When + Activity intensity (the two inputs that drive output),
 *            plus an optional, collapsed "More filters" group.
 *   Step 2 - Preference + weather chips, then "Surprise me".
 *
 * Which fields actually affect Results lives in `src/lib/scoring.ts`; pricing
 * is built from the REAL offers fetched in `surprise()` and assembled in
 * `src/lib/pricing.ts`. `general`, `weather`, `intensity`, `budget`, and the
 * trip-length range (`daysMin`/`daysMax`) pick the candidate destinations;
 * `departure` → flight origin, `when` → departure date, `travelers` → adults,
 * and the `packages` include-chips decide which lines we fetch & price.
 */
export interface PlannerState {
  screen: Screen;
  step: number;
  departure: string;
  when: string;
  travelers: number;
  budget: number;
  packages: string[];
  vacation: string[];
  travelerTypes: string[];
  intensity: number;
  /** Inclusive trip-length range (nights) from the optional length filter. */
  daysMin: number;
  daysMax: number;
  general: string[];
  weather: string[];
  selected: number;
  genPhase: number;
}

/** Total visible wizard steps (Step 3 summary was removed). */
export const WIZARD_STEPS = 2;

const INITIAL: PlannerState = {
  screen: "landing",
  step: 1,
  departure: "Mexico City",
  when: "Flexible",
  travelers: 2,
  budget: 25000,
  packages: ["Flight", "Hotel", "Activity"],
  vacation: ["Friends", "Adventure"],
  travelerTypes: ["Adult"],
  intensity: 3,
  daysMin: 0,
  daysMax: 99,
  general: ["Beach", "Nightlife"],
  weather: ["Hot"],
  selected: 0,
  genPhase: 0,
};

/**
 * One real, fetched trip offer surfaced by the reverse search. The candidate
 * source is the cheapest-anywhere FEED, so `flight` is always a REAL round-trip
 * fare. `dest` is the curated catalog card when this destination's IATA matched
 * an entry (image/blurb/tags/weather/intensity), else an honest `syntheticDest`
 * with only the fields the API returned. `catalog` records which it is.
 *
 * The Results grid is flight-first: `hotel` and `activity` are NOT fetched for
 * every candidate (that would be ~60 external calls per search). They are filled
 * LAZILY for the SELECTED offer when Detail opens (see `enrichSelected`): `hotel`
 * is the REAL LiteAPI rate or null, `activity` is the REAL Viator product or
 * null (hide-missing on either). `enriched` flips true once that lazy fetch has
 * run for this offer so we don't re-fetch. `cost` is the per-person cost model
 * assembled from the lines we actually have, carrying a `confidence` label so
 * nothing reads as bookable.
 */
export interface RealOffer {
  dest: Destination;
  catalog: boolean;
  flight: FlightOffer;
  hotel: HotelLiteOffer | null;
  activity: ActivityOffer | null;
  enriched: boolean;
  cost: CostModel;
}

/** Snapshot of everything derived from state - the selected offer + pricing. */
export interface PlannerComputed extends Pricing {
  /** The fetched real offers (up to 30), or [] before/after an empty search. */
  offers: RealOffer[];
  /** No live trips matched the chosen origin/filters - show the widen hint. */
  empty: boolean;
  /** Search hit an error (e.g. token/network) - show the widen hint. */
  errored: boolean;
  /** Filters yielded few catalog matches; results were backfilled. */
  widened: boolean;
  /** The currently selected offer, or null when there are none. */
  offer: RealOffer | null;
  /** Real outbound / return date labels for the selected offer. */
  outDate: string | null;
  retDate: string | null;
  /** Real nights for the selected offer (from its flight window). */
  nights: number | null;
}

/** Upper bound on candidates pulled from the cheapest-anywhere feed. */
const MAX_RESULTS = 30;
/** Default hotel nights when a flight has no return leg to measure against. */
const FALLBACK_NIGHTS = 3;

export function usePlanner(scrollRef?: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<PlannerState>(INITIAL);
  const [offers, setOffers] = useState<RealOffer[]>([]);
  const [empty, setEmpty] = useState(false);
  const [errored, setErrored] = useState(false);
  const [widened, setWidened] = useState(false);

  // The cheapest-anywhere FEED is the candidate source - each row already
  // carries a real round-trip flight, so we never re-fetch a flight per dest.
  const searchDests = useAction(api.travelpayouts.searchCheapestDestinations);
  // Hotel (LiteAPI) + activity (Viator) are fetched LAZILY for the SELECTED
  // offer when Detail opens - NOT eagerly for all ~30 candidates.
  const searchHotelLite = useAction(api.liteapi.searchHotelLite);
  const searchActivity = useAction(api.viator.searchActivity);
  // The destination index supplies vibe (climate/geoTags) for ARBITRARY real
  // destinations so synthetic (non-catalog) candidates can be ranked, not just
  // dumped in the neutral band. It also lazily enqueues enrichment of unknowns.
  const getDestIndex = useAction(api.destIndex.getDestIndex);

  const scrollTop = useCallback(() => {
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
  }, [scrollRef]);

  const patch = useCallback(
    (p: Partial<PlannerState>) => setState((s) => ({ ...s, ...p })),
    []
  );

  const go = useCallback(
    (screen: Screen) => {
      patch({ screen });
      setTimeout(scrollTop, 0);
    },
    [patch, scrollTop]
  );

  const toggleArr = useCallback(
    (field: keyof PlannerState, v: string) =>
      setState((s) => {
        const a = s[field] as string[];
        return {
          ...s,
          [field]: a.includes(v) ? a.filter((x) => x !== v) : [...a, v],
        };
      }),
    []
  );

  // ---- navigation -------------------------------------------------------
  const startWizard = useCallback(() => {
    patch({ screen: "wizard", step: 1 });
    setTimeout(scrollTop, 0);
  }, [patch, scrollTop]);

  const goStep = useCallback(
    (n: number) => {
      patch({ step: n });
      setTimeout(scrollTop, 0);
    },
    [patch, scrollTop]
  );

  const prevStep = useCallback(() => {
    setState((s) => {
      if (s.step > 1) return { ...s, step: s.step - 1 };
      setTimeout(scrollTop, 0);
      return { ...s, screen: "landing" };
    });
  }, [scrollTop]);

  /**
   * Real REVERSE search (Phase 1). The candidate source is the live
   * cheapest-anywhere FEED - `searchCheapestDestinations` returns up to 30 real
   * round-trip fares from the origin, and THOSE are the candidates (we never
   * re-fetch a flight per destination). The 6-dest catalog is now only an
   * enrichment overlay: a candidate whose IATA matches a curated entry anchors
   * that card (image/blurb/tags/weather/intensity + a real vibe score); every
   * other candidate renders an honest `syntheticDest` with NO fabricated vibe.
   *
   * Candidates are deduped by destination IATA, filtered by total-trip budget
   * (the Results grid is flight-first → filter on the real round-trip flight
   * price), then banded by vibe and shuffled so the order varies run-to-run
   * without ever lifting a worse match/value above a clearly better one.
   *
   * IMPORTANT (Phase 2 architecture): we do NOT fetch hotel/activity for every
   * candidate here - that would be ~60 external calls per search. Offers leave
   * `surprise()` flight-only (`hotel`/`activity` null, `enriched:false`); the
   * full total-trip cost (flight+hotel+activity, per person, with a confidence
   * label) is completed LAZILY for the SELECTED offer in `enrichSelected` when
   * Detail opens. `genPhase` advances on real awaits; errors / no results land
   * on Results with the honest widen hint.
   */
  const surprise = useCallback(async () => {
    setState((s) => ({ ...s, screen: "generating", genPhase: 0, selected: 0 }));
    setTimeout(scrollTop, 0);
    setEmpty(false);
    setErrored(false);

    const origin = CITY_TO_IATA[state.departure] ?? "MEX";
    const scoringInput: ScoringInput = {
      general: state.general,
      weather: state.weather,
      intensity: state.intensity,
      budget: state.budget,
      daysMin: state.daysMin,
      daysMax: state.daysMax,
    };

    // Catalog enrichment overlay: real-destination IATA → curated card.
    const catalogByIata = new Map<string, Destination>();
    for (const d of DESTS) {
      const iata = normalizeIata(d.to);
      if (iata && !catalogByIata.has(iata)) catalogByIata.set(iata, d);
    }

    // "When" → real departure month constraint. A named month chip yields a
    // "YYYY-MM" that constrains the feed; "Flexible"/"This summer" → undefined
    // (let TP pick the cheapest upcoming date).
    const departureAt = whenToDeparture(state.when);

    try {
      // Phase 1 - the live cheapest-anywhere feed IS the candidate set, now
      // optionally constrained to the chosen departure month.
      const feed = await searchDests({
        origin,
        limit: MAX_RESULTS,
        departureAt,
        currency: "mxn",
      });
      setState((s) => ({ ...s, genPhase: 1 }));

      // Dedup by destination IATA first, then ask the destination index for
      // vibe (climate/geoTags) on the synthetic candidates. The index call is
      // non-blocking for unknowns (it lazily enqueues their enrichment so the
      // NEXT search ranks them) and returns whatever is already cached.
      const seen = new Set<string>();
      const dedupedFeed: FlightOffer[] = [];
      for (const flight of feed) {
        if (seen.has(flight.destination)) continue;
        seen.add(flight.destination);
        // Budget is the TOTAL TRIP; Phase 1 only has the real round-trip flight
        // price, so filter on that with the same tolerance the catalog used.
        if (flight.price > state.budget * BUDGET_TOLERANCE) continue;
        dedupedFeed.push(flight);
      }

      // Index lookup for the synthetic candidates' IATAs (curated ones already
      // have real vibe data from the catalog). One action call for the batch.
      const synthIatas = dedupedFeed
        .filter((f) => !catalogByIata.has(f.destination))
        .map((f) => f.destination);
      let idx: Record<string, DestVibe | null> = {};
      try {
        idx =
          synthIatas.length > 0 ? await getDestIndex({ iatas: synthIatas }) : {};
      } catch {
        idx = {}; // index unavailable → synthetic dests fall back to band -1
      }

      // Build candidates. Curated → real scoreVibe. Synthetic WITH index vibe →
      // scored by the same math (catalog:false but a real vibe band). Synthetic
      // with NO index data yet → band -1 ("vibe not known yet"), never faked.
      type Candidate = {
        dest: Destination;
        catalog: boolean;
        flight: FlightOffer;
        vibe: number;
        hasVibe: boolean; // true when this candidate has a real vibe to band on
      };
      const candidates: Candidate[] = dedupedFeed.map((flight) => {
        const curated = catalogByIata.get(flight.destination);
        if (curated) {
          return {
            dest: curated,
            catalog: true,
            flight,
            vibe: scoreVibe(curated, scoringInput),
            hasVibe: true,
          };
        }
        const vibe = idx[flight.destination];
        const hasVibe = !!vibe && (vibe.geoTags.length > 0 || vibe.climate != null);
        return {
          dest: syntheticDest(flight),
          catalog: false,
          flight,
          vibe: hasVibe ? scoreVibeFromIndex(vibe!, scoringInput) : 0,
          hasVibe,
        };
      });

      // Band so vibe-matched dests (curated OR index-enriched) rank above ones
      // we can't yet rank, but unknowns still appear; shuffle within each band
      // for run-to-run variation. Candidates with a real vibe band by their
      // score; candidates with NO vibe data yet → a single neutral "more
      // options" band (-1), never fabricated as a poor match.
      const ranked = bandAndShuffle(candidates, (c) =>
        c.hasVibe ? c.vibe : -1
      );

      // Flight-first: leave offers WITHOUT hotel/activity. Those are fetched
      // lazily for the SELECTED offer in `enrichSelected` (Detail), so a search
      // makes ~1 external call (the feed), not ~60. The Phase-1 cost model is
      // flight-only here (a cached TP fare → confidence "cached"); the full
      // flight+hotel+activity total is rebuilt on selection.
      setState((s) => ({ ...s, genPhase: 2 }));

      const built: RealOffer[] = ranked.map((c) => ({
        dest: c.dest,
        catalog: c.catalog,
        flight: c.flight,
        hotel: null,
        activity: null,
        enriched: false,
        cost: buildCostModel({ flight: c.flight.price }, "cached"),
      }));

      setOffers(built);
      // "Widen" hint when the feed gave us nothing usable after filtering, or
      // very few options - the honest "showing the closest live fares" copy.
      setWidened(built.length > 0 && built.length < 3);
      setEmpty(built.length === 0);
      setState((s) => ({ ...s, screen: "results", selected: 0 }));
      scrollTop();
    } catch {
      setOffers([]);
      setEmpty(true);
      setErrored(true);
      setState((s) => ({ ...s, screen: "results", selected: 0 }));
      scrollTop();
    }
  }, [
    state.departure,
    state.when,
    state.general,
    state.weather,
    state.intensity,
    state.budget,
    state.daysMin,
    state.daysMax,
    searchDests,
    getDestIndex,
    scrollTop,
  ]);

  /**
   * LAZY enrichment for the SELECTED offer (Phase 2). Called when the user opens
   * Detail for an offer that hasn't been enriched yet. Fetches its REAL hotel
   * (LiteAPI, over the real flight window) and REAL activity (Viator, for the
   * destination), attaches them, and rebuilds the per-person CostModel from the
   * real lines we now have. This is the ONLY place hotel/activity are fetched -
   * one offer at a time, cached server-side - so a search never makes ~60 calls.
   *
   * Honesty: each external result may be null (no data / unauthorized / no
   * availability) → hide-missing. Hotel rates are total-stay → divided by adults
   * for the per-person line; activity `fromPrice` is already per person.
   * Confidence stays "cached" (indicative cached rates, never a bookable quote).
   */
  const enrichSelected = useCallback(
    async (index: number) => {
      const target = offers[index];
      if (!target || target.enriched) return;

      const includeHotel = state.packages.includes("Hotel");
      const includeActivity = state.packages.includes("Activity");
      const adults = state.travelers;
      const flight = target.flight;
      const dest = target.dest;
      const win = windowFromFlight(flight, FALLBACK_NIGHTS);

      // Geo-first for hotel when the curated/index card lacks a clean city name;
      // otherwise resolve by city + country. Synthetic cards already carry the
      // real destinationCity/Country from the feed via syntheticDest.
      const city = flight.destinationCity ?? dest.name ?? undefined;
      const countryCode = flight.destinationCountry ?? undefined;

      const [hotel, activity] = await Promise.all([
        includeHotel
          ? searchHotelLite({
              city: city ?? undefined,
              countryCode: countryCode ?? undefined,
              iataCode: flight.destination,
              checkIn: win.checkIn,
              checkOut: win.checkOut,
              adults,
              currency: "mxn",
            }).catch(() => null)
          : Promise.resolve(null),
        includeActivity && city
          ? searchActivity({
              destinationName: city,
              countryCode: countryCode ?? undefined,
              currency: "mxn",
            }).catch(() => null)
          : Promise.resolve(null),
      ]);

      // Per-person lines from the REAL data. Hotel rates are total-stay → /adults.
      const hotelPerPerson =
        hotel?.priceFrom != null && adults > 0
          ? hotel.priceFrom / adults
          : undefined;
      // Viator `fromPrice` is already a per-person "from" price.
      const activityPerPerson =
        activity?.priceFrom != null ? activity.priceFrom : undefined;

      const cost = buildCostModel(
        {
          flight: flight.price,
          hotel: hotelPerPerson,
          activity: activityPerPerson,
        },
        "cached"
      );

      // Identity guard: a still-in-flight enrich must NOT stamp this
      // destination's real hotel/activity onto a DIFFERENT destination that has
      // since taken position `index` (a new surprise() replaces the whole
      // array). Match on the captured destination IATA, not just the index, and
      // only patch an offer that hasn't already been enriched.
      const destIata = flight.destination;
      setOffers((prev) =>
        prev.map((o, i) =>
          i === index &&
          o.flight.destination === destIata &&
          !o.enriched
            ? { ...o, hotel, activity, enriched: true, cost }
            : o
        )
      );
    },
    [offers, state.packages, state.travelers, searchHotelLite, searchActivity]
  );

  const nextStep = useCallback(() => {
    if (state.step < WIZARD_STEPS) goStep(state.step + 1);
    else void surprise();
  }, [state.step, goStep, surprise]);

  // ---- selectors (thin: assemble pricing from the real selected offer) ----
  const computed = useMemo<PlannerComputed>(() => {
    const offer = offers[state.selected] ?? offers[0] ?? null;
    const includeFlight = state.packages.includes("Flight");
    const includeHotel = state.packages.includes("Hotel");
    const includeActivity = state.packages.includes("Activity");

    const win = offer ? windowFromFlight(offer.flight, FALLBACK_NIGHTS) : null;
    const nights = win ? win.nights : null;

    // Hotel offers are total-stay prices; convert to per-person for the trip.
    const hotelPerPerson =
      offer?.hotel?.priceFrom != null && state.travelers > 0
        ? offer.hotel.priceFrom / state.travelers
        : null;

    const pricing = computePricing({
      flight:
        offer && includeFlight
          ? {
              name: offer.flight.airlineName ?? offer.flight.airline,
              price: offer.flight.price,
            }
          : null,
      hotel:
        offer && includeHotel && offer.hotel && hotelPerPerson != null
          ? {
              name: offer.hotel.hotelName,
              room: offer.hotel.hotelName,
              price: hotelPerPerson,
            }
          : null,
      // Real Viator activity (lazily enriched on selection). Its `priceFrom` is
      // already a per-person "from" price. Null until enriched / if none found.
      activity:
        offer && includeActivity && offer.activity
          ? {
              name: offer.activity.title,
              price: offer.activity.priceFrom,
            }
          : null,
      travelers: state.travelers,
      currency: offer?.flight.currency ?? "mxn",
    });

    return {
      offers,
      empty,
      errored,
      widened,
      offer,
      outDate: offer ? monthLabel(offer.flight.departureAt) : null,
      retDate:
        offer && offer.flight.returnAt
          ? monthLabel(offer.flight.returnAt)
          : null,
      nights,
      ...pricing,
    };
  }, [offers, empty, errored, widened, state.selected, state.packages, state.travelers]);

  return {
    state,
    computed,
    setState,
    patch,
    go,
    toggleArr,
    startWizard,
    goStep,
    prevStep,
    nextStep,
    enrichSelected,
    scrollTop,
  };
}

/**
 * Vibe score for a SYNTHETIC (non-catalog) candidate, derived from the
 * destination index instead of curated card fields. Uses the SAME math as
 * `scoreVibe`: +2 per matched general tag present in the index `geoTags`, +1 if
 * the index `climate` is one of the wizard's selected weathers. The intensity
 * term is OMITTED (neutral) because we can't derive intensity from open data -
 * we never fabricate it. RANKING ONLY; these tags are never displayed.
 */
function scoreVibeFromIndex(
  vibe: DestVibe,
  input: { general: string[]; weather: string[] }
): number {
  let sc = 0;
  for (const g of input.general) {
    if (vibe.geoTags.includes(g)) sc += 2;
  }
  if (vibe.climate && input.weather.includes(vibe.climate)) sc += 1;
  return sc;
}

/**
 * Build a minimal catalog-shaped card for a cheapest-anywhere destination that
 * has no curated entry. Only the fields the API actually returned get real
 * values; the rest are neutral placeholders for layout (no fake price/scarcity).
 */
function syntheticDest(f: FlightOffer): Destination {
  const name = f.destinationCity ?? f.destination;
  const region = f.destinationCountry ?? "";
  return {
    key: `live-${f.destination}`,
    name,
    imageSrc: "",
    region,
    nights: 0,
    tags: [],
    weather: "",
    intensity: 0,
    airline: f.airlineName ?? f.airline,
    hotel: "",
    room: "",
    activity: "",
    actDesc: "",
    blurb: "",
    gradient: "linear-gradient(140deg,#22B5C9,#3FD0C2 48%,#F0C04A)",
    from: f.origin,
    to: f.destination,
    slotHint: `Drop a ${name} photo`,
  };
}

export type PlannerApi = ReturnType<typeof usePlanner>;
