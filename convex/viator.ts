import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Viator data layer - REAL activities (experiences) for a destination.
 *
 * Uses the Viator Partner API Basic Access endpoints:
 *  - GET  /destinations            → taxonomy; resolve a city name → destinationId
 *  - POST /products/search         → real products (experiences) for a destination
 *
 * Verified contract (Viator Partner API v2.0):
 *  - Auth header:  "exp-api-key: <key>"
 *  - Version:      Accept: "application/json;version=2.0"
 *  - Language:     Accept-Language: "en-US"
 *  - /destinations → { destinations: [ { destinationId, name, type,
 *                      parentDestinationId } ] }
 *  - /products/search body: { filtering: { destination: <id> },
 *      pagination: { start, count }, currency, sorting? }
 *    → { products: [ { productCode, title,
 *        pricing: { summary: { fromPrice }, currency },
 *        reviews: { combinedAverageRating },
 *        productUrl,                       // REAL affiliate deep link
 *        images: [ { variants: [ { url } ] } ] } ] }
 *
 * NON-NEGOTIABLE HONESTY (mirrors convex/travelpayouts.ts): never fabricate a
 * field. Any non-ok / empty response → null (hide-missing). `productUrl` MUST be
 * the real Viator deep link returned by the API - we never synthesise one. The
 * `fromPrice` is INDICATIVE and is never presented as a bookable quote.
 *
 * The key is SECRET and lives ONLY in the Convex deployment env, never in the
 * client bundle:  process.env.VIATOR_API_KEY.
 * Docs: https://docs.viator.com/partner-api/
 */

const BASE = "https://api.viator.com/partner";
const DESTINATIONS_API = `${BASE}/destinations`;
const PRODUCTS_SEARCH_API = `${BASE}/products/search`;

// Products/prices are indicative cached values; reuse the 6h fare TTL. The
// destination taxonomy is effectively static → a long TTL.
const PRODUCT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const DEST_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getKey(): string {
  const key = process.env.VIATOR_API_KEY;
  if (!key) {
    throw new Error(
      "VIATOR_API_KEY is not set. Run: npx convex env set VIATOR_API_KEY <key>"
    );
  }
  return key;
}

function viatorHeaders(key: string): Record<string, string> {
  return {
    "exp-api-key": key,
    Accept: "application/json;version=2.0",
    "Accept-Language": "en-US",
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Public result type (hide-missing: optional fields are omitted when absent)
// ---------------------------------------------------------------------------

export interface ActivityOffer {
  title: string;
  priceFrom: number; // indicative "from" price (per person), in `currency`
  currency: string;
  rating: number | null; // combined average review rating, or null
  productUrl: string; // REAL Viator affiliate deep link
  imageUrl: string | null; // a real product image, or null
}

// Raw API shapes (only the fields we read).
interface RawDestination {
  destinationId?: number;
  name?: string;
  type?: string;
  parentDestinationId?: number;
  // Viator COUNTRY-type destinations carry an ISO-2 country code we use to
  // disambiguate a city name (e.g. multiple "Nice"/"Split"/"Cordoba").
  countryCode?: string;
}
interface RawDestinationsResp {
  destinations?: RawDestination[];
}

/**
 * Sentinel returned by a fetcher to mean "this was a FETCH ERROR (non-ok /
 * network / parse failure), NOT a real empty result - do NOT cache it." A
 * genuine empty result (a 200/204 with no usable data) is still cacheable as
 * `null`; only transient/auth failures use this so a single bad call can't
 * suppress real data for the full TTL (6h products / 30d taxonomy).
 */
const FETCH_ERROR = Symbol("viator-fetch-error");
type FetchResult<T> = T | typeof FETCH_ERROR;
interface RawProduct {
  title?: string;
  productUrl?: string;
  pricing?: { summary?: { fromPrice?: number }; currency?: string };
  reviews?: { combinedAverageRating?: number };
  images?: Array<{ variants?: Array<{ url?: string }> }>;
}
interface RawProductsResp {
  products?: RawProduct[];
}

// ---------------------------------------------------------------------------
// Cache helpers (actions can't touch ctx.db directly; go through internal fns)
// ---------------------------------------------------------------------------

export const _viatorCacheGet = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db
      .query("viatorCache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return row ? { result: row.result, fetchedAt: row.fetchedAt } : null;
  },
});

