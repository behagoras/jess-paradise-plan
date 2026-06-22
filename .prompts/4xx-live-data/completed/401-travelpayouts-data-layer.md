<task>
Build the real Travelpayouts data layer (Convex actions + caching + dictionaries + secrets) that the rest of the "real data" sweep depends on. This is prompt 1 of 4 in a sequence; do ONLY this layer, leave UI wiring to prompt 402.
</task>

<execution_contract>
NON-BLOCKING: never ask the user anything and never wait for interactive input. All credentials are pre-provisioned before this sequence starts (Convex auth + deployment, the Travelpayouts token in `.env.local`). Make every decision autonomously using the constraints below and CLAUDE.md. Use non-interactive flags. If a step truly cannot proceed without a missing credential, do NOT hang or call AskUserQuestion - record the blocker, do everything else you can, commit, and report it at the end.
</execution_contract>

<why_this_matters>
Paradise Plan currently shows fabricated flight/hotel prices, fake discounts, and placeholder dates. The owner is "starting to keep the app's promises": every number on screen must become real. This prompt builds the trustworthy server-side foundation - real flight + hotel data from Travelpayouts - so the UI can render only true facts. The non-negotiable rule that flows through the whole sequence: **if the API does not return a field, we never fabricate it.**
</why_this_matters>

<locked_decisions>
Read these as fixed constraints (decided by the product owner):
1. ALL on-screen results must be real: respect the user's filters, real prices, REAL DATES, real everything.
2. **Hide-missing rule**: if Travelpayouts has no value for a field, return null/omit it. Never substitute a seed/estimate. Downstream UI will hide whatever is null.
3. **Date and destination are NOT required inputs.** The data layer MUST work when departure date and/or destination are absent - use Travelpayouts' origin-only "cheapest" mode for that case (this is what powers the "surprise trips" concept).
4. Backend = **Convex actions** (the token lives in exactly one server-side place - the Convex deployment env - never in the client bundle or Vercel). `TRAVELPAYOUTS_API_KEY` (in `.env.local`) and `TRAVELPAYOUTS_TOKEN` (in Convex) are the SAME token value.
5. No fabricated discounts anywhere (relevant later, but do not invent "original price" fields here).
</locked_decisions>

<context>
- Stack: Next.js (App Router) + Convex backend + Clerk. Read `CLAUDE.md`, `README.md`, and `BUILT-APP.md` for conventions and the existing ADRs.
- Existing code to extend, do not rewrite from scratch:
  - `convex/travelpayouts.ts` - already has `searchCheapestFlight` (Aviasales `aviasales/v3/prices_for_dates`, token-only Data API). Reads `process.env.TRAVELPAYOUTS_TOKEN`.
  - `convex/schema.ts` - Convex schema (currently only `trips`).
  - `convex/trips.ts` - existing mutation/query style to match (args via `v`, etc.).
  - `.env.local.example` - documents `NEXT_PUBLIC_TP_MARKER=742129` and that the token is set in Convex.
- Static catalog: `src/lib/data.ts` - `DESTS[]` each has `from` (e.g. "CDMX") and `to` (e.g. "CUN","OAX","LIS","PUQ","Port"); `CITIES = ["Mexico City","Monterrey","Guadalajara","New York","Los Angeles"]`. Note `from:"CDMX"` and the cruise's `to:"Port"` are NOT valid IATA - they need mapping/handling.
- Travelpayouts docs: https://travelpayouts.github.io/slate/  - Aviasales Data API (`prices_for_dates`, supports `origin`, optional `destination`, optional `departure_at`, `return_at`, `one_way`, `direct`, `unique`, `sorting`, `limit`, `currency`, `market`). Hotellook: `https://engine.hotellook.com/api/v2/cache.json` (cached hotel prices by `location`/`locationId`, `checkIn`, `checkOut`, `adults`, `currency`, `limit`, `token`) and `https://engine.hotellook.com/api/v2/lookup.json` (location→id). Public dictionaries: `https://api.travelpayouts.com/data/en/airlines.json`, `.../data/en/cities.json`.
</context>

<requirements>
Create the feature branch first, then implement. After receiving any tool/API result, reflect on the ACTUAL response shape before coding against it.

1. **Branch + secret (do this first):**
   - From `main`, create and check out `feat/travelpayouts-real-data`.
   - Read the token value from `.env.local` (`TRAVELPAYOUTS_API_KEY`). Set it in Convex so the actions can read it: `npx convex env set TRAVELPAYOUTS_TOKEN "<value>"`. (If `npx convex env list` shows it already set, leave it.)
   - Make the actions read `process.env.TRAVELPAYOUTS_TOKEN ?? process.env.TRAVELPAYOUTS_API_KEY` so either name works.
   - Update `.env.local.example` to state clearly that `TRAVELPAYOUTS_API_KEY` and the Convex `TRAVELPAYOUTS_TOKEN` are the same value, with the exact `npx convex env set` command.

