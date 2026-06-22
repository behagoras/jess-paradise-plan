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
 * from OPEN data. Two enrichers run per destination, ADDITIVELY:
 *   1. Wikidata (no key): authoritative climate (Köppen) + coords + coarse
 *      instance-of geo tags.
 *   2. OpenTripMap (key in process.env.OPENTRIPMAP_API_KEY, server-side only):
 *      precise vibe tags from real POI density around the coords. It only
 *      APPENDS to `geoTags`/`sources` and NEVER overwrites Wikidata's climate;
 *      any OTM failure is swallowed so the Wikidata row survives intact.
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
 *   → map to {climate, geoTags} → OpenTripMap POIs around the coords
 *   → union vibe tags → cache a tpDestIndex row.
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
    case "B": {
      // Arid B codes are BW*/BS* with a THIRD letter for temperature: h (hot)
      // or k (cold). Cold-arid (BWk/BSk) → "Mild"; hot desert/steppe (BWh/BSh)
      // and a bare "B" → "Hot". The hot/cold letter is code[2], not code[1]
      // (which is the W/S desert-vs-steppe letter).
      const temp = code[2]?.toLowerCase();
      return temp === "k" ? "Mild" : "Hot";
    }
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

/**
 * Map OpenTripMap POI "kinds" densities to wizard GENERAL tags. PURE and
 * unit-testable: takes the comma-separated `kinds` string from EACH POI
 * (features[].properties.kinds), counts how many POIs match each category, and
 * only emits a tag when a MEANINGFUL number of POIs back it (>= OTM_MIN_COUNT).
 * A lone hit never earns a tag, so the tags reflect real POI density, not noise.
 *
 * We substring-match each category against the comma-separated kinds string so
 * the matcher is robust to OpenTripMap returning either a broad group
 * ("cultural", "natural", "foods") or a specific kind ("museums", "beaches",
 * "national_parks"). Mapping (conservative, by density):
 *   clubs/bars/nightlife/pubs                        -> "Nightlife"
 *   museums/galleries                                -> "Museums"
 *   beaches                                          -> "Beach"
 *   natural/national_parks/nature_reserves/
 *     mountain_peaks/geological                      -> "Nature"
 *   historic/architecture/monuments_and_memorials/
 *     castles/historic_settlements                   -> "Historic"
 *   foods/restaurants/marketplaces                   -> "Good food"
 * RANKING ONLY - never surfaced as a factual claim, never fabricated.
 *
 * @param poiKinds one entry per POI, each the raw comma-separated kinds string.
 */
export const OTM_MIN_COUNT = 3;

const OTM_KIND_GROUPS: Array<{ tag: string; needles: string[] }> = [
  {
    tag: "Nightlife",
    needles: ["nightclub", "club", "bar", "nightlife", "pub"],
  },
  { tag: "Museums", needles: ["museum", "galler"] },
  { tag: "Beach", needles: ["beach"] },
  {
    tag: "Nature",
    needles: [
      "natural",
      "national_park",
      "nature_reserve",
      "mountain_peak",
      "geological",
    ],
  },
  {
    tag: "Historic",
    needles: [
      "historic",
      "architecture",
      "monuments_and_memorials",
      "castle",
      "historic_settlement",
    ],
  },
  { tag: "Good food", needles: ["food", "restaurant", "marketplace"] },
];

