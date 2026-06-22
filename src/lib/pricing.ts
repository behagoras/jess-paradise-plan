/**
 * Pure pricing math for a selected trip, built ONLY from real line items the
 * Travelpayouts data layer returned (see `convex/travelpayouts.ts`). Zero React,
 * zero IO — the planner fetches the offers and hands them in here.
 *
 * Hide-missing rule (carried from the data layer): if a line item is null we do
 * NOT fabricate it. No ratios, no seed base, no fake discount, no bolted-on tax.
 * A trip's per-person price is the sum of the REAL lines the user included and
 * the API actually returned. Showing fewer lines is correct behaviour.
 */

import { PROVIDER } from "./data";

export const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** A single real, included, priced line item (flight / hotel / activity). */
export interface PriceLine {
  kind: "flight" | "hotel" | "activity";
  /** Display label, e.g. "Flight · Volaris" or "Hotel · Jungle suite". */
  k: string;
  /** Real per-person amount in `currency`. */
  amount: number;
  color: string;
}

export interface PricingInput {
  /** Real flight per-person price, or null if none returned / not included. */
  flight: { name: string; price: number } | null;
  /**
   * Real hotel per-person price for the stay, or null if none returned / down /
   * not included. (Hotellook prices are total-stay; the planner divides by pax.)
   */
  hotel: { name: string; room: string; price: number } | null;
  /** Real activity per-person price, or null — we have NO live activity source. */
  activity: { name: string; price: number } | null;
  travelers: number;
  currency: string;
}

export interface Pricing {
  /** The real, included, priced lines — only what the API actually returned. */
  lines: PriceLine[];
  /** Sum of the real per-person lines. */
  perPerson: number;
  /** perPerson × travelers. */
  grand: number;
  travelersLabel: string;
  provider: string;
  currency: string;
  /** Convenience breakdown for the Detail screen (lines as {k, v, color}). */
  breakdown: { k: string; v: string; color: string }[];
  /** True when at least one priced line exists (the trip has a real number). */
  hasPrice: boolean;
}

/**
 * Compute the per-person + grand total from real line items. Pure.
 * Only the lines that are non-null (real + included) contribute.
 */
export function computePricing({
  flight,
  hotel,
  activity,
  travelers,
  currency,
}: PricingInput): Pricing {
  const lines: PriceLine[] = [];
  if (flight)
    lines.push({
      kind: "flight",
      k: "Flight · " + flight.name,
      amount: flight.price,
      color: "var(--ink)",
    });
  if (hotel)
    lines.push({
      kind: "hotel",
      k: "Hotel · " + hotel.room,
      amount: hotel.price,
      color: "var(--ink)",
    });
  if (activity)
    lines.push({
      kind: "activity",
      k: "Activity · " + activity.name,
      amount: activity.price,
      color: "var(--ink)",
    });

  const perPerson = lines.reduce((sum, l) => sum + l.amount, 0);
  const grand = perPerson * travelers;
  const travelersLabel =
    travelers + (travelers === 1 ? " traveler" : " travelers");

  const breakdown = lines.map((l) => ({
    k: l.k,
    v: fmt(l.amount),
    color: l.color,
  }));

  return {
    lines,
    perPerson,
    grand,
    travelersLabel,
    provider: PROVIDER,
    currency,
    breakdown,
    hasPrice: lines.length > 0,
  };
}
