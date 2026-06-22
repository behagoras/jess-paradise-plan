import {
  action,
  internalAction,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Destination-index enrichment pipeline (Phase 1b).
 *
 * Goal: let the reverse search rank ARBITRARY real destinations by vibe/weather,
 * not just the 6 curated catalog entries. We build a scalable, lazily-filled
 * index (table `tpDestIndex`, keyed by IATA) whose climate/geo tags are derived
 * from OPEN data. In this phase the only enricher is Wikidata (needs no key);
 * the pipeline is architected so a second enricher (OpenTripMap, key coming
 * later) plugs in additively - it would just append to `geoTags`/`sources`.
 *
 * NON-NEGOTIABLE HONESTY (mirrors convex/travelpayouts.ts): index-derived
 * climate/geo tags are used ONLY for ranking/banding, NEVER displayed in the UI
 * as a factual claim ("the weather is Hot"). If a field can't be derived we
 * leave it null/empty; the destination simply stays less-known, never faked.
 * The lat→weather fallback in particular is a COARSE geographic estimate, used
 * for ranking only.
 *
 * Data flow (one IATA per call, to stay polite to Wikidata):
 *   resolve IATA→{city,country} (getCityInfo) → Wikidata wbsearchentities (QID)
 *   → wbgetentities claims (P625 coords, P2564 Köppen, P31 instance-of)
 *   → map to {climate, geoTags} → cache a tpDestIndex row.
 * `getDestIndex` reads cached rows and, for missing/stale IATAs, schedules
 * `enrichDestination` asynchronously (staggered) so the NEXT search ranks them.
 */

// Wikidata public REST API - no token required. Be polite: one dest per call.
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
// Wikimedia's User-Agent policy returns 403 for requests with a missing or
// generic UA, which would make enrichment fail silently. Send a descriptive,
// contactable UA on every Wikidata call.
const WIKIDATA_HEADERS = {
  "User-Agent":
    "ParadisePlan/1.0 (https://github.com/behagoras/jess-paradise-plan; davbelom@gmail.com)",
  Accept: "application/json",
};
// Re-enrich after ~60 days; Köppen/coords are effectively static, so this is
// just a slow self-heal, not a hot cache.
const INDEX_TTL_MS = 60 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Row shape + internal table accessors (mirror the travelpayouts cache fns)
// ---------------------------------------------------------------------------

export interface DestIndexRow {
  iata: string;
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
  koppen?: string;
  climate?: string;
  geoTags: string[];
  sources: string[];
  fetchedAt: number;
}

const destRowValidator = v.object({
  iata: v.string(),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  lat: v.optional(v.number()),
  lon: v.optional(v.number()),
  koppen: v.optional(v.string()),
  climate: v.optional(v.string()),
  geoTags: v.array(v.string()),
  sources: v.array(v.string()),
  fetchedAt: v.number(),
});

export const _indexGet = internalQuery({
  args: { iata: v.string() },
  handler: async (ctx, { iata }) => {
    const row = await ctx.db
      .query("tpDestIndex")
      .withIndex("by_iata", (q) => q.eq("iata", iata))
      .first();
    if (!row) return null;
    const { _id, _creationTime, ...rest } = row;
    void _id;
    void _creationTime;
    return rest as DestIndexRow;
  },
});

export const _indexSet = internalMutation({
  args: { row: destRowValidator },
  handler: async (ctx, { row }) => {
    const existing = await ctx.db
      .query("tpDestIndex")
      .withIndex("by_iata", (q) => q.eq("iata", row.iata))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, row);
    } else {
      await ctx.db.insert("tpDestIndex", row);
    }
  },
});

// ---------------------------------------------------------------------------
// PURE mappers (kept side-effect-free + unit-testable)
// ---------------------------------------------------------------------------

/**
 * Map a Köppen climate code to the wizard WEATHER taxonomy
 * ("Hot"|"Cold"|"Windy"|"Perfect"|"Mild"|"Snow"). Returns null for an
 * unrecognized code so the caller can fall back to a lat estimate.
 *
 * Bands (first letter dominates; second letter refines the B group):
 *   A  tropical                       → "Hot"
 *   B  arid; hot desert/steppe (BWh/BSh) → "Hot"; cold variants (BWk/BSk) → "Mild"
 *   C  temperate / mild               → "Perfect" (Cs/Cf), milder Cw → "Mild"
 *   D  continental                    → "Cold"
 *   E  polar; H alpine highland       → "Snow"
 * RANKING ONLY - never surfaced as a factual claim.
 */
