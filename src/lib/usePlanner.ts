"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { DESTS, type Destination } from "./data";
import { computeOptions } from "./scoring";
import { computePricing, fmt, type Pricing } from "./pricing";
import { GEN_PHASE_DELAYS } from "@/components/screens/Generating";

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
 * lives in `src/lib/pricing.ts`. `general`, `weather`, `intensity`, `budget`,
 * and the trip-length range (`daysMin`/`daysMax`) drive the Results set.
 * `departure`, `packages`, `vacation`, and `travelerTypes` are collected but
 * stay honest no-ops until live data exists.
 * TODO(live-data): departure filters origins once Amadeus search exists.
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
  airlineIdx: number;
  hotelIdx: number;
  activityOn: boolean;
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
  airlineIdx: 0,
  hotelIdx: 0,
  activityOn: true,
  genPhase: 0,
};

/** Snapshot of everything derived from state — flights, hotels, totals, copy. */
export interface PlannerComputed extends Pricing {
  options: Destination[];
  /** Filters yielded < 3 matches; Results was backfilled to keep 3 cards. */
  widened: boolean;
  dest: Destination;
}

export function usePlanner(scrollRef?: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<PlannerState>(INITIAL);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const surprise = useCallback(() => {
    patch({ screen: "generating", genPhase: 0 });
    timers.current.forEach(clearTimeout);
    // TODO(live-data): these timers are pure UX rhythm over synchronous
    // scoring. They become a real async-search progress indicator once a live
    // data source exists; see Generating.tsx copy.
    timers.current = [
      setTimeout(() => patch({ genPhase: 1 }), GEN_PHASE_DELAYS[0]),
      setTimeout(() => patch({ genPhase: 2 }), GEN_PHASE_DELAYS[1]),
      setTimeout(() => {
        patch({ screen: "results" });
        scrollTop();
      }, GEN_PHASE_DELAYS[2]),
    ];
  }, [patch, scrollTop]);

  const nextStep = useCallback(() => {
    if (state.step < WIZARD_STEPS) goStep(state.step + 1);
    else surprise();
  }, [state.step, goStep, surprise]);

  // ---- selectors (thin: delegates to pure scoring + pricing modules) ----
  const computed = useMemo<PlannerComputed>(() => {
    const { options, widened } = computeOptions({
      general: state.general,
      weather: state.weather,
      intensity: state.intensity,
      budget: state.budget,
      daysMin: state.daysMin,
      daysMax: state.daysMax,
    });
    const dest = options[state.selected] || DESTS[0];
    const pricing = computePricing({
      dest,
      when: state.when,
      airlineIdx: state.airlineIdx,
      hotelIdx: state.hotelIdx,
      activityOn: state.activityOn,
      travelers: state.travelers,
    });
    return { options, widened, dest, ...pricing };
  }, [
    state.general,
    state.weather,
    state.intensity,
    state.budget,
    state.daysMin,
    state.daysMax,
    state.selected,
    state.when,
    state.airlineIdx,
    state.hotelIdx,
    state.activityOn,
    state.travelers,
  ]);

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

export type PlannerApi = ReturnType<typeof usePlanner>;
