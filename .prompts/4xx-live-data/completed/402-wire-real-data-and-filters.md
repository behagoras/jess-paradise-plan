<task>
Wire the real Travelpayouts data (built in prompt 401) through the planner, pricing, and all three result screens, make the wizard filters actually drive output, and remove every fabricated number from the UI. This is prompt 2 of 4. Continue on branch `feat/travelpayouts-real-data`.
</task>

<execution_contract>
NON-BLOCKING: never ask the user anything and never wait for interactive input. Make every UI/data decision autonomously using the rules below and CLAUDE.md. Prefer hide-over-fake whenever a value is missing. Do not run AskUserQuestion. Do not pause the sequence.
</execution_contract>

<why_this_matters>
The data layer now returns real flights, hotels, cheapest destinations, and real dates - but the UI still renders fake ratio-based prices (`src/lib/pricing.ts`), a fabricated `−34%` discount, strikethrough "original" prices, placeholder date labels, and collects filters it never uses. This prompt makes the screen tell the truth: real prices, real dates, real airlines/hotels, and filters that genuinely change what the user sees. After this prompt the app should be genuinely usable.
</why_this_matters>

<locked_decisions>
1. **Everything on screen must be real** and must respect the user's filters.
2. **Hide-missing rule**: if a value is null from the data layer, do NOT render that line/element - never fall back to a seeded number. Showing fewer than 3 cards (or a card without an activity line) is correct behavior.
3. **Date and destination are NOT required.** Flexible/empty date → call the cheapest-date / origin-only paths. The flow must complete and show real results with both left at defaults.
4. **No fabricated discount.** Remove the `−34%` badge and the strikethrough "from" price. Show the honest real per-person price. Only show a discount/"deal" badge if it is computed from REAL data (e.g. a real cheapest-vs-reference comparison from the API); otherwise show no badge.
5. Backend access is via the Convex actions from prompt 401 (`useAction`/Convex client) - do not call Travelpayouts from the client directly (the token is server-side only).
</locked_decisions>

<context>
@convex/travelpayouts.ts  (actions from prompt 401: searchCheapestFlight, searchCheapestDestinations, searchHotel + IATA/dict helpers)
@src/lib/usePlanner.ts    (client state machine; `surprise()` currently fakes async with timers over synchronous scoring)
@src/lib/pricing.ts       (FAKE ratio math against DEST_BASE - this is the main thing to replace)
@src/lib/scoring.ts       (filters the static catalog; budget + trip length + vibe/weather/intensity already work)
@src/lib/data.ts          (DESTS catalog with from/to codes, CITIES, DEST_BASE)
@src/components/screens/Results.tsx     (cards: airline/hotel/activity + fake disc/strikethrough/−34% + "Best match")
@src/components/screens/Detail.tsx      (flight w/ placeholder out/return labels, hotel, activity, price breakdown)
@src/components/screens/Generating.tsx  (fake progress timeline; GEN_PHASE_DELAYS)
@src/components/screens/HandoffSheet.tsx (affiliate deep link via NEXT_PUBLIC_TP_MARKER)
Read CLAUDE.md for conventions. Convex React hooks: prefer `useAction` for the search actions; cache lives server-side already.
</context>

<approach>
Use the **catalog-anchored real-pricing** model (it fits the existing curated cards + images and the "surprise trips" UX):
- The wizard's vibe/weather/intensity/budget/trip-length filters still SELECT which catalog destinations are candidates (keep `scoring.ts`).
- For each candidate, fetch REAL flight (origin = chosen Departure point's IATA → destination's IATA) and REAL hotel (destination + dates) via the prompt-401 actions. Real per-person price = real flight + real hotel (+ real/estimated activity only if a source exists; otherwise hide the activity line and exclude it from the total).
- **Destination not required**: the user never types a destination - the catalog supplies candidates. If a candidate has no real fare from the chosen origin, drop it (hide-missing) and backfill from the next-best catalog candidate so up to 3 real cards show. If the catalog can't fill 3 with real data, also pull from `searchCheapestDestinations(origin)` to surface real extra destinations (render only the fields the API returns).
- **Date not required**: Flexible / "This summer" → omit the date (cheapest upcoming). A named month (Jul/Aug/Sep/Dec) → pass `YYYY-MM`. Use the REAL `departure_at`/`return_at` returned for all date labels - no invented dates.
- **Departure point** now matters: map `state.departure` → IATA (helper from prompt 401) and use it as the flight origin.
- **Travelers** → adults for hotel search and the per-person × travelers total.
- **Include** chips (Flight/Hotel/Activity/…): only fetch/show the lines the user included; excluded lines are omitted from the card and the total.
</approach>

