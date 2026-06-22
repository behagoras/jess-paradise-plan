import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // A trip the user chose to hand off / book.
  //
  // While the visitor is a guest it carries `guestId` (the pp_guest cookie
  // token) and no `userId`. On sign-in, `claimGuestTrips` reassigns the row to
  // the Clerk subject: it sets `userId` and clears `guestId`. So at any moment
  // exactly one of the two identifiers is set.
  trips: defineTable({
    userId: v.optional(v.string()), // Clerk subject, set once claimed/saved authed
    guestId: v.optional(v.string()), // pp_guest cookie token, set for guest drafts
    destinationKey: v.string(),
    destinationName: v.string(),
    region: v.string(),
    provider: v.string(),
    travelers: v.number(),
    total: v.number(),
    perPerson: v.number(),
    when: v.string(),
    departure: v.string(),
    activityOn: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_guest", ["guestId"]),

  // --- Travelpayouts response cache --------------------------------------
  // We cache live API responses to honour the rate limit and speed up the
  // Playwright runs. Each row is keyed by a normalized request string and
  // stores the *raw shaped result* (already mapped to our hide-missing types)
  // plus `fetchedAt`. Actions read cache first and only re-fetch on a miss or
  // when the row is older than the TTL (~6h for fares/hotels). `result` is the
  // JSON value the action would otherwise return — `null` is a legitimate
  // cached value (the API genuinely had nothing), so we still cache it.

  // Cached flight searches (single fare AND cheapest-destinations lists).
  tpFlightCache: defineTable({
    key: v.string(), // e.g. "flight:MEX:CUN:2026-07:rt:usd" or "dests:MEX:3:usd"
    result: v.any(), // FlightOffer | FlightOffer[] | null
    fetchedAt: v.number(), // Date.now() at fetch
  }).index("by_key", ["key"]),

  // Cached Hotellook cache.json lookups.
  tpHotelCache: defineTable({
    key: v.string(), // e.g. "hotel:CUN:2026-07-22:2026-07-25:2:usd"
    result: v.any(), // HotelOffer | null
    fetchedAt: v.number(),
  }).index("by_key", ["key"]),

  // Cached public dictionaries (airlines / cities) — large and static, so a
  // long TTL (~30d). Keyed by dictionary name.
  tpDict: defineTable({
    key: v.string(), // "airlines" | "cities"
    result: v.any(), // Record<string, ...>
    fetchedAt: v.number(),
  }).index("by_key", ["key"]),
});
