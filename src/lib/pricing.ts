/**
 * Pure pricing math for a selected destination. Zero React / zero IO.
 *
 * Extracted from the old `usePlanner` god object so the numbers can be reasoned
 * about (and unit-tested) in isolation. `usePlanner` stays a thin coordinator.
 *
 * All ratios below are multipliers against a destination's `base` price
 * (`DEST_BASE[key]`, USD). `base` denominates a notional all-in seed price per
 * person for the trip; the component ratios slice that seed into flight / hotel
 * / activity line items and then apply the discount + tax. These are seed
 * values transcribed from the prototype's `renderVals()` — not live quotes.
 *
 * TODO(live-data): once Amadeus / Travelpayouts are wired, flight and hotel
 * prices become real per-leg quotes and these ratios disappear.
 */

import { DEST_BASE, PROVIDER, type Destination } from "./data";

// ---- pricing constants (named magic numbers) ----------------------------

/** Discount applied when the traveler keeps dates "Flexible". */
export const FLEXIBLE_DISCOUNT = 0.34;
/** Discount applied when the traveler commits to a specific month (early bird). */
export const EARLY_BIRD_DISCOUNT = 0.16;

/** Flight price as a fraction of base, per airline option (index 0 = default). */
export const FLIGHT_RATIOS = [0.46, 0.36, 0.58];
/** Hotel price as a fraction of base, per hotel option (index 0 = default). */
export const HOTEL_RATIOS = [0.4, 0.64, 0.27];
/** Activity price as a fraction of base. */
export const ACTIVITY_RATIO = 0.16;
/** Taxes & fees applied to the post-discount subtotal. */
export const TAX_RATE = 0.16;

export const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export interface PricingInput {
  dest: Destination;
  when: string;
  airlineIdx: number;
  hotelIdx: number;
  activityOn: boolean;
  travelers: number;
}

export interface Pricing {
  disc: number;
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

/** Compute every derived price line for one destination + selection. Pure. */
export function computePricing({
  dest,
  when,
  airlineIdx,
  hotelIdx,
  activityOn,
  travelers,
}: PricingInput): Pricing {
  const base = DEST_BASE[dest.key];
  const disc = when === "Flexible" ? FLEXIBLE_DISCOUNT : EARLY_BIRD_DISCOUNT;

  const airlines = [
    { name: dest.airline, price: base * FLIGHT_RATIOS[0] },
    { name: "Volaris", price: base * FLIGHT_RATIOS[1] },
    { name: "Delta", price: base * FLIGHT_RATIOS[2] },
  ];
  const hotels = [
    { name: dest.hotel, room: dest.room, price: base * HOTEL_RATIOS[0] },
    { name: "Beachfront Suite", room: "King, ocean view", price: base * HOTEL_RATIOS[1] },
    { name: "Casa Boutique", room: "Garden room", price: base * HOTEL_RATIOS[2] },
  ];
  const air = airlines[airlineIdx];
  const hot = hotels[hotelIdx];
  const actPrice = base * ACTIVITY_RATIO;
  const subtotal = air.price + hot.price + (activityOn ? actPrice : 0);
  const discAmt = subtotal * disc;
  const taxes = (subtotal - discAmt) * TAX_RATE;
  const perPerson = subtotal - discAmt + taxes;
  const grand = perPerson * travelers;
  const travelersLabel = travelers + (travelers === 1 ? " traveler" : " travelers");

  const breakdown: { k: string; v: string; color: string }[] = [
    { k: "Flight · " + air.name, v: fmt(air.price), color: "var(--ink)" },
    { k: "Hotel · " + hot.room, v: fmt(hot.price), color: "var(--ink)" },
  ];
  if (activityOn)
    breakdown.push({
      k: "Activity · " + dest.activity,
      v: fmt(actPrice),
      color: "var(--ink)",
    });
  breakdown.push({
    k: when === "Flexible" ? "Flexibility discount" : "Early-bird discount",
    v: "−" + fmt(discAmt),
    color: "var(--palm)",
  });
  breakdown.push({ k: "Taxes & fees", v: fmt(taxes), color: "var(--ink)" });

  return {
    disc,
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
}