2. **Verify the live API before building.** Using the real token, hit `prices_for_dates` and Hotellook `cache.json` once (curl or a throwaway script) and record the actual JSON shape. Build types from what you observe, not from assumptions. Confirm whether round trips return `return_at`, whether airline is an IATA code, etc.

3. **Flight search (extend `convex/travelpayouts.ts`):**
   - Extend `searchCheapestFlight` so `destination` AND `departureAt` are both optional. With no destination → omit it so the API returns the cheapest reachable routes. Support round trips (`one_way:false`, capture `departure_at` + `return_at`) - the app shows N-night trips, so real outbound+return dates matter.
   - Add `searchCheapestDestinations({ origin, limit })`: origin-only, `unique:true`, `sorting:"price"` → an array of the cheapest REAL destinations (destination IATA, price, airline, departure_at, return_at, transfers, link). This is the engine for "destination not required".
   - Resolve airline IATA → display name via the airlines dictionary (see #5). If unknown, return the raw code rather than fabricating a name.

4. **Hotel search (new in `convex/travelpayouts.ts`):**
   - Add `searchHotel({ destinationIata | location, checkIn, checkOut, adults, currency })` using Hotellook `cache.json` (resolve a human location via `lookup.json` if needed). Return real `{ hotelName, priceFrom, stars, currency }` or `null` if Hotellook has nothing. NEVER invent a hotel name or price.

5. **Dictionaries + IATA mapping:**
   - Add helpers to resolve airline code→name and city IATA→{ city, country } from the public dictionaries. Cache them (see #6) - they are large and static.
   - Add a `CITY_TO_IATA` map for `CITIES` (Mexico City→MEX, Monterrey→MTY, Guadalajara→GDL, New York→JFK, Los Angeles→LAX) and a helper that normalizes the catalog's `from`/`to` (CDMX→MEX; treat the cruise `"Port"` as "no flight route" so downstream can hide the flight line for it).

6. **Caching (Convex tables):**
   - Add `tpFlightCache`, `tpHotelCache`, and `tpDict` tables to `convex/schema.ts`, keyed by a normalized request key, storing the JSON result + `fetchedAt`. Actions check cache first and only call Travelpayouts on a miss or when older than a TTL (use ~6h for fares/hotels; ~30d for dictionaries). This satisfies the owner's "add caching as needed" allowance and protects the rate limit during the Playwright runs later.

7. **Robustness:** every action handles API errors and empty results by returning `null`/`[]` (so the UI degrades by hiding, never by lying). Add concise doc comments in the existing file's style.
</requirements>

<output>
Modify/create with these relative paths:
- `convex/travelpayouts.ts` - extended flight search, `searchCheapestDestinations`, `searchHotel`, dictionary + IATA helpers, cache reads/writes, token fallback.
- `convex/schema.ts` - add `tpFlightCache`, `tpHotelCache`, `tpDict` tables (+ indexes on the cache key).
- `.env.local.example` - clarified token guidance.
- (Optional) a tiny `convex/_tpHttp.ts`-style helper module if it keeps `travelpayouts.ts` readable - match existing structure.
Do NOT touch any `src/` UI files in this prompt.
</output>

<verification>
Before declaring done:
1. `npx convex dev --once` (or the project's typegen) compiles with no type errors; `npm run lint` passes for changed files.
2. From a Convex function tester or a throwaway script, call each action with the real token and confirm REAL data returns:
   - `searchCheapestFlight({origin:"MEX", destination:"CUN"})` → a real fare with real `departure_at`.
   - `searchCheapestFlight({origin:"MEX"})` (no destination, no date) → still returns a real cheapest fare.
   - `searchCheapestDestinations({origin:"MEX", limit:3})` → ≥1 real destination.
   - `searchHotel({destinationIata:"CUN", checkIn:<+30d>, checkOut:<+33d>, adults:2})` → a real hotel or `null` (never a fabricated one).
3. Re-run one call and confirm it is served from cache (no second outbound request / faster).
4. Commit on `feat/travelpayouts-real-data` with a clear message (end the body with the Co-Authored-By line from CLAUDE.md). Do NOT open a PR yet - that happens in prompt 404.
</verification>

<success_criteria>
- Convex actions return real flight + hotel + cheapest-destination data using the live token, with date and destination both optional.
- Missing API fields come back as null/omitted - zero fabricated values.
- Results are cached in Convex with a TTL; dictionaries cached long.
- Secret reconciled and documented; everything compiles, lints, and is committed on the shared branch. No UI changes.
</success_criteria>
