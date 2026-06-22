import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Travelpayouts data layer — real flight + hotel + cheapest-destination data.
 *
 * These are the token-only Data APIs (no program approval needed): they return
 * the cheapest *cached* fares/hotel prices Travelpayouts has seen, NOT a live
 * GDS search, so prices are indicative and a few hours stale. Good enough to
 * show REAL numbers; the booking price is always re-confirmed on the provider's
 * site after the hand-off.
 *
 * NON-NEGOTIABLE RULE (carried through the whole "real data" sweep): if the API
 * does not return a field, we never fabricate it — we return null / omit it and
 * let the UI hide whatever is missing. Date and destination are BOTH optional;
 * with no destination we use origin-only "cheapest" mode (powers surprise trips).
 *
 * The token is SECRET and lives ONLY in the Convex deployment env, never in the
 * client bundle or Vercel:  npx convex env set TRAVELPAYOUTS_TOKEN <token>
 * (`TRAVELPAYOUTS_API_KEY` in .env.local is the same value; we accept either.)
 * Docs: https://travelpayouts.github.io/slate/
 */

const FLIGHTS_API =
  "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";
const HOTELS_API = "https://engine.hotellook.com/api/v2/cache.json";
const HOTEL_LOOKUP_API = "https://engine.hotellook.com/api/v2/lookup.json";
const AIRLINES_DICT = "https://api.travelpayouts.com/data/en/airlines.json";
const CITIES_DICT = "https://api.travelpayouts.com/data/en/cities.json";

// Cache TTLs. Fares/hotels go stale fast; dictionaries are static.
const FARE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const DICT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// The public dictionaries contain a few non-Latin codes (e.g. Cyrillic "СД").
// Convex object field names must be plain ASCII, and our API responses only
// ever use ASCII IATA codes anyway, so we drop non-ASCII keys when caching.
const ASCII_CODE = /^[\x20-\x7E]+$/;

/** Resolve the secret token, accepting either env name. */
function getToken(): string {
  const token =
    process.env.TRAVELPAYOUTS_TOKEN ?? process.env.TRAVELPAYOUTS_API_KEY;
  if (!token) {
    throw new Error(
      "TRAVELPAYOUTS token is not set. Run: npx convex env set TRAVELPAYOUTS_TOKEN <token>"
    );
  }
  return token;
}

// ---------------------------------------------------------------------------
// Public result types (hide-missing: optional fields are omitted when absent)
// ---------------------------------------------------------------------------

export interface FlightOffer {
  origin: string; // IATA
  destination: string; // IATA
  destinationCity: string | null; // resolved from cities dict; null if unknown
  destinationCountry: string | null; // ISO country code; null if unknown
  price: number;
  currency: string;
  airline: string; // IATA code (e.g. "Y4"); raw if dict has no name
  airlineName: string | null; // resolved display name, or null if unknown
  departureAt: string; // ISO8601 with offset, e.g. "2026-07-03T06:37:00-05:00"
  returnAt: string | null; // round trips only; null for one-way
  transfers: number;
  link: string; // path on aviasales.com — prefix with https://www.aviasales.com
}

export interface HotelOffer {
  hotelName: string;
  priceFrom: number | null;
  stars: number | null;
  currency: string;
}

// Raw API row shapes (only the fields we read), verified against live responses.
interface RawFlightRow {
  origin: string;
  destination: string;
  price: number;
  airline: string;
  departure_at: string;
  return_at?: string;
  transfers: number;
  link: string;
}

// ---------------------------------------------------------------------------
// Cache helpers (actions can't touch ctx.db directly; go through internal fns)
// ---------------------------------------------------------------------------

export const _cacheGet = internalQuery({
  args: { table: v.string(), key: v.string() },
  handler: async (ctx, { table, key }) => {
    const t = table as "tpFlightCache" | "tpHotelCache" | "tpDict";
    const row = await ctx.db
      .query(t)
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return row ? { result: row.result, fetchedAt: row.fetchedAt } : null;
  },
});

export const _cacheSet = internalMutation({
  args: { table: v.string(), key: v.string(), result: v.any() },
  handler: async (ctx, { table, key, result }) => {
    const t = table as "tpFlightCache" | "tpHotelCache" | "tpDict";
    const existing = await ctx.db
      .query(t)
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    const doc = { key, result, fetchedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert(t, doc);
    }
  },
});

