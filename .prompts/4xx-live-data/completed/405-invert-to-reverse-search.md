<objective>
Convert Paradise Plan's destination algorithm from a DETERMINISTIC forward search (it scores a hardcoded catalog of 6 destinations and hard-caps output at 3) into a REAL reverse search: the live cheapest-anywhere flight feed becomes the candidate source (up to 30 real destinations), ordering is non-deterministic, and the 6-destination catalog becomes only an enrichment overlay.

Why this matters: the app's promise is "tell me my budget + origin + vibe and surprise me with where I can go." Today it always returns the same 3 results led by Cancún because the static catalog (not real availability) drives output, there is zero randomness, and output is capped at 3. This phase makes "surprise me" actually surprise and stops Cancún from dominating. This is Phase 1 of a multi-phase rebuild (405→410); later phases enrich vibe and add hotels/activities, so build on these foundations, do not throw them away.
</objective>

<context>
- Next.js (App Router) + Convex + Clerk, deployed on Vercel. Branch: feat/travelpayouts-real-data.
- Read CLAUDE.md for project conventions. Read the top comment of convex/travelpayouts.ts for the NON-NEGOTIABLE honesty rule.
- HONESTY RULE (governs the whole codebase): never fabricate data. If the API does not return a field, hide it / return null. No fake prices, tags, ratings, stars, scarcity, discounts, or nights. Cached/indicative prices must be labeled and NEVER presented as bookable · booking is confirmed on the provider's site.
- Key files: @src/lib/usePlanner.ts (the surprise() flow + TARGET_CARDS cap), @src/lib/scoring.ts (computeOptions + .slice(0,3) + score()), @src/lib/data.ts (the 6-dest catalog; NOTE: Tulum.to === "CUN" duplicates Cancún), @convex/travelpayouts.ts (searchCheapestDestinations ALREADY returns up to 30 real round-trip FlightOffers from an origin; searchCheapestFlight; searchHotel).
- Convex env already holds TRAVELPAYOUTS_TOKEN. No new API keys are needed for this phase.
</context>

<requirements>
1. data.ts: change Tulum `to: "CUN"` → `to: "TQO"` (Tulum's own airport) so Cancún can never appear twice.
2. usePlanner.ts surprise(): make `searchCheapestDestinations({ origin, limit: 30 })` the PRIMARY candidate source · each row already carries a real round-trip flight, so NEVER re-fetch a flight per destination. Dedup candidates by destination IATA. The 6-dest catalog becomes an ENRICHMENT overlay only: build a map `normalizeIata(d.to)` → Destination; a candidate whose IATA matches anchors that curated card (image/blurb/tags/weather/intensity); every other candidate renders the honest existing `syntheticDest(flight)`.
3. Remove the hard cap: delete TARGET_CARDS=3 and `.slice(0,3)` gating. Keep ALL candidates that pass filtering (up to 30); show fewer when the feed returns fewer.
4. Budget = TOTAL TRIP. This phase only has the real flight price, so filter by round-trip flight price ≤ `budget * BUDGET_TOLERANCE`. Add a cost model to scoring.ts: `buildCostModel({ flight, hotel?, activity? }, confidence)` → `{ components, totalPerPerson, confidence }`, where `CostConfidence = "live"|"indicative"|"cached"|"estimate"` and `totalPerPerson` sums ONLY present lines (never pad a missing line with an estimate). Travelpayouts fares → `"cached"`.
5. Non-determinism: add a PURE `bandAndShuffle(items, bandOf, rng = Math.random)` to scoring.ts that groups items into score bands and Fisher–Yates shuffles WITHIN each band, then concatenates bands best-first. Two runs differ in order, but a worse band is never lifted above a better one. (Math.random is fine in app code.)
6. Vibe scoring on the real set: curated dests scored by the existing tag/weather/intensity math; synthetic dests have NO vibe data in this phase → band them into a single neutral "unknown" rank (-1), NEVER fabricated as a poor (zero) match.
7. Currency = MXN. Request the feed in `currency: "mxn"` and carry MXN through the cost model and display formatting. IMPORTANT: the wizard budget default and slider range are on a USD scale today (~1800); recalibrate them to a MXN scale (tens of thousands of pesos) or the budget filter rejects every real fare. If a provider returns a non-MXN currency, CONVERT to MXN with a real cached FX rate (never omit, never fabricate the rate); hide-missing applies to absent data only, not to currency mismatch.
</requirements>

<implementation>
- Keep scoring.ts a PURE module (no React, no IO). Put band+shuffle and the cost model there.
- Keep the Results/Detail screens working with a VARIABLE number of cards (they already `offers.map(...)`); only touch them if they hard-code exactly 3.
</implementation>

<output>
- `./src/lib/data.ts` · Tulum → TQO
- `./src/lib/scoring.ts` · buildCostModel + CostModel/CostConfidence + bandAndShuffle (pure)
- `./src/lib/usePlanner.ts` · inverted surprise(); RealOffer gains `cost: CostModel`
</output>

<verification>
- Run `npx tsc --noEmit` · must exit 0. (There is no eslint config; do NOT run `npm run lint`.)
- Confirm no TARGET_CARDS / `.slice(0,3)` remain, Cancún cannot appear twice, and synthetic dests never receive fabricated tags.
- Do NOT commit or deploy; leave changes in the working tree for review.
</verification>

<success_criteria>
"Surprise me" returns up to 30 real, deduped destinations whose order varies run-to-run, led by genuine vibe-matched curated dests, with zero fabricated data and a labeled, honest cost model. A filtered search must ALWAYS return responses; persistent empties under normal filters mean the architecture must change (broader candidate source, more inventory, softer filtering) to keep the promise, never an accepted empty state.
</success_criteria>
