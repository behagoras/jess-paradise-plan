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
  // JSON value the action would otherwise return - `null` is a legitimate
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

  // Cached public dictionaries (airlines / cities) - large and static, so a
  // long TTL (~30d). Keyed by dictionary name.
  tpDict: defineTable({
    key: v.string(), // "airlines" | "cities"
    result: v.any(), // Record<string, ...>
    fetchedAt: v.number(),
  }).index("by_key", ["key"]),

  // --- LiteAPI (real hotel rates) cache ----------------------------------
  // Cached LiteAPI hotel-rate searches for the SELECTED destination, fetched
  // lazily on the Detail view (NOT eagerly for all candidates). Same pattern
  // as the Travelpayouts caches: keyed by a normalized request string, stores
  // the hide-missing shaped result (HotelLiteOffer | null) plus `fetchedAt`.
  // `null` is a legitimate cached value (no availability / no real hotel).
  liteHotelCache: defineTable({
    key: v.string(), // e.g. "lite:Cancun:MX:2026-08-10:2026-08-13:2:USD"
    result: v.any(), // HotelLiteOffer | null
    fetchedAt: v.number(),
  }).index("by_key", ["key"]),

  // --- Viator (real activities) cache ------------------------------------
  // Two caches keyed by a normalized request string:
  //  - product searches for the SELECTED destination (ActivityOffer | null)
  //  - resolved city→Viator destinationId taxonomy lookups (number | null)
  // Read-through with `fetchedAt`; null is a legitimate cached miss.
  viatorCache: defineTable({
    key: v.string(), // e.g. "viator:product:732:USD" or "viator:dest:Cancun:MX"
    result: v.any(), // ActivityOffer | number | null
    fetchedAt: v.number(),
  }).index("by_key", ["key"]),

  // --- FX rate cache (currency conversion to MXN) ------------------------
  // We request MXN natively from every provider, but if a provider returns a
  // non-MXN price we convert it with a REAL exchange rate from a free, no-key
  // source (open.er-api.com), cached here with a ~24h TTL (rates barely move
  // intraday). Keyed by base currency, e.g. "USD". `rates` is the raw
  // { CODE -> rate-per-1-base } map the source returned. We NEVER fabricate a
  // rate: if the fetch fails we keep the original amount + currency and label
  // it honestly rather than invent a conversion.
  tpFxCache: defineTable({
    key: v.string(), // base currency code, e.g. "USD"
    rates: v.any(), // Record<string, number> (CODE -> units per 1 base)
    fetchedAt: v.number(), // Date.now() at fetch
  }).index("by_key", ["key"]),

  // --- Destination index (vibe/geo enrichment) ---------------------------
  // A scalable, lazily-built index keyed by destination IATA. It lets the
  // reverse search rank ARBITRARY real destinations (not just the 6 curated
  // ones) by deriving climate/geo tags from open data (Wikidata in this phase;
  // OpenTripMap plugs in additively later via `sources`).
  //
  // HONESTY: the derived `climate`/`geoTags` are used ONLY for ranking/banding,
  // never displayed in the UI as a factual claim. When a field can't be derived
  // it stays null/empty - the destination just remains "less known", never
  // faked. Each row records its provenance in `sources`.
  tpDestIndex: defineTable({
    iata: v.string(), // destination IATA, e.g. "CUN"
    city: v.optional(v.string()), // resolved from cities dict
    country: v.optional(v.string()), // ISO country code
    lat: v.optional(v.number()), // Wikidata P625 latitude
    lon: v.optional(v.number()), // Wikidata P625 longitude
    koppen: v.optional(v.string()), // Köppen code, e.g. "Aw" (Wikidata P2564)
    // Mapped to the wizard WEATHER taxonomy:
    // "Hot"|"Cold"|"Windy"|"Perfect"|"Mild"|"Snow". Derived from Köppen, else a
    // coarse lat fallback. RANKING ONLY - never shown as a factual claim.
    climate: v.optional(v.string()),
    // Own-taxonomy subset of the wizard GENERAL list derivable from Wikidata
    // instance-of (P31), e.g. "Beach","Nature","Historic". RANKING ONLY.
    geoTags: v.array(v.string()),
    sources: v.array(v.string()), // provenance, e.g. ["wikidata"]
    fetchedAt: v.number(), // Date.now() at enrichment
  }).index("by_iata", ["iata"]),
});
