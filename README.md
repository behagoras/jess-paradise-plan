# Paradise Plan

> Don't pick where. Pick the feeling.

A surprise-trip planner mobile app. You give it your budget and your vibe; it
hands you a ready-to-book trip. This is a faithful React transcription of the
`Paradise Plan.dc.html` Claude Design prototype, built on the production stack:
**Next.js (App Router) · Clerk · Convex**.

Per the brief, only the **Paradise** theme ships (the source also defined Ocean,
Jungle, and Midnight — those were dropped).

> **What actually exists vs. what's a vision.** This README + [`BUILT-APP.md`](./BUILT-APP.md)
> describe the **built** app. The Spanish wiki under `docs/wiki/` (esp.
> `prototipo-drift.md`) describes the **unbuilt "Drift"** discovery-first feed —
> the strategic target, not the current build. `docs/flujo-app-ui.md` is the
> **historical 2019 XD checkout flow** and is bannered as such.

## Decisions (ADRs)

**ADR — the wizard is a transitional filter layer.** The built 2-step wizard is
a deliberate, lean **filter layer** on the path toward the Drift discovery-first
feed (`docs/wiki/roadmap.md`) — not abandoned work, and not the intended final
entry point. We keep it lean now (only the inputs that drive output are visible;
the rest are optional) and converge toward the feed incrementally, because most
of the product ideas (days filter, optional filters, save, notifications,
discovery) align with Drift rather than with extending the wizard.

**ADR — affiliate-only checkout (canonical).** Paradise Plan never takes
payment. At hand-off we record the selection as **browsing history** in Convex
and `window.open` the **real** affiliate deep link the flight search returned —
Aviasales (the Travelpayouts flight brand), tagged with our public TP marker,
with a Hotellook destination search as fallback. Booking happens on the
provider's site. This supersedes the first-party "Checkout" in the historical
XD flow (`docs/flujo-app-ui.md`), which is **not** the current model.

**ADR — live Travelpayouts data, hide-missing over fake-fallback (canonical).**
The wizard → results → detail → hand-off flow runs on **real** data: flights,
real outbound/return dates, airlines, transfers, per-person fares, and hotels are
fetched live from Travelpayouts (Aviasales + Hotellook Data APIs) through
**Convex actions** (`convex/travelpayouts.ts`) that keep the token server-side.
The curated catalog (`src/lib/data.ts`) only supplies photos, blurbs, region copy
and vibe tags to **pick which destinations to price**; it no longer supplies any
displayed number. The binding rule: **if the API doesn't return a field, we hide
it — we never fabricate it.** Prices are cached "from" estimates (a few hours
old), re-confirmed on the provider's site. Hotels are wired but **hidden when the
provider returns nothing** (Hotellook is down upstream as of this writing, so the
hotel line is currently hidden and trips price flight-only). Consequently every
fabricated signal from the prototype — the `−34%` discount, strikethrough
"original" price, "Best match" / "Great deal" badges, hardcoded star `rating`s,
and the `departsIn` / `seats` scarcity counters — has been **removed**, and the
named provider now matches where users actually go (Aviasales, not Expedia).
`pricing.ts` sums only the real, included line items (no ratios, no seed base).

**Language / market posture (open).** The built prototype is English
(`src/app/layout.tsx` → `lang="en"`); the Drift target is Spanish/México
(`docs/wiki/prototipo-drift.md`). This is an open decision; the app is **not**
localized in this iteration.

