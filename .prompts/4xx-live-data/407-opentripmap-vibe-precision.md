<objective>
Add OpenTripMap as a SECOND enricher on the destination index so vibe tags become precise · derived from real point-of-interest density (nightlife, museums, beaches, nature) rather than just Wikidata's coarse instance-of types. This upgrades ranking quality for "Nightlife" / "Museums" / "Beach" style preferences across arbitrary destinations.

Why this matters: Wikidata (Phase 406) gives reliable climate + a coarse beach/nature/historic signal, but it cannot tell that a city is a nightlife hub or museum-dense. OpenTripMap's POI categories can. This is Phase 2a of the rebuild (405→410); it must be ADDITIVE · same `tpDestIndex` table, append to `geoTags`/`sources`, never replace Wikidata's climate.
</objective>

<context>
- Convex + Next.js. Branch: feat/travelpayouts-real-data. Read CLAUDE.md.
- Depends on Phase 406: @convex/destIndex.ts has the index table, `enrichDestination`, pure mappers, and `getDestIndex` with lazy scheduling. Rows carry coords (P625) when Wikidata returned them.
- HONESTY RULE: derived tags are RANKING ONLY, never shown as factual claims; hide-missing when nothing derivable. Key lives ONLY in Convex env.
- Convex env holds `OPENTRIPMAP_API_KEY`. OpenTripMap docs: dev.opentripmap.org (use WebFetch to confirm the exact `/places/radius` + `/places/bbox` request and the `kinds` taxonomy before coding).
</context>

<requirements>
1. In destIndex.ts, extend `enrichDestination` so that AFTER resolving coordinates (from Wikidata P625, or via OpenTripMap geoname lookup when coords are missing), it queries OpenTripMap POIs around the destination and maps the `kinds` taxonomy to wizard GENERAL tags, conservatively and by DENSITY (only add a tag when there is a meaningful count of matching POIs): clubs/bars/nightlife → "Nightlife"; museums/galleries → "Museums"; beaches → "Beach"; natural/parks/mountains → "Nature"; historic/architecture → "Historic"; restaurants/food markets → "Good food".
2. Merge, do not overwrite: union the OpenTripMap tags with any Wikidata `geoTags` (dedup), and append "opentripmap" to `sources`. Wikidata-derived `climate` stays authoritative.
3. Fail soft: any OpenTripMap error leaves the existing (Wikidata) row intact; never throw, never fabricate counts.
4. Keep the lazy auto-fill model from Phase 406 unchanged · `getDestIndex` still schedules `enrichDestination`; this phase just makes that enrichment richer. Reads of OPENTRIPMAP_API_KEY happen server-side only.
</requirements>

<output>
- `./convex/destIndex.ts` · OpenTripMap enricher merged into enrichDestination; pure `kindsToGeoTags` helper
</output>

<verification>
- Run `npx convex codegen` (if needed) then `npx tsc --noEmit` · exit 0.
- Live-check the enrichment: push to the Convex DEV deployment only (`npx convex dev --once`, never `npx convex deploy`) and confirm a known nightlife/museum city gains the expected tags via the index without overwriting climate.
- Do NOT commit or deploy to prod.
</verification>

<success_criteria>
Destinations get precise, density-based vibe tags (nightlife, museums, etc.) layered on top of Wikidata climate, all derived from real open data, used only for ranking, with the key never leaving the server.
</success_criteria>