<requirements>
1. **Replace `src/lib/pricing.ts` fabrication:** compute the price from real line items returned by the actions. Drop `FLIGHT_RATIOS`/`HOTEL_RATIOS`/`FLEXIBLE_DISCOUNT`/`EARLY_BIRD_DISCOUNT` driving displayed prices. Taxes/fees: only show a "Taxes & fees" line if it is real or clearly derived from a real, disclosed rule - otherwise omit it (do not bolt a fake 16% onto a real fare). Keep the module pure; move IO to the planner/actions.
2. **`usePlanner.ts`:** make `surprise()` a real async search - call the actions, drive `genPhase`/loading from real progress, handle errors and empty results (show an honest "no live trips matched - widen filters" state, reusing the `widened` pattern). Store the fetched real offers in state so Results/Detail render from them.
3. **`Results.tsx`:** render real airline, hotel, real per-person price, and real `N nights` + real date window. REMOVE the `−{disc*100}%` badge and the `line-through` original price. Keep "Best match" only for the top real match; drop "Great deal" unless backed by real data. Hide the activity ("Do") line when there's no real activity. If fewer than 3 real cards, show fewer (and the honest widen hint). Update the footer note so it matches reality.
4. **`Detail.tsx`:** show the real airline, REAL outbound/return dates (from `departure_at`/`return_at`), real hotel + nights, and a breakdown built only from real line items. The airline/hotel "Edit" cycling must cycle through REAL alternatives (e.g. other real offers) or be removed - it must not cycle to invented options.
5. **`Generating.tsx`:** copy/progress reflect the real search actually running; remove the "pure UX rhythm" framing once it's backed by real awaits.
6. **`HandoffSheet.tsx`:** keep the affiliate deep link (marker), but target the real selected destination (and the real hotel/flight deep link from the API when available). The persisted trip (`convex/trips.ts`) should store the real totals.
7. Preserve guest/auth save behavior and accessibility. Match existing Tailwind/className conventions exactly.
</requirements>

<output>
Modify (relative paths): `src/lib/pricing.ts`, `src/lib/usePlanner.ts`, `src/components/screens/Results.tsx`, `src/components/screens/Detail.tsx`, `src/components/screens/Generating.tsx`, `src/components/screens/HandoffSheet.tsx`, and `src/lib/scoring.ts` / `src/lib/data.ts` only if needed for IATA wiring. Add small helpers/types as needed. Do not touch `convex/travelpayouts.ts` logic from prompt 401 except to import it.
</output>

<verification>
1. `npm run lint` and `npx tsc --noEmit` (or project equivalent) pass.
2. `npm run dev` + manual pass: complete the flow with DEFAULTS (date Flexible, no destination chosen) and confirm real prices, real airlines/hotels, and real dates render; confirm there is NO `−34%` badge and NO strikethrough; confirm a card with a missing line simply hides that line.
3. Change Departure point (e.g. New York) and confirm the flight origin/prices change accordingly.
4. Pick a named month and confirm the dates shown match the real returned itinerary.
5. `grep` the `src/` tree for the removed fabrications (`FLEXIBLE_DISCOUNT`, `line-through`, `DEST_BASE` used for display, `−`/`disc * 100`) and confirm none remain in rendered output.
6. Commit on `feat/travelpayouts-real-data` (Co-Authored-By line per CLAUDE.md). No PR yet.
</verification>

<success_criteria>
- The full flow renders only real, API-sourced flight/hotel/price/date data, respecting all wizard filters.
- Date and destination can both be left empty and the flow still returns real results.
- Every fabricated discount/strikethrough/placeholder-date is gone; missing data is hidden, never faked.
- Lint + typecheck clean; committed on the shared branch.
</success_criteria>
