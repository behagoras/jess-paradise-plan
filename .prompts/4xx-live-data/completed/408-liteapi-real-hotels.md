<objective>
Wire REAL hotels from LiteAPI into the trip cost model, replacing the dead Hotellook integration, and fetch them LAZILY for the selected destination (on the Detail view) rather than for all ~30 candidates per search.

Why this matters: the budget promise is "total trip" (flight + hotel + activity), but Hotellook (the old searchHotel) returns 404 · so hotels are always missing and the total is flight-only. LiteAPI gives real rates. Fetching for all 30 candidates would be ~30 calls per search; the scalable approach is to complete the full total-trip cost on the Detail view for the destination the user actually opens. This is Phase 2b of the rebuild (405→410).
</objective>

<context>
- Convex + Next.js. Branch: feat/travelpayouts-real-data. Read CLAUDE.md.
- Depends on Phases 405–406: the cost model lives in @src/lib/scoring.ts (`buildCostModel({flight, hotel?, activity?}, confidence)`); RealOffer in @src/lib/usePlanner.ts has `hotel: HotelOffer|null` and `cost: CostModel`. The dead Hotellook code is the old `searchHotel` in @convex/travelpayouts.ts.
- HONESTY RULE: never fabricate a hotel/price/rating; hide-missing on null. Cached/indicative prices labeled, never bookable. Key lives ONLY in Convex env.
- Convex env holds LiteAPI keys: use `process.env.NUITE_PROD_API_KEY ?? process.env.NUITE_SANDBOX_API_KEY` (prefer prod · rate search is read-only and returns REAL data; header `X-API-Key`). LiteAPI docs: docs.liteapi.travel (use WebFetch to confirm the v3 rates/content request + response shape before coding).
</context>

<requirements>
1. New file convex/liteapi.ts: action `searchHotelLite({ city?, countryCode?, lat?, lon?, checkIn, checkOut, adults, currency? })` → `{ hotelName, priceFrom, stars, currency, bookingUrl? } | null`, with `currency` defaulting to MXN; if LiteAPI returns a non-MXN currency, convert priceFrom to MXN with a real cached FX rate (never omit because the currency is not pesos). Read-through cache (reuse the withCache pattern; reuse tpHotelCache or add a table). Hide-missing on any non-ok/empty response. Parse exactly the documented fields, never guessing.
2. Architecture: REMOVE the eager per-candidate hotel fetch from surprise(). Instead, when the Detail view opens for a selected offer, fetch its hotel via `searchHotelLite` over the real flight window (checkIn/checkOut from the flight) and rebuild that offer's CostModel via `buildCostModel` (hotel total-stay → per-person = total / adults). The Results grid stays flight-first.
3. UI (minimal, honest): Detail.tsx shows the real hotel line when present, hidden when null; the total-trip cost updates with the hotel component and keeps its confidence label.
</requirements>

<output>
- `./convex/liteapi.ts` · LiteAPI hotel search action (+ schema table if added)
- `./src/lib/usePlanner.ts` · lazy hotel enrichment for the selected offer; drop eager fetch
- `./src/components/screens/Detail.tsx` · render real hotel + updated total (hide-missing)
</output>

<verification>
- Run `npx convex codegen` then `npx tsc --noEmit` · exit 0.
- Live-check: push to Convex DEV only (`npx convex dev --once`, never deploy) and `npx convex run` searchHotelLite for Cancún over a near-future 4-night window · confirm a REAL hotel name + price returns (or honest null with reason). Capture the sample.
- Do NOT commit or deploy to prod.
</verification>

<success_criteria>
Opening a destination shows a real LiteAPI hotel and a real flight+hotel total per person with an honest confidence label; missing hotels hide cleanly; the LiteAPI key never leaves the server.
</success_criteria>