export const _viatorCacheSet = internalMutation({
  args: { key: v.string(), result: v.any() },
  handler: async (ctx, { key, result }) => {
    const existing = await ctx.db
      .query("viatorCache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    const doc = { key, result, fetchedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("viatorCache", doc);
  },
});

/**
 * Read-through cache. The fetcher may return the FETCH_ERROR sentinel to signal
 * a transient/auth failure - in that case we do NOT persist anything (so the
 * upstream can recover before the TTL elapses) and surface `null` to the caller
 * for this call only. A real value (including a legitimately empty `null`) is
 * cached normally.
 */
async function withCache<T>(
  ctx: { runQuery: any; runMutation: any },
  key: string,
  ttlMs: number,
  fetcher: () => Promise<FetchResult<T>>
): Promise<T | null> {
  const cached = await ctx.runQuery(internal.viator._viatorCacheGet, { key });
  if (cached && Date.now() - cached.fetchedAt < ttlMs) {
    return cached.result as T;
  }
  const fresh = await fetcher();
  if (fresh === FETCH_ERROR) {
    // Transient/auth failure → don't poison the cache; just hide for now.
    return null;
  }
  await ctx.runMutation(internal.viator._viatorCacheSet, { key, result: fresh });
  return fresh;
}

// ---------------------------------------------------------------------------
// Destination taxonomy resolution (city name → Viator destinationId)
// ---------------------------------------------------------------------------

/**
 * Walk a destination's ancestry (via `parentDestinationId`) up to the root,
 * returning the ISO-2 `countryCode` carried by the COUNTRY-type ancestor (or by
 * the node itself), or null. Guarded against cycles/missing parents.
 */
function resolveCountryCode(
  d: RawDestination,
  byId: Map<number, RawDestination>
): string | null {
  let cur: RawDestination | undefined = d;
  const seen = new Set<number>();
  while (cur) {
    const cc = (cur.countryCode ?? "").trim().toUpperCase();
    if (cc) return cc;
    const pid = cur.parentDestinationId;
    if (pid == null || seen.has(pid)) break;
    seen.add(pid);
    cur = byId.get(pid);
  }
  return null;
}

/**
 * Resolve a destination name → Viator destinationId, cached. We pull the full
 * destinations taxonomy once (long TTL), then match by EXACT name only - the
 * loose `includes()` substring fallback is intentionally dropped so an
 * ambiguous/short name (e.g. "Nice"/"Split") can't resolve to an unrelated
 * destination. When `countryCode` is provided we disambiguate same-name cities
 * by walking each candidate's `parentDestinationId` ancestry to its country and
 * keeping only the one in that country. Returns null if nothing matches
 * unambiguously, and the FETCH_ERROR sentinel (NOT a cached null) on a transient
 * failure so a single bad call can't suppress real data for 30 days.
 */
async function resolveDestinationId(
  ctx: { runQuery: any; runMutation: any },
  key: string,
  destinationName: string,
  countryCode?: string
): Promise<number | null> {
  const wanted = destinationName.trim().toLowerCase();
  if (!wanted) return null;
  const wantedCC = (countryCode ?? "").trim().toUpperCase();
  const cacheKey = `viator:dest:${wanted}:${wantedCC}`;

  return withCache<number | null>(ctx, cacheKey, DEST_TTL_MS, async () => {
    let resp: RawDestinationsResp;
    try {
      const res = await fetch(DESTINATIONS_API, {
        method: "GET",
        headers: viatorHeaders(key),
      });
      if (!res.ok) return FETCH_ERROR; // transient/auth → don't cache a null
      resp = (await res.json()) as RawDestinationsResp;
    } catch {
      return FETCH_ERROR;
    }

    const dests = resp.destinations ?? [];
    if (dests.length === 0) return null; // real empty taxonomy → cacheable

    // Index by id so we can walk parent chains to resolve a country.
    const byId = new Map<number, RawDestination>();
    for (const d of dests) {
      if (d.destinationId != null) byId.set(d.destinationId, d);
    }

    // All EXACT (case-insensitive) name matches with a real id.
    const exactMatches = dests.filter(
      (d) =>
        d.destinationId != null &&
        (d.name ?? "").trim().toLowerCase() === wanted
    );
    if (exactMatches.length === 0) return null; // no exact match → hide

    // When a country is supplied, keep only candidates whose ancestry resolves
    // to that country - this disambiguates duplicate city names. If none in the
    // taxonomy carries a country code we can resolve, fall back to the exact
    // matches (better than nothing, still exact-name).
    let pool = exactMatches;
    if (wantedCC) {
      const inCountry = exactMatches.filter(
        (d) => resolveCountryCode(d, byId) === wantedCC
      );
      if (inCountry.length > 0) pool = inCountry;
    }

    // Prefer a CITY-type match within the pool, else the first pooled match.
    const city = pool.find((d) => (d.type ?? "").toUpperCase() === "CITY");
    const match = city ?? pool[0];
    return match?.destinationId ?? null;
  });
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

/** Map a raw product → hide-missing ActivityOffer, or null if it lacks the
 * non-negotiable fields (a real title, a real price, and a real deep link). */
function toActivityOffer(p: RawProduct, currency: string): ActivityOffer | null {
  const title = p.title;
  const productUrl = p.productUrl;
  const priceFrom = p.pricing?.summary?.fromPrice;
  // Without a real title, price, AND deep link we cannot honestly show a
  // priced, bookable activity row → hide it.
  if (!title || !productUrl || typeof priceFrom !== "number") return null;
  const rating =
    typeof p.reviews?.combinedAverageRating === "number"
      ? p.reviews.combinedAverageRating
      : null;
  const imageUrl = p.images?.[0]?.variants?.[0]?.url ?? null;
  return {
    title,
    priceFrom,
    currency: p.pricing?.currency ?? currency,
    rating,
    productUrl,
    imageUrl,
  };
}

// ---------------------------------------------------------------------------
// Public action - top REAL activity for the SELECTED destination
// ---------------------------------------------------------------------------

/**
 * Find a real, top experience for a destination. Resolves the city name to a
 * Viator destinationId (cached), then searches products and returns the first
 * one carrying a real title + price + deep link, mapped hide-missing. Returns
 * null on any failure / empty result - NEVER an invented activity. Designed to
 * be called LAZILY for the single selected offer (when Detail opens).
 */
export const searchActivity = action({
  args: {
    destinationName: v.string(), // e.g. "Cancun"
    countryCode: v.optional(v.string()), // ISO-2, e.g. "MX" (disambiguation)
    lat: v.optional(v.number()), // reserved; not required for taxonomy match
    lon: v.optional(v.number()),
    currency: v.optional(v.string()), // default "USD"
  },
  handler: async (
    ctx,
    { destinationName, countryCode, currency }
  ): Promise<ActivityOffer | null> => {
    const key = getKey();
    const cur = (currency ?? "USD").toUpperCase();

    const destId = await resolveDestinationId(
      ctx,
      key,
      destinationName,
      countryCode
    );
    if (destId == null) return null; // can't resolve → hide-missing

    const cacheKey = `viator:product:${destId}:${cur}`;
    return withCache<ActivityOffer | null>(
      ctx,
      cacheKey,
      PRODUCT_TTL_MS,
      async () => {
        // TRAVELER_RATING has a FIXED implicit DESCENDING order in Viator's
        // ranking spec; sending an explicit `order` for it is rejected with a
        // 400, which would otherwise be misread as "no products". Only PRICE
        // accepts an order, so we omit `order` here and sort by rating alone.
        const body = {
          filtering: { destination: destId },
          pagination: { start: 1, count: 5 },
          sorting: { sort: "TRAVELER_RATING" },
          currency: cur,
        };
        let resp: RawProductsResp;
        try {
          const res = await fetch(PRODUCTS_SEARCH_API, {
            method: "POST",
            headers: viatorHeaders(key),
            body: JSON.stringify(body),
          });
          // Non-ok (auth/400/etc.) is a fetch error, NOT "no products": don't
          // cache it, so a transient failure can't suppress real data for 6h.
          if (!res.ok) {
            console.error(
              `[viator] products/search ${res.status} for dest ${destId}`
            );
            return FETCH_ERROR;
          }
          resp = (await res.json()) as RawProductsResp;
        } catch {
          return FETCH_ERROR;
        }

        for (const p of resp.products ?? []) {
          const offer = toActivityOffer(p, cur);
          if (offer) return offer; // first product with all required real fields
        }
        return null; // real empty result → cacheable
      }
    );
  },
});