**ADR — the discovery surface is an open-destination, vibe-indexed deal feed
cached in Convex.** Now that Travelpayouts is wired, the engine that fulfils
"pick the feeling, not the destination" is **open-destination sourcing**
(`v2/prices/latest?origin=MEX` → the cheapest destinations TP has seen), **not**
per-route search; the per-route flight lookup (`convex/travelpayouts.ts`
`searchCheapestFlight`) is demoted to a "confirm fare" step on the detail view.
Raw deals are ingested into a Convex `deals` cache — seeded by a **scheduled
action** (cron) and topped up as users search (a read-through cache) — enriched
against a **curated IATA→vibe map** (`destinations` table), and ranked by a
**proxy `deal_score`** (price percentile within the batch + non-stop + escapade
length) while an append-only `observations` table accumulates the history that
powers real price-rarity later. Caching is not an optimization but a
requirement: filtering by *vibe* is impossible against the raw provider API, so
the enriched copy in Convex *is* the query engine. The front becomes
**feed-first**: the home is the deal feed (vibe/budget/days filters on top, plus
the conversational "Surprise me" mood input from `prototipo-drift.md`), with
behaviour (view/save/hand-off) logged from day one so personalised ranking can
be **learned later, not built now**. A **deal is a flight (the hook) with
affiliate-attach experiences (Viator) and hotels (Booking) as separate
deep-link CTAs — never a single bundled price** (bundling implies being
merchant-of-record: Phase 2, IATA/PCI). This **supersedes** the
curated-catalog-as-entry-point model the built app still embodies (`src/lib/data.ts`
+ `scoring.ts` choose which destinations to price) and the wizard-as-funnel
framing; those retire as the feed lands. (The synthetic `pricing.ts` ratios and
the static seed prices are already gone — pricing now sums only real Travelpayouts
line items — so what remains to retire is the catalog-gated *entry point*, not
fabricated numbers.) Two honesty constraints bind the cache: prices are **cached
inspiration data** ("seen X h ago, confirm on provider"), and **only the
inspiration layer may be cached — never live/transactional APIs** (Booking
Demand and Duffel forbid it; live search is bound by look-to-book limits). New
domain entity: a **travel project** — a saved trip-intent (duration + vibes +
budget) that deals are saved into — with preferences at **two scopes**: the user
(durable taste) and the project (this trip's intent). See
`docs/wiki/arquitectura-mvp.md` (4-layer engine) and
`docs/wiki/proveedores-apis-e-inventario.md` (provider thresholds).

## Architecture

| Layer    | Tech                                   |
| -------- | -------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19      |
| Auth     | Clerk (`@clerk/nextjs`)                |
| Backend  | Convex (browsing-history persistence + Travelpayouts actions/cache) |
| Data     | Travelpayouts (Aviasales flights + Hotellook hotels) via Convex actions |
| Styling  | Tailwind v4 + shadcn/ui (New York style, CSS variables; tokens in `src/app/globals.css`) |

### Screen flow

The whole experience is one scroll container driving a screen state machine
(`src/lib/usePlanner.ts`). See [`BUILT-APP.md`](./BUILT-APP.md) for the full
state map and which inputs drive output.

```
landing → wizard (step 1 → 2) → generating → results → detail → handoff
```

- **Landing** — hero, "how it works", Clerk sign-in.
- **Wizard** — **2 steps**. Step 1 shows only the two inputs that drive output
  (**When**, **Activity intensity**) plus a default-closed **"More filters"**
  disclosure (budget, trip length, travelers, departure, packages, vacation
  type, who's-traveling). Step 2 is the preference + weather chips, ending in
  **"Surprise me"**.
- **Generating** — animated 3-phase loader whose phases advance on the **real**
  Travelpayouts search awaits (fares → stays → assembling), not timers.
- **Results** — up to 3 **real** trips. The catalog scoring only picks which
  destinations to fetch fares for; each card's airline, dates, transfers, and
  per-person fare are live Travelpayouts data. Candidates with no real fare are
  hidden, with a "widen your filters / departure" note when few or none match.
- **Detail** — the selected trip's **real** flight (airline, real outbound/return
  dates, stops, fare) and **real** hotel (name, stars, price) when Hotellook
  returns one — the hotel line is **hidden** otherwise (Hotellook is down
  upstream right now). The price breakdown sums only the real, included lines.
- **Hand-off** — bottom sheet that records the selection as **browsing history**
  in Convex (not a booking) and `window.open`s the **real** affiliate deep link
  the flight search returned (Aviasales + our Travelpayouts marker; Hotellook
  fallback). Affiliate-only; we never take payment.

### Guest sessions (anonymous → Clerk)

Clerk has no anonymous users, so a guest is given a random **`pp_guest`** token
(set as a cookie by `middleware.ts` on first visit; the name lives once in
`src/lib/constants.ts`, imported by both the middleware and `useGuestId`). At
hand-off the selection is saved as **browsing history** (not a booking):

- **Guest** → `trips.saveDraft({ guestId, … })` stores a draft row keyed by the
  token (no `userId`). The token is an unguessable capability, not a credential.
- **Signed in** → `trips.save(…)` stores the trip under the Clerk subject.

When a guest later signs in, `<GuestClaim>` (mounted under the providers) fires
`trips.claimGuestTrips({ guestId })` once, which reassigns those draft rows to
the user (`userId` set, `guestId` cleared). So login is only ever needed *to
keep* what you already built — never to start.

### Key files

```
src/
  app/
    layout.tsx                # ClerkProvider → ConvexClientProvider
    page.tsx                  # screen orchestrator + bottom bars (+ screen registry)
    ConvexClientProvider.tsx  # Convex + Clerk wiring
    globals.css               # Tailwind v4 + shadcn design tokens
  lib/
    data.ts                   # 6-destination catalog (photos/blurbs/vibe) + DEST_BASE budget threshold + PROVIDER
    usePlanner.ts             # state machine + surprise() (fetches real offers via Convex actions)
    scoring.ts                # pure: computeOptions() — picks destinations to price (score + budget/length filter)
    trip.ts                   # pure: city→IATA, when→month, real flight window → hotel dates, date labels
    pricing.ts                # pure: computePricing() — sums only real, included line items
    constants.ts              # GUEST_COOKIE (shared by middleware + useGuestId)
    useGuestId.ts             # reads/mints the pp_guest token client-side
    utils.ts                  # cn() helper
  components/
    BrandRail.tsx             # persistent desktop brand panel
    GuestClaim.tsx            # migrates guest drafts to the user on sign-in
    Logo.tsx, ImageSlot.tsx
    screens/                  # Landing, Wizard, Generating, Results, Detail, HandoffSheet
  middleware.ts               # Clerk + pp_guest cookie issuance
convex/
  schema.ts                   # trips (browsing history) + tpFlightCache / tpHotelCache / tpDict
  travelpayouts.ts            # real flight + hotel + cheapest-destination actions (token server-side)
  trips.ts                    # save / saveDraft / claimGuestTrips / list
  auth.config.ts              # Clerk JWT bridge
```

### Repo layout (non-app)

```
docs/            # canonical knowledge vault (Obsidian, LLM-Wiki method)
.prompts/        # canonical design-handoff prompts (registry)
design/          # all source & design material
  project-base/    # original 2019 XD source: screens, presentation, PDFs
  assets-export/   # exported style guide, screen map, logos, mobile renders
  prototypes/      # standalone HTML prototypes
  screenshots/     # current app screenshots
handoff-build/   # generator for the self-contained handoff bundle
  build.sh         # rebuilds paradise-plan-handoff/ from canonical sources
  bundle-readme.md # the bundle's own README (source)
```

Documentation has a **single source of truth**: edit content in `docs/`,
`design/`, or `.prompts/`, then run `./handoff-build/build.sh` to regenerate the
shippable handoff bundle (gitignored — never hand-edited).

## Getting started

1. Install deps:

   ```bash
   npm install
   ```

2. Configure environment. Copy `.env.local.example` → `.env.local` and fill in:

   - **Clerk** keys from <https://dashboard.clerk.com>
     (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
   - In Clerk, create a **JWT template named `convex`** and set
     `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` to its issuer URL.
   - **Convex** is already provisioned (`NEXT_PUBLIC_CONVEX_URL`). Set the same
     `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` in the Convex dashboard env vars so
     `auth.config.ts` can verify tokens.

3. Run Convex codegen / dev (keeps `convex/_generated` in sync):

   ```bash
   npx convex dev
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

> Note: the app boots only with a **valid** Clerk publishable key — Clerk
> validates the key format at init, so the placeholder in `.env.local` must be
> replaced before `npm run dev` / `npm run build` will fully run.

## Notes

- `src/components/ImageSlot.tsx` stands in for the design tool's `<image-slot>`
  drop targets — it renders the gradient + a hint. Swap for `next/image` when
  real photography is available.
- **Pricing and trip data are live**, fetched from Travelpayouts through the
  Convex actions in `convex/travelpayouts.ts` (token server-side). Flights, real
  dates, airlines, transfers, per-person fares, and the affiliate deep link are
  all real; `src/lib/pricing.ts` sums **only** the real, included line items
  (no discounts, taxes, ratios, or seed base — those fabricated lines were
  removed). `src/lib/scoring.ts` no longer prices anything; it just scores the
  curated catalog to pick which destinations to fetch fares for.
- **Hide-missing is the rule:** any field the provider doesn't return is hidden,
  never invented. Hotels are wired but **hidden when Hotellook returns nothing**
  — and Hotellook is **down upstream** right now, so trips currently price
  flight-only. The removed fabrications (`−34%` discount, strikethrough price,
  "Best match"/"Great deal" badges, star `rating`s, `departsIn`/`seats` scarcity)
  are gone, and the named provider is **Aviasales** (where the hand-off goes),
  not Expedia.
