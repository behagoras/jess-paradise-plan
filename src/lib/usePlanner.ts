"use client";

import { useCallback, useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DESTS, type Destination } from "./data";
import { computeOptions } from "./scoring";
import { computePricing, fmt, type Pricing } from "./pricing";
import {
  CITY_TO_IATA,
  normalizeIata,
  whenToDeparture,
  windowFromFlight,
  monthLabel,
} from "./trip";
import type { FlightOffer, HotelOffer } from "@/convex/travelpayouts";

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
 *   Step 1 — When + Activity intensity (the two inputs that drive output),
 *            plus an optional, collapsed "More filters" group.
 *   Step 2 — Preference + weather chips, then "Surprise me".
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
  budget: 1800,
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
 * One real, fetched trip offer. `dest` is the catalog card it anchors (image,
 * blurb, rating, region copy); `flight`/`hotel` are the REAL fares the data
 * layer returned (hotel may be null when Hotellook has nothing / is down).
 * `catalog` is false for extra destinations surfaced via cheapest-anywhere,
 * which have no curated card and render only the fields the API returned.
 */
export interface RealOffer {
  dest: Destination;
  catalog: boolean;
  flight: FlightOffer;
  hotel: HotelOffer | null;
}

/** Snapshot of everything derived from state — the selected offer + pricing. */
export interface PlannerComputed extends Pricing {
  /** The fetched real offers (≤ 3), or [] before/after an empty search. */
  offers: RealOffer[];
  /** No live trips matched the chosen origin/filters — show the widen hint. */
  empty: boolean;
  /** Search hit an error (e.g. token/network) — show the widen hint. */
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

/** How many real cards we aim to show. */
const TARGET_CARDS = 3;
/** Default hotel nights when a flight has no return leg to measure against. */
const FALLBACK_NIGHTS = 3;

export function usePlanner(scrollRef?: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<PlannerState>(INITIAL);
  const [offers, setOffers] = useState<RealOffer[]>([]);
  const [empty, setEmpty] = useState(false);
  const [errored, setErrored] = useState(false);
  const [widened, setWidened] = useState(false);

  const searchFlight = useAction(api.travelpayouts.searchCheapestFlight);
  const searchDests = useAction(api.travelpayouts.searchCheapestDestinations);
  const searchHotel = useAction(api.travelpayouts.searchHotel);

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
   * Real async search. Scores the catalog (scoring.ts) to pick candidates,
   * then fetches REAL flight + hotel for each from the chosen origin/date via
   * the prompt-401 Convex actions. Candidates with no real fare are dropped
   * (hide-missing); if fewer than 3 remain we backfill from cheapest-anywhere.
   * `genPhase` advances on real awaits, not timers. Errors / no results land
   * on Results with an honest widen hint.
   */
  const surprise = useCallback(async () => {
    setState((s) => ({ ...s, screen: "generating", genPhase: 0, selected: 0 }));
    setTimeout(scrollTop, 0);
    setEmpty(false);
    setErrored(false);

    const origin = CITY_TO_IATA[state.departure] ?? "MEX";
    const departureAt = whenToDeparture(state.when);
    const includeHotel = state.packages.includes("Hotel");
    const includeFlight = state.packages.includes("Flight");
    const adults = state.travelers;

    // Score the catalog to choose candidate destinations + their real IATAs.
    const { options, widened: backfilled } = computeOptions({
      general: state.general,
      weather: state.weather,
      intensity: state.intensity,
      budget: state.budget,
      daysMin: state.daysMin,
      daysMax: state.daysMax,
    });

    try {
      // Phase 1 — fetch real flights for the catalog candidates in parallel.
      const candidates = options
        .map((dest) => ({ dest, iata: normalizeIata(dest.to) }))
        .filter((c): c is { dest: Destination; iata: string } => !!c.iata);

      const flightResults = await Promise.all(
        candidates.map((c) =>
          // If the user excluded flights we still need a flight to anchor the
          // destination + real dates, but it won't be priced into the total.
          searchFlight({ origin, destination: c.iata, departureAt })
        )
      );
      setState((s) => ({ ...s, genPhase: 1 }));

      const flighted: { dest: Destination; flight: FlightOffer }[] = [];
      candidates.forEach((c, i) => {
        const f = flightResults[i];
        if (f) flighted.push({ dest: c.dest, flight: f });
      });

      // Backfill with cheapest-anywhere real destinations if we are short.
      if (flighted.length < TARGET_CARDS) {
        const extras = await searchDests({ origin, limit: 12 });
        const seen = new Set(flighted.map((x) => x.flight.destination));
        for (const f of extras) {
          if (flighted.length >= TARGET_CARDS) break;
          if (seen.has(f.destination)) continue;
          seen.add(f.destination);
          flighted.push({ dest: syntheticDest(f), flight: f });
        }
      }

      const chosen = flighted.slice(0, TARGET_CARDS);

      // Phase 2 — fetch a real hotel for each chosen destination over the real
      // flight window. Hotellook may be null (down / no data) → hide-missing.
      const hotelResults = await Promise.all(
        chosen.map(({ dest, flight }) => {
          if (!includeHotel) return Promise.resolve(null);
          const win = windowFromFlight(flight, FALLBACK_NIGHTS);
          return searchHotel({
            destinationIata: flight.destination,
            location: dest.region ? dest.name : undefined,
            checkIn: win.checkIn,
            checkOut: win.checkOut,
            adults,
          });
        })
      );
      setState((s) => ({ ...s, genPhase: 2 }));

      const built: RealOffer[] = chosen.map(({ dest, flight }, i) => ({
        dest,
        catalog: DESTS.some((d) => d.key === dest.key),
        // When flights are excluded, keep the fetched flight only to source the
        // destination + dates; the screens drop it from pricing via `packages`.
        flight,
        hotel: includeHotel ? hotelResults[i] : null,
      }));

      setOffers(built);
      setWidened(backfilled || built.length < TARGET_CARDS);
      setEmpty(built.length === 0);
      // Keep `includeFlight` referenced for clarity even when always-fetched.
      void includeFlight;
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
    state.travelers,
    state.packages,
    state.general,
    state.weather,
    state.intensity,
    state.budget,
    state.daysMin,
    state.daysMax,
    searchFlight,
    searchDests,
    searchHotel,
    scrollTop,
  ]);

  const nextStep = useCallback(() => {
    if (state.step < WIZARD_STEPS) goStep(state.step + 1);
    else void surprise();
  }, [state.step, goStep, surprise]);

  // ---- selectors (thin: assemble pricing from the real selected offer) ----
  const computed = useMemo<PlannerComputed>(() => {
    const offer = offers[state.selected] ?? offers[0] ?? null;
    const includeFlight = state.packages.includes("Flight");
    const includeHotel = state.packages.includes("Hotel");

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
      // No live activity price source exists → always null (hide the line).
      activity: null,
      travelers: state.travelers,
      currency: offer?.flight.currency ?? "usd",
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
    scrollTop,
  };
}

/**
 * Build a minimal catalog-shaped card for a cheapest-anywhere destination that
 * has no curated entry. Only the fields the API actually returned get real
 * values; the rest are neutral placeholders for layout (no fake price/rating).
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
    rating: "",
    airline: f.airlineName ?? f.airline,
    hotel: "",
    room: "",
    activity: "",
    actDesc: "",
    blurb: "",
    gradient: "linear-gradient(140deg,#22B5C9,#3FD0C2 48%,#F0C04A)",
    from: f.origin,
    to: f.destination,
    departsIn: 0,
    seats: 0,
    slotHint: `Drop a ${name} photo`,
  };
}

export type PlannerApi = ReturnType<typeof usePlanner>;
