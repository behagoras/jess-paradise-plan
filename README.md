# Paradise Plan

> Don't pick where. Pick the feeling.

A surprise-trip planner mobile app. You give it your budget and your vibe; it
hands you a ready-to-book trip. This is a faithful React transcription of the
`Paradise Plan.dc.html` Claude Design prototype, built on the production stack:
**Next.js (App Router) · Clerk · Convex**.

Per the brief, only the **Paradise** theme ships (the source also defined Ocean,
Jungle, and Midnight — those were dropped).

## Architecture

| Layer    | Tech                                   |
| -------- | -------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19      |
| Auth     | Clerk (`@clerk/nextjs`)                |
| Backend  | Convex (real-time DB + functions)      |
| Styling  | CSS custom properties + inline styles  |

### Screen flow

The whole experience is one device frame driving a screen state machine
(`lib/usePlanner.ts`):

```
landing → wizard (step 1 → 2 → 3) → generating → results → detail → handoff
```

- **Landing** — hero, "how it works", Clerk sign-in.
- **Wizard** — 3 steps: trip basics + budget slider, preference chips, summary.
- **Generating** — animated 3-phase "finding your paradise" loader.
- **Results** — top-3 destinations scored against the user's preferences.
- **Detail** — editable flight / hotel / activity cards + live price breakdown.
- **Hand-off** — bottom sheet that persists the trip to Convex and sends the
  user to the booking provider.

### Guest sessions (anonymous → Clerk)

Clerk has no anonymous users, so a guest is given a random **`pp_guest`** token
(set as a cookie by `middleware.ts` on first visit). At hand-off:

- **Guest** → `trips.saveDraft({ guestId, … })` stores a draft row keyed by the
  token (no `userId`). The token is an unguessable capability, not a credential.
- **Signed in** → `trips.save(…)` stores the trip under the Clerk subject.

When a guest later signs in, `<GuestClaim>` (mounted under the providers) fires
`trips.claimGuestTrips({ guestId })` once, which reassigns those draft rows to
the user (`userId` set, `guestId` cleared). So login is only ever needed *to
keep* what you already built — never to start.

### Key files

```
app/
  layout.tsx                # ClerkProvider → ConvexClientProvider
  page.tsx                  # screen orchestrator + bottom bars
  ConvexClientProvider.tsx  # Convex + Clerk wiring
lib/
  data.ts                   # destinations + wizard option catalogs
  usePlanner.ts             # state machine + all pricing/selectors
  theme.ts                  # Paradise palette + chip() helper
components/
  PhoneFrame.tsx, StatusBar.tsx, Logo.tsx, ImageSlot.tsx
  screens/                  # Landing, Wizard, Generating, Results, Detail, HandoffSheet
convex/
  schema.ts                 # trips table
  trips.ts                  # save / list mutations + queries
  auth.config.ts            # Clerk JWT bridge
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

- `components/ImageSlot.tsx` stands in for the design tool's `<image-slot>` drop
  targets — it renders the gradient + a hint. Swap for `next/image` when real
  photography is available.
- Pricing (discounts, taxes, per-person totals) and the destination match
  scoring are transcribed verbatim from the prototype's `renderVals()`.