export function koppenToWeather(koppen: string): string | null {
  if (!koppen) return null;
  const code = koppen.trim();
  const a = code[0]?.toUpperCase();
  const b = code[1]?.toLowerCase();
  switch (a) {
    case "A":
      return "Hot";
    case "B":
      // Hot desert/steppe are scorching → "Hot"; cold-arid (BWk/BSk) → "Mild".
      return b === "k" ? "Mild" : "Hot";
    case "C":
      // Cw (dry-winter subtropical) reads milder than the Mediterranean/oceanic
      // Cs/Cf "Perfect" band.
      return b === "w" ? "Mild" : "Perfect";
    case "D":
      return "Cold";
    case "E":
    case "H": // some sources prefix alpine highland climates with H
      return "Snow";
    default:
      return null;
  }
}

/**
 * COARSE latitude→weather fallback, used ONLY when Köppen is absent. This is a
 * geographic estimate by absolute latitude band, never a measured climate - it
 * exists purely so an un-enriched destination can still be ranked, and is never
 * shown to the user as a factual claim.
 *   |lat| < 23.5  tropical    → "Hot"
 *   |lat| < 35    subtropical → "Mild"
 *   |lat| < 55    temperate   → "Perfect"
 *   else          high lat    → "Cold"
 */
export function latToWeatherFallback(lat: number): string {
  const a = Math.abs(lat);
  if (a < 23.5) return "Hot";
  if (a < 35) return "Mild";
  if (a < 55) return "Perfect";
  return "Cold";
}

/**
 * Map a Wikidata "instance of" (P31) label to a wizard GENERAL tag, conservative
 * - only return a tag when the type CLEARLY implies it. Returns null otherwise.
 * RANKING ONLY.
 */
export function typeLabelToGeoTag(label: string): string | null {
  const l = label.toLowerCase();
  // Beach / coastal / seaside.
  if (
    l.includes("seaside resort") ||
    l.includes("beach") ||
    l.includes("coastal") ||
    l.includes("seaside") ||
    l.includes("island") ||
    l.includes("archipelago") ||
    l.includes("resort town")
  ) {
    return "Beach";
  }
  // Nature / parks / mountains.
  if (
    l.includes("national park") ||
    l.includes("nature reserve") ||
    l.includes("protected area") ||
    l.includes("mountain") ||
    l.includes("volcano") ||
    l.includes("lake") ||
    l.includes("natural")
  ) {
    return "Nature";
  }
  // Historic / heritage / old town.
  if (
    l.includes("world heritage") ||
    l.includes("historic") ||
    l.includes("old town") ||
    l.includes("archaeological") ||
    l.includes("ancient city")
  ) {
    return "Historic";
  }
  // Museums (rarely an instance-of for a city, but kept for completeness).
  if (l.includes("museum")) return "Museums";
  return null;
}

// ---------------------------------------------------------------------------
// Wikidata helpers (no key; conservative parsing, fail soft)
// ---------------------------------------------------------------------------

interface WdSearchResp {
  search?: Array<{ id?: string }>;
}
interface WdEntitiesResp {
  entities?: Record<
    string,
    {
      labels?: Record<string, { value?: string }>;
      claims?: Record<string, WdClaim[]>;
    }
  >;
}
interface WdClaim {
  mainsnak?: {
    datavalue?: {
      value?: unknown;
    };
  };
}