type CacheTable = "tpFlightCache" | "tpHotelCache" | "tpDict";

/** Read-through cache: returns cached value if fresh, else runs `fetcher`. */
async function withCache<T>(
  ctx: { runQuery: any; runMutation: any },
  table: CacheTable,
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await ctx.runQuery(internal.travelpayouts._cacheGet, {
    table,
    key,
  });
  if (cached && Date.now() - cached.fetchedAt < ttlMs) {
    return cached.result as T;
  }
  const fresh = await fetcher();
  await ctx.runMutation(internal.travelpayouts._cacheSet, {
    table,
    key,
    result: fresh,
  });
  return fresh;
}

// ---------------------------------------------------------------------------
// Dictionaries + IATA mapping
// ---------------------------------------------------------------------------

interface AirlineDictEntry {
  code: string;
  name: string;
  name_translations?: { en?: string };
}
interface CityDictEntry {
  code: string;
  name: string;
  country_code?: string;
  has_flightable_airport?: boolean;
  name_translations?: { en?: string };
}

// Dictionaries are cached as ARRAYS of entries, not as one big keyed object:
// Convex caps a single object at 1024 fields and the airline list has ~1100+.
// We reshape the cached array into a lookup map in memory after reading.
interface AirlineDictRow {
  code: string;
  name: string;
}
interface CityDictRow {
  code: string;
  city: string;
  country: string | null;
}

/** Fetch + cache the airline dictionary, returned as { IATA -> display name }. */
async function getAirlineNames(ctx: {
  runQuery: any;
  runMutation: any;
}): Promise<Record<string, string>> {
  const rows = await withCache<AirlineDictRow[]>(
    ctx,
    "tpDict",
    "airlines",
    DICT_TTL_MS,
    async () => {
      try {
        const res = await fetch(AIRLINES_DICT);
        if (!res.ok) return [];
        const raw = (await res.json()) as AirlineDictEntry[];
        const out: AirlineDictRow[] = [];
        for (const r of raw) {
          if (!r.code || !ASCII_CODE.test(r.code)) continue;
          const name = r.name_translations?.en ?? r.name;
          if (name) out.push({ code: r.code, name });
        }
        return out;
      } catch {
        return [];
      }
    }
  );
  const map: Record<string, string> = {};
  for (const r of rows) map[r.code] = r.name;
  return map;
}

/** Fetch + cache the city dictionary, returned as { IATA -> {city, country} }. */
async function getCityInfo(ctx: {
  runQuery: any;
  runMutation: any;
}): Promise<Record<string, { city: string; country: string | null }>> {
  const rows = await withCache<CityDictRow[]>(
    ctx,
    "tpDict",
    "cities",
    DICT_TTL_MS,
    async () => {
      try {
        const res = await fetch(CITIES_DICT);
        if (!res.ok) return [];
        const raw = (await res.json()) as CityDictEntry[];
        const out: CityDictRow[] = [];
        for (const r of raw) {
          if (!r.code || !ASCII_CODE.test(r.code)) continue;
          // Only keep cities with flights — the only destinations we resolve.
          // This also keeps the cached array under Convex's 8192-element cap.
          if (r.has_flightable_airport === false) continue;
          out.push({
            code: r.code,
            city: r.name_translations?.en ?? r.name,
            country: r.country_code ?? null,
          });
        }
        return out;
      } catch {
        return [];
      }
    }
  );
  const map: Record<string, { city: string; country: string | null }> = {};
  for (const r of rows) map[r.code] = { city: r.city, country: r.country };
  return map;
}

/**
 * Static map for the wizard's CITIES list → IATA. These are departure cities
 * the user can pick; the catalog's `from`/`to` codes are normalized below.
 */
export const CITY_TO_IATA: Record<string, string> = {
  "Mexico City": "MEX",
  Monterrey: "MTY",
  Guadalajara: "GDL",
  "New York": "JFK",
  "Los Angeles": "LAX",
};

// The catalog uses some non-IATA codes that need fixing up.
const CATALOG_CODE_FIXUPS: Record<string, string> = {
  CDMX: "MEX", // Mexico City written in local shorthand
};

