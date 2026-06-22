<objective>
Build a SCALABLE destination-index + enrichment pipeline so the reverse search can rank ARBITRARY real destinations by vibe/weather · not just the 6 curated catalog entries · and make the wizard's "When" month actually constrain the flight feed.

Why this matters: after Phase 1 (405), synthetic (non-catalog) destinations have no vibe data and sit in a neutral band, so "Beach / Hot" preferences can only rank the 6 curated cities. To honestly fulfill "based on MY preferences" across the whole world, every destination needs climate + coarse geo tags, derived from open data. This is Phase 2 of the rebuild (405→410). Architect the pipeline as MULTI-SOURCE: Wikidata (no key) is the first enricher here; OpenTripMap (Phase 407) plugs in additively on the SAME index. Build it once, correctly.
</objective>

<context>
- Next.js (App Router) + Convex + Clerk. Branch: feat/travelpayouts-real-data. Read CLAUDE.md.
- Depends on Phase 1 (405) being in place: surprise() in @src/lib/usePlanner.ts uses the cheapest-anywhere feed and bands+shuffles via @src/lib/scoring.ts; synthetic dests currently band at -1.
- HONESTY RULE: never fabricate. Index-derived climate/geo tags are used ONLY for ranking/banding · NEVER displayed in the UI as a factual claim ("the weather is Hot"). When a field can't be derived, leave it null/empty; the destination simply stays less-known. Secret keys live ONLY in Convex env (process.env), never in the client bundle.
- Reuse the read-through cache pattern in @convex/travelpayouts.ts (`withCache`, `_cacheGet`/`_cacheSet` internalQuery/internalMutation, `getCityInfo` IATA→{city,country}). Existing tables in @convex/schema.ts are keyed `key`/`result`/`fetchedAt`.
- No new external key needed (Wikidata is keyless). Wikimedia returns 403 without a descriptive User-Agent · send one on every Wikidata fetch.
</context>

<requirements>
1. schema.ts: add a `tpDestIndex` table keyed by IATA · iata, optional city/country/lat/lon/koppen, optional `climate` (mapped to the wizard WEATHER taxonomy: "Hot"|"Cold"|"Windy"|"Perfect"|"Mild"|"Snow"), `geoTags` (string[] from the wizard GENERAL list, e.g. "Beach","Nature","Historic","Museums"), `sources` (string[] provenance), `fetchedAt`. Add `.index("by_iata", ["iata"])`.
2. New file convex/destIndex.ts:
   - internalQuery `_indexGet({iata})`, internalMutation `_indexSet({row})`.
   - PURE, unit-testable mappers: `koppenToWeather(koppen)` (A→Hot; B→Hot, BWk/BSk→Mild; C→Perfect, Cw→Mild; D→Cold; E/H→Snow; else null); `latToWeatherFallback(lat)` (|lat|<23.5→Hot; <35→Mild; <55→Perfect; else Cold · a COARSE geographic estimate, ranking-only, used only when Köppen is absent); `typeLabelToGeoTag(label)` (conservative: seaside/beach/coastal/island→Beach; national park/mountain/protected area→Nature; world heritage/historic/old town→Historic; museum→Museums; else null).
   - `enrichDestination({iata})` as an `internalAction` (only the scheduler calls it): resolve IATA→city via getCityInfo, query Wikidata WITHOUT a key (wbsearchentities→QID, wbgetentities for P625 coords, P2564 Köppen, P31 instance-of) with a descriptive `User-Agent` header, map to {climate, geoTags}, and write a row with sources:["wikidata"]. On ANY failure still write a minimal city/country-only row so we don't re-hammer Wikidata.
   - `getDestIndex({iatas})` as a public `action`: read cached rows, return `iata → {climate, geoTags} | null`, and for MISSING or stale (>~60d) IATAs schedule `enrichDestination` via `ctx.scheduler.runAfter(i*250, ...)` (staggered) WITHOUT blocking the read. This is the lazy auto-fill: each search enqueues enrichment so the NEXT search ranks those destinations.
3. usePlanner.ts: after the feed, call `getDestIndex({iatas})` once for the synthetic candidates. A synthetic dest WITH index data (geoTags or climate) gets a real vibe via `scoreVibeFromIndex` (+2 per matched general tag in geoTags, +1 if index climate ∈ state.weather; OMIT the intensity term · never fabricate intensity) and bands alongside curated dests; only dests with NO index data yet stay band -1. Index climate/geoTags drive RANKING ONLY · never write them into displayed card fields.
4. "When" month: add an optional `departureAt` (YYYY-MM) arg to `searchCheapestDestinations`, set `departure_at` on the prices_for_dates request, include it in the cache key. In usePlanner derive the month from `state.when` via the existing trip.ts helper (named month → YYYY-MM; "Flexible"/"This summer" → undefined) and pass it; re-add `state.when` to the surprise() deps.
5. Currency = MXN: request the feed in `currency: "mxn"` so budget, ranking, and display are all in pesos.
6. Filters must DELIVER: the chosen month, vibe, and weather must visibly shape what surfaces (not just re-rank invisibly); a destination matching the user's filter should be evident in the results. Crucially, a filtered search must still RETURN responses: the promise is that the user always gets real options. If a normal filter combination returns none (or too few), that is a RE-ARCHITECTURE trigger (broaden the candidate source, prefetch a larger feed, relax which filters hard-filter vs only rank, or add inventory), NOT an acceptable empty or widen state.
</requirements>

<output>
- `./convex/schema.ts` · tpDestIndex table
- `./convex/destIndex.ts` · pipeline (internal accessors, pure mappers, enrichDestination internalAction, getDestIndex action)
- `./convex/travelpayouts.ts` · searchCheapestDestinations gains optional departureAt
- `./src/lib/usePlanner.ts` · wire getDestIndex + scoreVibeFromIndex + When threading
</output>

<verification>
- Run `npx convex codegen` (so the new actions appear in api.d.ts), then `npx tsc --noEmit` · both must exit 0.
- Confirm every Wikidata fetch sends a descriptive User-Agent, derived climate/tags never reach displayed card fields, and synthetic intensity is never fabricated.
- Do NOT commit or deploy.
</verification>

<success_criteria>
Arbitrary real destinations get climate/geo vibe from open data and rank by genuine preference match; the index auto-fills lazily over repeated searches; the "When" chip constrains the feed; nothing derived is shown as a factual claim.
</success_criteria>
