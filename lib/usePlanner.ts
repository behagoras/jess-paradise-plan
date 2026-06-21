"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DESTS,
  DEST_BASE,
  PROVIDER,
  type Destination,
} from "./data";

export type Screen =
  | "landing"
  | "wizard"
  | "generating"
  | "results"
  | "detail"
  | "handoff";

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
  general: string[];
  weather: string[];
  selected: number;
  airlineIdx: number;
  hotelIdx: number;
  activityOn: boolean;
  genPhase: number;
}

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
  general: ["Beach", "Nightlife"],
  weather: ["Hot"],
  selected: 0,
  airlineIdx: 0,
  hotelIdx: 0,
  activityOn: true,
  genPhase: 0,
};

export const fmt = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US");

/** Snapshot of everything derived from state — flights, hotels, totals, copy. */
export interface PlannerComputed {
  options: Destination[];
  disc: number;
  dest: Destination;
  base: number;
  air: { name: string; price: number };
  hot: { name: string; room: string; price: number };
  actPrice: number;
  subtotal: number;
  discAmt: number;
  taxes: number;
  perPerson: number;
  grand: number;
  travelersLabel: string;
  provider: string;
  breakdown: { k: string; v: string; color: string }[];
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
    timers.current = [
      setTimeout(() => patch({ genPhase: 1 }), 950),
      setTimeout(() => patch({ genPhase: 2 }), 1850),
      setTimeout(() => {
        patch({ screen: "results" });
        scrollTop();
      }, 2900),
    ];
  }, [patch, scrollTop]);

  const nextStep = useCallback(() => {
    if (state.step < 3) goStep(state.step + 1);
    else surprise();
  }, [state.step, goStep, surprise]);

  // ---- pricing / selectors (mirrors renderVals()) -----------------------
  const computeOptions = useCallback((): Destination[] => {
    const scored = DESTS.map((d) => {
      let sc = 0;
      state.general.forEach((v) => {
        if (d.tags.includes(v)) sc += 2;
      });
      if (state.weather.includes(d.weather)) sc += 1;
      sc += 2 - Math.min(2, Math.abs(d.intensity - state.intensity));
      return { d, sc };
    }).sort((a, b) => b.sc - a.sc);
    return scored.slice(0, 3).map((x) => x.d);
  }, [state.general, state.weather, state.intensity]);

  const computed = useMemo<PlannerComputed>(() => {
    const options = computeOptions();
    const dest = options[state.selected] || DESTS[0];
    const base = DEST_BASE[dest.key];
    const disc = state.when === "Flexible" ? 0.34 : 0.16;

    const airlines = [
      { name: dest.airline, price: base * 0.46 },
      { name: "Volaris", price: base * 0.36 },
      { name: "Delta", price: base * 0.58 },
    ];
    const hotels = [
      { name: dest.hotel, room: dest.room, price: base * 0.4 },
      { name: "Beachfront Suite", room: "King, ocean view", price: base * 0.64 },
      { name: "Casa Boutique", room: "Garden room", price: base * 0.27 },
    ];
    const air = airlines[state.airlineIdx];
    const hot = hotels[state.hotelIdx];
    const actPrice = base * 0.16;
    const subtotal = air.price + hot.price + (state.activityOn ? actPrice : 0);
    const discAmt = subtotal * disc;
    const taxes = (subtotal - discAmt) * 0.16;
    const perPerson = subtotal - discAmt + taxes;
    const grand = perPerson * state.travelers;
    const travelersLabel =
      state.travelers + (state.travelers === 1 ? " traveler" : " travelers");

    const breakdown = [
      { k: "Flight · " + air.name, v: fmt(air.price), color: "var(--ink)" },
      { k: "Hotel · " + hot.room, v: fmt(hot.price), color: "var(--ink)" },
    ];
    if (state.activityOn)
      breakdown.push({
        k: "Activity · " + dest.activity,
        v: fmt(actPrice),
        color: "var(--ink)",
      });
    breakdown.push({
      k:
        state.when === "Flexible"
          ? "Flexibility discount"
          : "Early-bird discount",
      v: "−" + fmt(discAmt),
      color: "var(--palm)",
    });
    breakdown.push({
      k: "Taxes & fees",
      v: fmt(taxes),
      color: "var(--ink)",
    });

    return {
      options,
      disc,
      dest,
      base,
      air,
      hot,
      actPrice,
      subtotal,
      discAmt,
      taxes,
      perPerson,
      grand,
      travelersLabel,
      provider: PROVIDER,
      breakdown,
    };
  }, [
    computeOptions,
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