/**
 * Normalize a catalog `from`/`to` code into a real IATA airport/city code.
 * Returns null for codes that are NOT a flight route (the cruise's "Port"),
 * so downstream can hide the flight line for those rows.
 */
export function normalizeIata(code: string): string | null {
  if (!code) return null;
  if (code === "Port") return null; // cruise embarkation, not an airport
  return CATALOG_CODE_FIXUPS[code] ?? code;
}

// ---------------------------------------------------------------------------
// Flight search
// ---------------------------------------------------------------------------

/** Map a raw API row + dictionaries into our hide-missing FlightOffer. */
function toFlightOffer(
  row: RawFlightRow,
  currency: string,
  airlineNames: Record<string, string>,
  cityInfo: Record<string, { city: string; country: string | null }>
): FlightOffer {
  const dest = cityInfo[row.destination];
  return {
    origin: row.origin,
    destination: row.destination,
    destinationCity: dest?.city ?? null,
    destinationCountry: dest?.country ?? null,
    price: row.price,
    currency,
    airline: row.airline,
    airlineName: airlineNames[row.airline] ?? null,
    departureAt: row.departure_at,
    returnAt: row.return_at ?? null,
    transfers: row.transfers,
    link: row.link,
  };
}

async function fetchFlightRows(
  params: URLSearchParams
): Promise<RawFlightRow[]> {
  try {
    const res = await fetch(`${FLIGHTS_API}?${params}`);
    if (!res.ok) return [];
    const body = (await res.json()) as {
      success?: boolean;
      data?: RawFlightRow[];
    };
    if (body.success === false) return [];
    return body.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Cheapest single fare for a route. `destination` AND `departureAt` are BOTH
 * optional: with no destination we omit it so the API returns the single
 * cheapest reachable route from `origin` (origin-only mode). By default we
 * request a round trip (`one_way:false`) and capture both `departure_at` and
 * `return_at`, because the app shows N-night trips — real return dates matter.
 * Set `oneWay:true` for a one-way fare. Returns null if TP has nothing.
 */
export const searchCheapestFlight = action({
  args: {
    origin: v.string(), // IATA, e.g. "MEX"
    destination: v.optional(v.string()), // IATA, e.g. "CUN"; omit for cheapest-anywhere
    // YYYY-MM or YYYY-MM-DD; omit to let TP pick the cheapest upcoming date.
    departureAt: v.optional(v.string()),
    oneWay: v.optional(v.boolean()), // default false (round trip)
    currency: v.optional(v.string()), // default "usd"
  },
  handler: async (ctx, { origin, destination, departureAt, oneWay, currency }) => {
    const token = getToken();
    const cur = currency ?? "usd";
    const rt = oneWay ? false : true; // round trip by default
    const key = `flight:${origin}:${destination ?? "ANY"}:${
      departureAt ?? "ANY"
    }:${rt ? "rt" : "ow"}:${cur}`;

    return withCache<FlightOffer | null>(
      ctx,
      "tpFlightCache",
      key,
      FARE_TTL_MS,
      async () => {
        const params = new URLSearchParams({
          origin,
          currency: cur,
          sorting: "price",
          direct: "false",
          limit: "1",
          one_way: oneWay ? "true" : "false",
          market: "us",
          token,
        });
        if (destination) params.set("destination", destination);
        if (departureAt) params.set("departure_at", departureAt);

        const rows = await fetchFlightRows(params);
        const top = rows[0];
        if (!top) return null; // no cached fare for this route/date

        const [airlineNames, cityInfo] = await Promise.all([
          getAirlineNames(ctx),
          getCityInfo(ctx),
        ]);
        return toFlightOffer(top, cur, airlineNames, cityInfo);
      }
    );
  },
});

/**
 * The engine for "destination not required": cheapest REAL destinations from an
 * origin. `unique:true` collapses to one fare per destination; `sorting:price`
 * orders cheapest-first. Returns an array (possibly empty) of round-trip
 * FlightOffers — destination IATA, price, airline, departure_at, return_at,
 * transfers, link — each enriched with the resolved airline name when known.
 */
export const searchCheapestDestinations = action({
  args: {
    origin: v.string(), // IATA
    limit: v.optional(v.number()), // default 6
    currency: v.optional(v.string()), // default "usd"
  },
  handler: async (ctx, { origin, limit, currency }) => {
    const token = getToken();
    const cur = currency ?? "usd";
    const n = Math.max(1, Math.min(limit ?? 6, 30));
    const key = `dests:${origin}:${n}:${cur}`;

    return withCache<FlightOffer[]>(
      ctx,
      "tpFlightCache",
      key,
      FARE_TTL_MS,
      async () => {
        const params = new URLSearchParams({
          origin,
          currency: cur,
          sorting: "price",
          unique: "true",
          one_way: "false",
          direct: "false",
          limit: String(n),
          market: "us",
          token,
        });

        const rows = await fetchFlightRows(params);
        if (rows.length === 0) return [];

        const [airlineNames, cityInfo] = await Promise.all([
          getAirlineNames(ctx),
          getCityInfo(ctx),
        ]);
        return rows.map((r) => toFlightOffer(r, cur, airlineNames, cityInfo));
      }
    );
  },
});

// ---------------------------------------------------------------------------
// Hotel search (Hotellook cache.json)
// ---------------------------------------------------------------------------

interface RawHotelRow {
  hotelName?: string;
  priceFrom?: number;
  stars?: number;
}

/**
 * Resolve a human location ("Cancun") → Hotellook locationId via lookup.json.
 * Returns null on any failure (caller then tries the raw `location` string).
 */
async function lookupLocationId(
  query: string,
  token: string
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      query,
      lang: "en",
      lookFor: "city",
      limit: "1",
      token,
    });
    const res = await fetch(`${HOTEL_LOOKUP_API}?${params}`);
    if (!res.ok) return null;
    const body = (await res.json()) as {
      results?: { locations?: Array<{ id?: string | number }> };
    };
    const id = body.results?.locations?.[0]?.id;
    return id != null ? String(id) : null;
  } catch {
    return null;
  }
}