export function kindsToGeoTags(poiKinds: string[]): string[] {
  // Tally, per category, the COUNT of POIs whose kinds string matches it. A POI
  // can match several categories (kinds is multi-valued) - that is fine, each
  // category is counted independently.
  const counts = new Map<string, number>();
  for (const raw of poiKinds) {
    if (!raw) continue;
    const k = raw.toLowerCase();
    for (const group of OTM_KIND_GROUPS) {
      if (group.needles.some((n) => k.includes(n))) {
        counts.set(group.tag, (counts.get(group.tag) ?? 0) + 1);
      }
    }
  }
  const out: string[] = [];
  for (const group of OTM_KIND_GROUPS) {
    if ((counts.get(group.tag) ?? 0) >= OTM_MIN_COUNT) out.push(group.tag);
  }
  return out;
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
// OpenTripMap helpers (SECOND enricher; key is server-side only, fail soft)
// ---------------------------------------------------------------------------
//
// The key lives ONLY in Convex env (process.env.OPENTRIPMAP_API_KEY) and is read
// inside this server-side action, so it never reaches the client bundle. Every
// helper here returns a value-or-null and NEVER throws, so the OpenTripMap step
// can be wrapped to fail soft, leaving the authoritative Wikidata row intact.

// Public REST base, confirmed against https://dev.opentripmap.org/docs (a bare
// GET to .../places/radius returns 401 without an apikey, i.e. the path is real
// and the key is required). Geoname returns flat JSON {lat,lon,name,...};
// radius with format=geojson returns a FeatureCollection whose
// features[].properties.kinds is a comma-separated kinds string.
const OPENTRIPMAP_BASE = "https://api.opentripmap.com/0.1/en";
// Imitate the descriptive, contactable User-Agent we send to Wikidata.
const OPENTRIPMAP_HEADERS = {
  "User-Agent":
    "ParadisePlan/1.0 (https://github.com/behagoras/jess-paradise-plan; davbelom@gmail.com)",
  Accept: "application/json",
};
// Search a generous urban radius (meters) and cap the result count so one call
// stays cheap while still sampling enough POIs to gauge density.
const OTM_RADIUS_M = 12000;
const OTM_LIMIT = 500;
// rate>=2 keeps to better-rated, less-noisy POIs (OpenTripMap rates 0-3/h).
const OTM_MIN_RATE = "2";

interface OtmGeoname {
  lat?: number;
  lon?: number;
}
interface OtmFeatureCollection {
  features?: Array<{ properties?: { kinds?: string } }>;
}

/**
 * Resolve a city NAME -> {lat, lon} via OpenTripMap geoname, used only when
 * Wikidata gave us no P625 coordinates. Returns null on any problem (no key,
 * non-ok response, missing coords, parse failure).
 */
async function otmGeoname(
  apiKey: string,
  name: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const params = new URLSearchParams({ name, apikey: apiKey });
    const res = await fetch(`${OPENTRIPMAP_BASE}/places/geoname?${params}`, {
      headers: OPENTRIPMAP_HEADERS,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as OtmGeoname;
    if (typeof body.lat === "number" && typeof body.lon === "number") {
      return { lat: body.lat, lon: body.lon };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch POIs around a point and return one comma-separated kinds string PER POI
 * (features[].properties.kinds). Returns [] on any problem; the caller treats
 * an empty list as "nothing derivable" and adds no OTM tags.
 */
async function otmPoiKinds(
  apiKey: string,
  lat: number,
  lon: number
): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      radius: String(OTM_RADIUS_M),
      lon: String(lon),
      lat: String(lat),
      rate: OTM_MIN_RATE,
      limit: String(OTM_LIMIT),
      format: "geojson",
      apikey: apiKey,
    });
    const res = await fetch(`${OPENTRIPMAP_BASE}/places/radius?${params}`, {
      headers: OPENTRIPMAP_HEADERS,
    });
    if (!res.ok) return [];
    const body = (await res.json()) as OtmFeatureCollection;
    const out: string[] = [];
    for (const f of body.features ?? []) {
      const kinds = f.properties?.kinds;
      if (typeof kinds === "string" && kinds.length > 0) out.push(kinds);
    }
    return out;
  } catch {
    return [];
  }
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

/**
 * ADDITIVE OpenTripMap enrichment, mutating `row` IN PLACE. Fail-soft contract:
 * this never throws and never touches row.climate / row.koppen (Wikidata stays
 * authoritative). It only UNIONs OTM-derived vibe tags into row.geoTags and, on
 * success, appends "opentripmap" to row.sources.
 *
 * Steps:
 *   1. read OPENTRIPMAP_API_KEY from process.env (server-side only); bail if
 *      absent so a missing key just leaves the Wikidata row intact.
 *   2. resolve coords: prefer Wikidata P625 (row.lat/row.lon); else geoname the
 *      city name (and adopt those coords into the row). If neither yields
 *      coords, skip OTM entirely.
 *   3. fetch POIs around the coords, map kinds densities -> tags, UNION (dedup).
 *   4. append "opentripmap" to sources only when OTM actually ran (we resolved a
 *      key and coords and called the POI endpoint) - we never claim a source we
 *      did not consult, even if it yielded zero tags.
 */
async function enrichWithOpenTripMap(
  row: DestIndexRow,
  city: string
): Promise<void> {
  try {
    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (!apiKey) return; // No key configured -> keep the Wikidata row as-is.

    // Resolve coordinates. Prefer Wikidata's; otherwise ask OTM geoname and, if
    // it answers, adopt those coords into the row (still ranking-only data).
    let lat = row.lat;
    let lon = row.lon;
    if (typeof lat !== "number" || typeof lon !== "number") {
      const geo = await otmGeoname(apiKey, city);
      if (!geo) return; // Cannot place the city -> skip OTM, keep Wikidata row.
      lat = geo.lat;
      lon = geo.lon;
      row.lat = lat;
      row.lon = lon;
    }

    const poiKinds = await otmPoiKinds(apiKey, lat, lon);
    const otmTags = kindsToGeoTags(poiKinds);

    // UNION with existing Wikidata tags (dedup via Set), preserving order:
    // Wikidata tags first, then any new OTM tags.
    const merged = new Set<string>(row.geoTags);
    for (const t of otmTags) merged.add(t);
    row.geoTags = [...merged];

    // We consulted OpenTripMap -> record it as a source (even if 0 tags, since
    // "we looked and found little density" is honest; we never fabricate tags).
    if (!row.sources.includes("opentripmap")) row.sources.push("opentripmap");
  } catch {
    // Fail soft: any unexpected OTM error leaves the Wikidata row untouched.
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

      // SECOND enricher: OpenTripMap POI density (ADDITIVE). Wrapped in its own
      // try/catch so ANY OTM problem (missing key, non-ok response, no coords,
      // parse failure) leaves the authoritative Wikidata row above untouched and
      // still written below. Wikidata's row.climate/row.koppen are NEVER altered
      // here - we only APPEND derived vibe tags and the "opentripmap" source.
      await enrichWithOpenTripMap(row, city);

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

    // Staggered enrichment so we never hammer Wikidata. AWAIT the scheduling:
    // ctx.scheduler.runAfter resolves once the job is ENQUEUED (not when the
    // enrichment runs), so awaiting guarantees the jobs are committed before the
    // action returns. A bare `void` leaves them as dangling promises that Convex
    // drops when the action finishes, so the index would never fill in prod.
    await Promise.all(
      toEnrich.map((iata, i) =>
        ctx.scheduler.runAfter(i * 250, internal.destIndex.enrichDestination, {
          iata,
        })
      )
    );

    return out;
  },
});
