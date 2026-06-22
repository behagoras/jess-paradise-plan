<objective>
Wire REAL activities from Viator into the trip cost model with affiliate deep links, fetched LAZILY for the selected destination, so the total-trip cost can include a real activity and the hand-off can earn affiliate commission.

Why this matters: the cost model has an `activity` slot that is always null today, so the "total trip" never reflects experiences and there is no activity monetization. Viator (Basic Access) gives real products with affiliate deep links. Like hotels (Phase 408), fetch on the Detail view for the opened destination · not for all candidates. This is Phase 2c of the rebuild (405→410).
</objective>

<context>
- Convex + Next.js. Branch: feat/travelpayouts-real-data. Read CLAUDE.md.
- Depends on Phases 405–408: cost model `buildCostModel({flight, hotel?, activity?}, confidence)` in @src/lib/scoring.ts; lazy-on-detail enrichment already established for hotels in @src/lib/usePlanner.ts; the primary flight hand-off (Aviasales) is in @src/components/screens/HandoffSheet.tsx.
- HONESTY RULE: never fabricate an activity/price/rating; hide-missing on null. The `productUrl` MUST be the real Viator affiliate deep link · never a fake link. Key lives ONLY in Convex env.
- Convex env holds `VIATOR_API_KEY`. Viator Partner (Basic Access): header `exp-api-key`, `Accept: application/json;version=2.0`. Docs: docs.viator.com (use WebFetch to confirm which endpoints Basic Access allows, the destination taxonomy to resolve city→destinationId, the product-search request, and the product fields before coding).
</context>

<requirements>
1. New file convex/viator.ts: action `searchActivity({ destinationName, countryCode?, lat?, lon?, currency? })` → `{ title, priceFrom, currency, rating?, productUrl, imageUrl? } | null`, with `currency` defaulting to MXN; if Viator returns a non-MXN currency, convert priceFrom to MXN with a real cached FX rate (never omit because the currency is not pesos). Resolve city → Viator destinationId via the destinations taxonomy (cache it; add a table if needed), then product-search and pick the top/cheapest real product. `productUrl` is the real affiliate deep link. Read-through cache; hide-missing on any non-ok/empty.
2. Lazy enrichment: when the Detail view opens for the selected offer, fetch its activity via `searchActivity` (alongside the hotel from Phase 408), attach it, and rebuild the CostModel including the activity component (per-person). Keep the search flow (Phases 1/1b) intact.
3. UI (minimal, honest): Detail.tsx shows the real activity line when present (hidden when null); HandoffSheet.tsx adds the activity's Viator deep link as an ADDITIONAL hand-off alongside the primary Aviasales flight link. No invented copy/prices.
</requirements>

<output>
- `./convex/viator.ts` · Viator destination resolution + activity search action (+ table if added)
- `./src/lib/usePlanner.ts` · lazy activity enrichment for the selected offer
- `./src/components/screens/Detail.tsx` · render real activity + updated total (hide-missing)
- `./src/components/screens/HandoffSheet.tsx` · add Viator affiliate deep link
</output>

<verification>
- Run `npx convex codegen` then `npx tsc --noEmit` · exit 0.
- Live-check: push to Convex DEV only (`npx convex dev --once`, never deploy) and `npx convex run` searchActivity for Cancún · confirm a REAL title + price + a real Viator productUrl returns (or honest null). Capture the sample and confirm the deep link is genuine.
- Do NOT commit or deploy to prod.
</verification>

<success_criteria>
Opening a destination shows a real Viator activity and a real flight+hotel+activity total per person with an honest confidence label; the hand-off offers a genuine affiliate deep link; missing activities hide cleanly; the key never leaves the server.
</success_criteria>
