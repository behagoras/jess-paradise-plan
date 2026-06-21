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
and `window.open` a provider deep link; booking happens on the provider's site.
This supersedes the first-party "Checkout" in the historical XD flow
(`docs/flujo-app-ui.md`), which is **not** the current model.

**Language / market posture (open).** The built prototype is English
(`src/app/layout.tsx` → `lang="en"`); the Drift target is Spanish/México
(`docs/wiki/prototipo-drift.md`). This is an open decision; the app is **not**
localized in this iteration.

## Architecture

| Layer    | Tech                                   |
| -------- | -------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19      |
| Auth     | Clerk (`@clerk/nextjs`)                |
| Backend  | Convex (session persistence only)      |
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
- **Generating** — animated 3-phase loader. The match is synchronous/instant;
  the timers are pure UX rhythm and the copy is honest ("Matching your
  preferences…").
- **Results** — top-3 destinations scored + budget/length-filtered against the
  static catalog, with a "widen your filters" note when fewer than 3 match.
- **Detail** — flight / hotel cards (cycle 3 static options each), optional
  activity, and a **static** price breakdown (hardcoded seed data; see Notes).
- **Hand-off** — bottom sheet that records the selection as **browsing history**
  in Convex (not a booking) and `window.open`s the provider deep link
  (affiliate-only; we never take payment).

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
    data.ts                   # 6-destination catalog + DEST_BASE + wizard option lists
    usePlanner.ts             # state machine (thin coordinator) + PlannerApi
    scoring.ts                # pure: computeOptions() — score + budget/length filter
    pricing.ts                # pure: computePricing() + named price-ratio constants
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
  schema.ts                   # trips table (browsing history)
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
- Pricing (discounts, taxes, per-person totals) and the destination match
  scoring are **static seed data** transcribed from the prototype's
  `renderVals()` — now living in `src/lib/pricing.ts` (named ratio constants)
  and `src/lib/scoring.ts`. **No live data / API calls exist anywhere in
  `src/`.** Every place a real data source will later plug in is marked with a
  `// TODO(live-data):` comment (departure filtering, real dates/availability,
  loader copy, the affiliate deep link).
