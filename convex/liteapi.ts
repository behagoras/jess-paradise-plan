import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { toMxn } from "./fx";

/**
 * LiteAPI data layer - REAL hotel rates for a destination.
 *
 * This replaces the dead Hotellook cache.json (404) as the hotel source. We use
 * LiteAPI v3's rate search (POST /hotels/rates) which returns REAL, indicative
 * cached rates per hotel, then resolve the cheapest hotel's static content
 * (name / star rating) via GET /data/hotel. The rate is read-only and safe to
 * run with the production key; the booking price is always re-confirmed on the
 * provider's site after the hand-off.
 *
 * Verified against live responses (prod key) on 2026-06-22:
 *  - POST https://api.liteapi.travel/v3.0/hotels/rates
 *      body: { checkin, checkout, currency, guestNationality, occupancies:[{adults}],
 *              cityName+countryCode | latitude+longitude+radius | iataCode,
 *              limit, maxRatesPerHotel }
 *      200 → { data: [ { hotelId, roomTypes:[ { rates:[ {
 *               retailRate: { total: [ { amount, currency } ] } } ] } ] } ] }
 *      204 → no availability (empty)
 *  - GET https://api.liteapi.travel/v3.0/data/hotel?hotelId=<id>
 *      200 → { data: { name, starRating(int), main_photo, ... } }
 *
 * NON-NEGOTIABLE HONESTY (mirrors convex/travelpayouts.ts): if the API does not
 * return a field, we never fabricate it - we return null / omit it and let the
 * UI hide whatever is missing. A non-ok / empty response → null (hide-missing),
 * NEVER an invented hotel, price, or rating. The rate is INDICATIVE (cached) and
 * is never presented as a bookable quote.
 *
 * The key is SECRET and lives ONLY in the Convex deployment env, never in the
 * client bundle. We prefer the prod key (rate search is read-only/safe and
 * returns real data); fall back to sandbox. Header: "X-API-Key".
 * Docs: https://docs.liteapi.travel
 */

const RATES_API = "https://api.liteapi.travel/v3.0/hotels/rates";
const HOTEL_DATA_API = "https://api.liteapi.travel/v3.0/data/hotel";

// Rates go stale fast (a few hours); reuse the same fare TTL as Travelpayouts.
const RATE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Resolve the LiteAPI key: prefer prod (real data), fall back to sandbox. */
function getKey(): string {
  const key =
    process.env.NUITE_PROD_API_KEY ?? process.env.NUITE_SANDBOX_API_KEY;
  if (!key) {
    throw new Error(
      "LiteAPI key is not set. Run: npx convex env set NUITE_PROD_API_KEY <key>"
    );
  }
  return key;
}

// ---------------------------------------------------------------------------
// Public result type (hide-missing: optional fields are null when absent)
// ---------------------------------------------------------------------------

export interface HotelLiteOffer {
  hotelName: string;
  priceFrom: number; // cheapest real total-stay rate (the request currency)
  stars: number | null; // star rating (1–5), or null if unknown
  currency: string;
  bookingUrl?: string; // present only if the API surfaces a real deep link
}

// Raw API row shapes (only the fields we read), verified against live responses.
interface RawTotal {
  amount?: number;
  currency?: string;
}
interface RawRate {
  retailRate?: { total?: RawTotal[] };
}
interface RawRoomType {
  rates?: RawRate[];
}
interface RawRateHotel {
  hotelId?: string;
  roomTypes?: RawRoomType[];
}
interface RawRatesResp {
  data?: RawRateHotel[];
}
interface RawHotelData {
  data?: {
    name?: string;
    starRating?: number;
  };
}

/**
 * Sentinel returned by a fetcher to mean "this was a FETCH ERROR (non-ok /
 * network / parse failure), NOT a real no-availability result - do NOT cache
 * it." A genuine empty result (a 204 / 200 with no usable rate) is still
 * cacheable as `null`; only transient/auth failures use this so a single bad
 * call can't suppress real rates for the full 6h TTL.
 */
const FETCH_ERROR = Symbol("liteapi-fetch-error");
type FetchResult<T> = T | typeof FETCH_ERROR;