/** Resolve a city name → best-match QID, or null. */
async function searchQid(name: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "wbsearchentities",
      search: name,
      language: "en",
      format: "json",
      limit: "1",
      type: "item",
    });
    const res = await fetch(`${WIKIDATA_API}?${params}`, {
      headers: WIKIDATA_HEADERS,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as WdSearchResp;
    return body.search?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

/** Fetch claims (+labels) for a set of QIDs. Returns the `entities` map or {}. */
async function getEntities(
  ids: string[]
): Promise<NonNullable<WdEntitiesResp["entities"]>> {
  if (ids.length === 0) return {};
  try {
    const params = new URLSearchParams({
      action: "wbgetentities",
      ids: ids.join("|"),
      props: "claims|labels",
      languages: "en",
      format: "json",
    });
    const res = await fetch(`${WIKIDATA_API}?${params}`, {
      headers: WIKIDATA_HEADERS,
    });
    if (!res.ok) return {};
    const body = (await res.json()) as WdEntitiesResp;
    return body.entities ?? {};
  } catch {
    return {};
  }
}

/** Pull the item QIDs referenced by a property's claims (P31/P2564 are items). */
function claimItemIds(claims: WdClaim[] | undefined): string[] {
  if (!claims) return [];
  const out: string[] = [];
  for (const c of claims) {
    const value = c.mainsnak?.datavalue?.value as
      | { id?: string }
      | undefined;
    if (value?.id) out.push(value.id);
  }
  return out;
}

/** Pull P625 coordinates (first claim) → {lat, lon} or null. */
function claimCoords(
  claims: WdClaim[] | undefined
): { lat: number; lon: number } | null {
  const value = claims?.[0]?.mainsnak?.datavalue?.value as
    | { latitude?: number; longitude?: number }
    | undefined;
  if (
    value &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number"
  ) {
    return { lat: value.latitude, lon: value.longitude };
  }
  return null;
}

/**
 * From a P2564 (Köppen climate) item label, extract the Köppen code. Wikidata
 * labels look like "tropical savanna climate (Aw)" or just "Aw"; grab a 1–3
 * char code in parens, else a leading token that looks like a Köppen code.
 */
function extractKoppenCode(label: string): string | null {
  const paren = label.match(/\(([A-EH][A-Za-z]{0,2})\)/);
  if (paren) return paren[1];
  const lead = label.trim().match(/^([A-EH][A-Za-z]{0,2})\b/);
  if (lead) return lead[1];
  return null;
}

// ---------------------------------------------------------------------------
// getCityInfo bridge - resolve IATA→{city,country} via the travelpayouts dict.
// (Re-implemented locally so this module stays self-contained; the cities dict
// is already cached in tpDict so this is a cheap cache read in steady state.)
// ---------------------------------------------------------------------------

const CITIES_DICT = "https://api.travelpayouts.com/data/en/cities.json";
const DICT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ASCII_CODE = /^[\x20-\x7E]+$/;

interface CityDictEntry {
  code: string;
  name: string;
  country_code?: string;
  has_flightable_airport?: boolean;
  name_translations?: { en?: string };
}
interface CityDictRow {
  code: string;
  city: string;
  country: string | null;
}

async function getCityInfo(ctx: {
  runQuery: typeof internalQuery extends never ? never : any;
  runMutation: any;
}): Promise<Record<string, { city: string; country: string | null }>> {
  const cached = await ctx.runQuery(internal.travelpayouts._cacheGet, {
    table: "tpDict",
    key: "cities",
  });
  let rows: CityDictRow[];
  if (cached && Date.now() - cached.fetchedAt < DICT_TTL_MS) {
    rows = cached.result as CityDictRow[];
  } else {
    rows = await fetchCityRows();
    await ctx.runMutation(internal.travelpayouts._cacheSet, {
      table: "tpDict",
      key: "cities",
      result: rows,
    });
  }
  const map: Record<string, { city: string; country: string | null }> = {};
  for (const r of rows) map[r.code] = { city: r.city, country: r.country };
  return map;
}

async function fetchCityRows(): Promise<CityDictRow[]> {
  try {
    const res = await fetch(CITIES_DICT);
    if (!res.ok) return [];
    const raw = (await res.json()) as CityDictEntry[];
    const out: CityDictRow[] = [];
    for (const r of raw) {
      if (!r.code || !ASCII_CODE.test(r.code)) continue;
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

// ---------------------------------------------------------------------------
// Enrichment action - ONE destination per call (polite to Wikidata)
// ---------------------------------------------------------------------------

/**
 * Enrich a single IATA: resolve its city/country, query Wikidata for
 * coordinates / Köppen climate / type, map those to the wizard taxonomy, and
 * cache a tpDestIndex row. On ANY failure we STILL write a minimal row
 * (city/country only, empty geoTags) so we don't re-hammer Wikidata on every
 * search - the row's `fetchedAt` gates the ~60-day re-try in getDestIndex.
 *
 * `internalAction`: only ever invoked by the scheduler from `getDestIndex`,
 * never directly by the client, so it stays off the public API surface and is
 * referenced as `internal.destIndex.enrichDestination`.
 */
export const enrichDestination = internalAction({
  args: { iata: v.string() },
  handler: async (ctx, { iata }) => {
    const cityInfo = await getCityInfo(ctx);
    const info = cityInfo[iata];
    const city = info?.city;
    const country = info?.country ?? undefined;

    // Base row: whatever we know without Wikidata. Always written at the end.
    const row: DestIndexRow = {
      iata,
      city,
      country: country ?? undefined,
      geoTags: [],
      sources: ["wikidata"],
      fetchedAt: Date.now(),
    };

    if (!city) {
      // No city name to search Wikidata with → write the minimal row and stop.
      await ctx.runMutation(internal.destIndex._indexSet, { row });
      return;
    }

    try {
      const qid = await searchQid(city);
      if (!qid) {
        await ctx.runMutation(internal.destIndex._indexSet, { row });
        return;
      }

      const entities = await getEntities([qid]);
      const ent = entities[qid];
      const claims = ent?.claims ?? {};

      // P625 - coordinates.
      const coords = claimCoords(claims["P625"]);
      if (coords) {
        row.lat = coords.lat;
        row.lon = coords.lon;
      }

      // Collect the item QIDs we still need labels for: P2564 (Köppen) and the
      // P31 (instance of) types. Resolve them in ONE wbgetentities call.
      const koppenIds = claimItemIds(claims["P2564"]);
      const typeIds = claimItemIds(claims["P31"]);
      const refIds = [...new Set([...koppenIds, ...typeIds])];
      const refEntities = await getEntities(refIds);
      const labelOf = (id: string): string =>
        refEntities[id]?.labels?.en?.value ?? "";

      // Köppen → code → climate.
      for (const id of koppenIds) {
        const code = extractKoppenCode(labelOf(id));
        if (code) {
          row.koppen = code;
          break;
        }
      }
      const koppenClimate = row.koppen ? koppenToWeather(row.koppen) : null;
      if (koppenClimate) {
        row.climate = koppenClimate;
      } else if (coords) {
        // Coarse geographic estimate, ranking-only (documented above).
        row.climate = latToWeatherFallback(coords.lat);
      }

      // P31 → conservative geo tags (deduped).
      const tags = new Set<string>();
      for (const id of typeIds) {
        const tag = typeLabelToGeoTag(labelOf(id));
        if (tag) tags.add(tag);
      }
      row.geoTags = [...tags];

      await ctx.runMutation(internal.destIndex._indexSet, { row });
    } catch {
      // Any unexpected failure: still persist the minimal row so we back off.
      await ctx.runMutation(internal.destIndex._indexSet, { row });
    }
  },
});

// ---------------------------------------------------------------------------
// Read action - non-blocking lazy auto-fill
// ---------------------------------------------------------------------------

export interface DestVibe {
  climate: string | null;
  geoTags: string[];
}

/**
 * Read cached index rows for `iatas` and return a map iata→{climate, geoTags}
 * (or null when not yet enriched). For any IATA that is MISSING or STALE
 * (older than ~60 days), schedule enrichment ASYNCHRONOUSLY (small stagger to
 * avoid rate-limiting Wikidata) and return immediately with whatever is cached.
 * This is the lazy auto-fill: each search enqueues enrichment of unknown
 * destinations so the NEXT search can rank them by real vibe.
 */
export const getDestIndex = action({
  args: { iatas: v.array(v.string()) },
  handler: async (ctx, { iatas }) => {
    const out: Record<string, DestVibe | null> = {};
    const toEnrich: string[] = [];
    const now = Date.now();
    const unique = [...new Set(iatas)];

    for (const iata of unique) {
      const row = (await ctx.runQuery(internal.destIndex._indexGet, {
        iata,
      })) as DestIndexRow | null;

      if (row) {
        out[iata] = {
          climate: row.climate ?? null,
          geoTags: row.geoTags ?? [],
        };
        // Stale → refresh in the background, but still serve the cached value.
        if (now - row.fetchedAt > INDEX_TTL_MS) toEnrich.push(iata);
      } else {
        out[iata] = null;
        toEnrich.push(iata);
      }
    }

    // Fire-and-forget enrichment, staggered so we never hammer Wikidata.
    toEnrich.forEach((iata, i) => {
      void ctx.scheduler.runAfter(
        i * 250,
        internal.destIndex.enrichDestination,
        { iata }
      );
    });

    return out;
  },
});