/**
 * Cheapest real hotel for a destination over a date range, from Hotellook's
 * cache.json. Accepts either `destinationIata` (e.g. "CUN") or a human
 * `location` (e.g. "Cancun"); we resolve a locationId when given a name.
 * Returns a real { hotelName, priceFrom, stars, currency } or null — NEVER an
 * invented hotel. Missing price/stars come back as null on the row.
 */
export const searchHotel = action({
  args: {
    destinationIata: v.optional(v.string()), // e.g. "CUN"
    location: v.optional(v.string()), // human name, e.g. "Cancun"
    checkIn: v.string(), // YYYY-MM-DD
    checkOut: v.string(), // YYYY-MM-DD
    adults: v.optional(v.number()), // default 2
    currency: v.optional(v.string()), // default "usd"
  },
  handler: async (
    ctx,
    { destinationIata, location, checkIn, checkOut, adults, currency }
  ) => {
    const token = getToken();
    const cur = currency ?? "usd";
    const pax = adults ?? 2;
    const place = destinationIata ?? location ?? "";
    if (!place) return null;
    const key = `hotel:${place}:${checkIn}:${checkOut}:${pax}:${cur}`;

    return withCache<HotelOffer | null>(
      ctx,
      "tpHotelCache",
      key,
      FARE_TTL_MS,
      async () => {
        // Build the `location` value cache.json expects: prefer the IATA code,
        // else resolve the human name to a locationId, else pass the name raw.
        let locationParam = destinationIata ?? location ?? "";
        if (!destinationIata && location) {
          const id = await lookupLocationId(location, token);
          if (id) locationParam = id;
        }

        const params = new URLSearchParams({
          location: locationParam,
          checkIn,
          checkOut,
          adults: String(pax),
          currency: cur,
          limit: "1",
          token,
        });

        try {
          const res = await fetch(`${HOTELS_API}?${params}`);
          if (!res.ok) return null; // host down / no data → hide, never lie
          const rows = (await res.json()) as RawHotelRow[] | { error?: string };
          if (!Array.isArray(rows) || rows.length === 0) return null;
          const top = rows[0];
          if (!top.hotelName) return null; // no real hotel name → hide
          const offer: HotelOffer = {
            hotelName: top.hotelName,
            priceFrom: typeof top.priceFrom === "number" ? top.priceFrom : null,
            stars: typeof top.stars === "number" ? top.stars : null,
            currency: cur,
          };
          return offer;
        } catch {
          return null;
        }
      }
    );
  },
});