// ---------------------------------------------------------------------------
// Cache helpers (actions can't touch ctx.db directly; go through internal fns)
// ---------------------------------------------------------------------------

export const _liteCacheGet = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db
      .query("liteHotelCache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return row ? { result: row.result, fetchedAt: row.fetchedAt } : null;
  },
});

export const _liteCacheSet = internalMutation({
  args: { key: v.string(), result: v.any() },
  handler: async (ctx, { key, result }) => {
    const existing = await ctx.db
      .query("liteHotelCache")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    const doc = { key, result, fetchedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("liteHotelCache", doc);
  },
});

/**
 * Read-through cache. The fetcher may return the FETCH_ERROR sentinel to signal
 * a transient/auth failure - in that case we do NOT persist anything (so the
 * upstream can recover before the TTL elapses) and surface `null` for this call
 * only. A real value (including a legitimately empty `null`) is cached normally.
 */
async function withCache<T>(
  ctx: { runQuery: any; runMutation: any },
  key: string,
  ttlMs: number,
  fetcher: () => Promise<FetchResult<T>>
): Promise<T | null> {
  const cached = await ctx.runQuery(internal.liteapi._liteCacheGet, { key });
  if (cached && Date.now() - cached.fetchedAt < ttlMs) {
    return cached.result as T;
  }
  const fresh = await fetcher();
  if (fresh === FETCH_ERROR) {
    // Transient/auth failure → don't poison the cache; just hide for now.
    return null;
  }
  await ctx.runMutation(internal.liteapi._liteCacheSet, {
    key,
    result: fresh,
  });
  return fresh;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Cheapest real total-stay amount for a rate-hotel row, or null. */
function cheapestTotal(hotel: RawRateHotel): { amount: number; currency: string } | null {
  let best: { amount: number; currency: string } | null = null;
  for (const rt of hotel.roomTypes ?? []) {
    for (const r of rt.rates ?? []) {
      for (const t of r.retailRate?.total ?? []) {
        if (typeof t.amount === "number" && t.currency) {
          if (!best || t.amount < best.amount) {
            best = { amount: t.amount, currency: t.currency };
          }
        }
      }
    }
  }
  return best;
}

/**
 * Resolve a hotelId → static content (real name + star rating). Returns null on
 * a real "no name" response (we never fabricate a hotel name → hide), or the
 * FETCH_ERROR sentinel on a transient/auth failure so the caller can avoid
 * caching a null that would suppress real data for the full TTL.
 */
async function fetchHotelStatic(
  hotelId: string,
  key: string
): Promise<FetchResult<{ name: string; stars: number | null } | null>> {
  try {
    const res = await fetch(`${HOTEL_DATA_API}?hotelId=${encodeURIComponent(hotelId)}`, {
      headers: { "X-API-Key": key },
    });
    if (!res.ok) return FETCH_ERROR; // transient/auth → don't cache
    const body = (await res.json()) as RawHotelData;
    const name = body.data?.name;
    if (!name) return null; // no real name → hide (cacheable)
    const stars =
      typeof body.data?.starRating === "number" ? body.data.starRating : null;
    return { name, stars };
  } catch {
    return FETCH_ERROR;
  }
}

// ---------------------------------------------------------------------------
// Public action - cheapest REAL hotel for the SELECTED destination
// ---------------------------------------------------------------------------

/**
 * Cheapest real hotel for a destination over a date range, from LiteAPI's rate
 * search. Pass EITHER `city`+`countryCode`, OR `lat`+`lon` (a radius default is
 * applied), OR `iataCode`. Returns a real
 * { hotelName, priceFrom, stars, currency, bookingUrl? } or null - NEVER an
 * invented hotel. Designed to be called LAZILY for the single selected offer
 * (when Detail opens), not eagerly for every candidate.
 */
export const searchHotelLite = action({
  args: {
    city: v.optional(v.string()), // e.g. "Cancun"
    countryCode: v.optional(v.string()), // ISO-2, e.g. "MX"
    lat: v.optional(v.number()),
    lon: v.optional(v.number()),
    iataCode: v.optional(v.string()), // e.g. "CUN"
    checkIn: v.string(), // YYYY-MM-DD
    checkOut: v.string(), // YYYY-MM-DD
    adults: v.optional(v.number()), // default 2
    currency: v.optional(v.string()), // default "MXN"
  },
  handler: async (
    ctx,
    { city, countryCode, lat, lon, iataCode, checkIn, checkOut, adults, currency }
  ): Promise<HotelLiteOffer | null> => {
    const key = getKey();
    const cur = (currency ?? "MXN").toUpperCase();
    const pax = adults ?? 2;

    // A stable place token for the cache key + the location body.
    const place =
      city && countryCode
        ? `${city}:${countryCode}`
        : lat != null && lon != null
          ? `geo:${lat.toFixed(2)}:${lon.toFixed(2)}`
          : iataCode
            ? `iata:${iataCode}`
            : "";
    if (!place) return null; // no usable location → hide-missing

    const cacheKey = `lite:${place}:${checkIn}:${checkOut}:${pax}:${cur}`;

    return withCache<HotelLiteOffer | null>(
      ctx,
      cacheKey,
      RATE_TTL_MS,
      async () => {
        // Build the location half of the body from whatever we were given.
        const location: Record<string, unknown> = {};
        if (city && countryCode) {
          location.cityName = city;
          location.countryCode = countryCode;
        } else if (lat != null && lon != null) {
          location.latitude = lat;
          location.longitude = lon;
          location.radius = 20000; // metres; keep it tight to the city centre
        } else if (iataCode) {
          location.iataCode = iataCode;
        }

        const body = {
          ...location,
          checkin: checkIn,
          checkout: checkOut,
          currency: cur,
          guestNationality: "US",
          occupancies: [{ adults: pax }],
          limit: 25,
          maxRatesPerHotel: 1, // cheapest rate per hotel
        };

        let resp: RawRatesResp;
        try {
          const res = await fetch(RATES_API, {
            method: "POST",
            headers: {
              "X-API-Key": key,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
          });
          // 204 = real "no availability" (cacheable null). Any other non-2xx is
          // a fetch error (auth/rate-limit/etc.), NOT no-availability: don't
          // cache it so a transient failure can't suppress real rates for 6h.
          if (res.status === 204) return null;
          if (!res.ok) {
            console.error(`[liteapi] rates ${res.status} for ${place}`);
            return FETCH_ERROR;
          }
          resp = (await res.json()) as RawRatesResp;
        } catch {
          return FETCH_ERROR;
        }

        const rows = resp.data ?? [];
        if (rows.length === 0) return null; // real empty result → cacheable

        // Find the single cheapest (hotel, total) across the returned rates.
        let bestHotelId: string | null = null;
        let bestPrice: number | null = null;
        let bestCurrency = cur;
        for (const h of rows) {
          if (!h.hotelId) continue;
          const t = cheapestTotal(h);
          if (t && (bestPrice == null || t.amount < bestPrice)) {
            bestHotelId = h.hotelId;
            bestPrice = t.amount;
            bestCurrency = t.currency;
          }
        }
        if (!bestHotelId || bestPrice == null) return null;

        // Resolve the real name + star rating. A transient static-content
        // failure → don't cache (FETCH_ERROR); a real "no name" → hide. Either
        // way we never show a nameless priced row.
        const stat = await fetchHotelStatic(bestHotelId, key);
        if (stat === FETCH_ERROR) return FETCH_ERROR;
        if (!stat) return null;

        // Ensure MXN. We request MXN natively, but if LiteAPI quoted another
        // currency we CONVERT with a real cached rate (never omit a mismatched
        // price). If FX is unavailable we keep the original amount + currency,
        // labelled honestly - we never fabricate a rate.
        let priceFrom = bestPrice;
        let currencyOut = bestCurrency;
        if (bestCurrency.toUpperCase() !== "MXN") {
          const converted = await toMxn(ctx, bestPrice, bestCurrency);
          if (converted != null) {
            priceFrom = converted;
            currencyOut = "MXN";
          }
        } else {
          currencyOut = "MXN";
        }

        const offer: HotelLiteOffer = {
          hotelName: stat.name,
          priceFrom,
          stars: stat.stars,
          currency: currencyOut,
        };
        return offer;
      }
    );
  },
});
