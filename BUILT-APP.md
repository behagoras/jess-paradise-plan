# Built app — what actually exists

This documents the app that is **built and running today**, as opposed to the
product *visions* in the repo. Read this before changing screen behavior.

> The Spanish wiki under `docs/wiki/` (especially `prototipo-drift.md`) describes
> the unbuilt **"Drift"** discovery-first vision — the target, not the current
> build. `docs/flujo-app-ui.md` describes the historical 2019 XD checkout flow.
> Neither is what ships now. The current build is the English wizard described
> below.

## State machine (screens)

One scroll container drives a screen state machine in `src/lib/usePlanner.ts`:

```
landing → wizard (step 1 → 2) → generating → results → detail → handoff
```

- **landing** (`Landing.tsx`) — hero, "how it works", Clerk sign-in.
- **wizard** (`Wizard.tsx`) — **2 steps**. Step 1 shows only the two inputs that
  drive output (**When**, **Activity intensity**) plus a default-closed
  **"More filters"** disclosure (budget, trip length, travelers, departure,
  packages, vacation type, who's-traveling). Step 2 is the preference + weather
  chips, ending in **"Surprise me"**.
- **generating** (`Generating.tsx`) — animated loader whose phases advance on
  the **real** Travelpayouts search awaits in `surprise()` (genPhase 0 → 1 → 2:
  searching fares → pricing stays → assembling). The copy is honest about the
  live work happening.
- **results** (`Results.tsx`) — up to 3 **real** trips: each card's flight
  airline, dates, transfers, and per-person fare come from Travelpayouts; the
  catalog only supplies the photo, blurb, and region copy. No "best match" badge
  and no rating (those were fabricated and removed). Shows a "widen your budget /
  trip length / departure" note when the live search returns few or no matches.
- **detail** (`Detail.tsx`) — the selected trip's **real** flight (airline,
  origin/destination, real outbound/return dates, stop count, fare) and **real**
  hotel (name, stars, price) when Hotellook returns one — the hotel line is
  **hidden** when it doesn't (currently the case: Hotellook is down upstream).
  The price breakdown is summed from only the real, included lines.
- **handoff** (`HandoffSheet.tsx`) — bottom-sheet overlay. Records the selection
  as **browsing history** in Convex (NOT a booking) and `window.open`s the
  **real** affiliate deep link the flight search returned (Aviasales, with our
  Travelpayouts marker), falling back to a Hotellook destination search.
  **Affiliate-only** — we never take payment.

`src/` itself holds no secrets and makes no direct provider calls: all live data
is fetched through **Convex actions** (`convex/travelpayouts.ts`) that keep the
Travelpayouts token server-side. The data layer **hides any field the API
doesn't return** rather than fabricating it.

## `PlannerState` and which fields drive output

`PlannerState` (in `src/lib/usePlanner.ts`) holds the whole flow. Of the
collected inputs, only some affect the Results set / price:

| Field | Drives output? | Where |
| --- | --- | --- |
| `general` (vibe chips) | ✅ scoring (picks candidates) | `scoring.ts` |
| `weather` | ✅ scoring | `scoring.ts` |
| `intensity` | ✅ scoring | `scoring.ts` |
| `budget` | ✅ filter (≤ base × 1.3) | `scoring.ts` |
| `daysMin` / `daysMax` (trip length) | ✅ filter on `dest.nights` | `scoring.ts` |
| `departure` | ✅ real flight origin (IATA) | `trip.ts` → `travelpayouts.ts` |
| `when` | ✅ real departure month | `trip.ts` → `travelpayouts.ts` |
| `travelers` | ✅ adults + per-person split | `usePlanner.ts`, `pricing.ts` |
| `packages` (Include) | ✅ which real lines fetch & price | `usePlanner.ts` |
| `vacation`, `travelerTypes` | ❌ honest no-op | collected for future use |

The candidate-selection rules and the pricing math are split into **pure
modules**, while the live fetch lives in the planner:
- `src/lib/scoring.ts` — `computeOptions()` scores the catalog to choose which
  destinations to fetch real fares for (+ budget/length filter, top 3).
- `src/lib/trip.ts` — pure date/IATA helpers (departure city → origin, `when` →
  month, real flight window → hotel check-in/out, date labels).
- `src/lib/pricing.ts` — `computePricing()` sums **only the real line items** the
  API returned (no ratios, no seed base, no fake discount/tax).

`usePlanner.surprise()` is the coordinator: it scores the catalog, fetches real
flights + hotels via the Convex actions, drops candidates with no real fare
(hide-missing), backfills from cheapest-anywhere, and assembles the offers. The
`PlannerApi` shape is the public contract every screen depends on.

## The catalog (6 destinations)

`src/lib/data.ts` holds the curated catalog: `DESTS` (6 destinations:
Cancún, Tulum, Oaxaca, Lisbon, Caribbean Cruise, Patagonia), the per-destination
`DEST_BASE` (USD) used **only as a budget-filter threshold** (not a displayed
price), and `PROVIDER` (`"Aviasales"` — the Travelpayouts flight brand the
hand-off actually deep-links to). The catalog supplies the photo, blurb, region,
and vibe tags that pick candidates; the displayed flight airline, dates, fares,
and hotel are all **real** Travelpayouts data, not catalog fields. (The old
fabricated `rating` / `departsIn` / `seats` scarcity fields have been removed.)

## Convex (`convex/schema.ts`, `convex/trips.ts`)

The single `trips` table is **browsing history**, not a booking record. Fields:
`userId?`, `guestId?`, `destinationKey`, `destinationName`, `region`, `provider`,
`travelers`, `total`, `perPerson`, `when`, `departure`, `activityOn`.

Exactly one of `userId` / `guestId` is set at any time:

- **Guest** → `trips.saveDraft({ guestId, … })` keyed by the `pp_guest` cookie
  token (set by `src/middleware.ts`, name in `src/lib/constants.ts`). Upsert:
  one live draft per guest.
- **Signed in** → `trips.save(…)` under the Clerk subject.
- On sign-in, **`<GuestClaim>`** (mounted under the providers) fires
  `trips.claimGuestTrips({ guestId })` once, reassigning the draft rows to the
  user (`userId` set, `guestId` cleared). Login only ever *keeps* what you built.

## Language / market posture

The built prototype is **English** (`src/app/layout.tsx` → `<html lang="en">`).
The Drift target market is **Spanish / México** (`docs/wiki/prototipo-drift.md`).
This decision is **open** — the prototype is not localized in this iteration.
