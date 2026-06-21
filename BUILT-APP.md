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
- **generating** (`Generating.tsx`) — a ~2.9s animated loader. The match itself
  is synchronous/instant; the timers (`GEN_PHASE_DELAYS`) are pure UX rhythm.
  Copy is deliberately honest ("Matching your preferences…").
- **results** (`Results.tsx`) — top-3 destinations scored against the static
  catalog. Shows a soft "widen your budget / trip length" note when filters
  yield fewer than 3 strict matches (`computed.widened`).
- **detail** (`Detail.tsx`) — flight / hotel cards (cycle through 3 static
  options each), optional activity, and a **static** price breakdown.
- **handoff** (`HandoffSheet.tsx`) — bottom-sheet overlay. Records the selection
  as **browsing history** in Convex (NOT a booking) and `window.open`s a
  placeholder provider deep link. **Affiliate-only** — we never take payment.

There are **no network/API calls in `src/`**. All data is hardcoded.

## `PlannerState` and which fields drive output

`PlannerState` (in `src/lib/usePlanner.ts`) holds the whole flow. Of the
collected inputs, only some affect the Results set / price:

| Field | Drives output? | Where |
| --- | --- | --- |
| `general` (vibe chips) | ✅ scoring | `scoring.ts` |
| `weather` | ✅ scoring | `scoring.ts` |
| `intensity` | ✅ scoring | `scoring.ts` |
| `budget` | ✅ filter (≤ base × 1.3) | `scoring.ts` |
| `daysMin` / `daysMax` (trip length) | ✅ filter on `dest.nights` | `scoring.ts` |
| `when` | ✅ discount + date labels | `pricing.ts`, `Detail.tsx` |
| `travelers`, `airlineIdx`, `hotelIdx`, `activityOn` | ✅ price math | `pricing.ts` |
| `departure` | ❌ honest no-op | TODO(live-data): Amadeus origin filter |
| `packages`, `vacation`, `travelerTypes` | ❌ honest no-op | collected for future use |

The scoring/filtering rules and the pricing math are split into **pure modules**:
- `src/lib/scoring.ts` — `computeOptions()` (score + budget/length filter + top 3).
- `src/lib/pricing.ts` — `computePricing()` and the named price-ratio constants.

`usePlanner` is a thin coordinator: it owns React state and delegates to those
modules. The `PlannerApi` shape is the public contract every screen depends on.

## The catalog (6 destinations)

`src/lib/data.ts` holds the static catalog: `DESTS` (6 destinations:
Cancún, Tulum, Oaxaca, Lisbon, Caribbean Cruise, Patagonia), the per-destination
seed price map `DEST_BASE` (USD), and `PROVIDER` (`"Expedia"`). `DEST_BASE`
denominates a notional all-in per-person seed; `pricing.ts` slices it into
flight/hotel/activity line items. (`departsIn` / `seats` fields exist in the
catalog but are **not rendered** — they were fake scarcity signals and are now
unused; they will become real once a live inventory source exists.)

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
