<objective>
Rebuild the Paradise Plan UI on **shadcn/ui + Tailwind CSS**, themed to look IDENTICAL to
the current design, while making the app genuinely **mobile-first and responsive on
desktop** and **removing the fake-phone chrome**. Today every screen is hand-built with
inline `style={{}}` objects sized for a fixed 390×844 iPhone mock, wrapped in a `PhoneFrame`
bezel and a fake iOS `StatusBar` (notch, "9:41", 5G, battery). The end state: a real
responsive web app made of reusable shadcn components, where the Paradise palette and visual
language are preserved exactly — only the implementation and the responsiveness change.

This matters because the current build only looks right at one width inside a fake phone;
real users on real phones and desktops get a cramped, letterboxed experience. Going to
shadcn also gives a maintainable component system instead of hundreds of inline styles.

Thoroughly analyze the existing screens before writing code, and consider how each fixed-px
layout should reflow across breakpoints.
</objective>

<context>
- Project: Paradise Plan — Next.js 15 App Router, React 19, TypeScript, Clerk + Convex.
  Source now lives under `src/` (App Router in `src/app`, components in `src/components`,
  hooks/data in `src/lib`). Path alias `@/*` → `./src/*`, plus `@/convex/*` → `./convex/*`.
- **No Tailwind and no shadcn are installed yet** (current UI = inline styles + CSS vars in
  `src/app/globals.css`). You must add and configure both.
- READ FIRST, before any change:
  - `./CLAUDE.md` and `./README.md` — project conventions.
  - `src/app/globals.css` — the `:root` Paradise CSS variables, fonts (`--fd`, `--fb`), and
    keyframes (`pp-orbit`, `pp-float`, `pp-up`, `pp-pulse`) the screens animate with.
  - `src/lib/theme.ts` — the `PARADISE` palette, `FONTS`, the `chip()` pill helper, and
    `fieldLabel`. This is the source of truth for colors.
  - `src/app/page.tsx` — the `PhoneFrame` wrapper, the screen `switch`, and the sticky
    `WizardBar` / `DetailBar` bottom bars.
  - `src/components/PhoneFrame.tsx` + `src/components/StatusBar.tsx` — the device chrome to delete.
  - All screens in `src/components/screens/`: `Landing`, `Wizard`, `Generating`, `Results`,
    `Detail`, `HandoffSheet`. Plus `Logo.tsx`, `ImageSlot.tsx`, `GuestClaim.tsx`.
  - `src/lib/usePlanner.ts` — the planner state machine; note it takes a `scrollRef` and
    resets scroll position on screen change.
  - `e2e/paradise-plan.spec.ts` — the Playwright flow test (selectors you MUST NOT break).
- The Paradise palette (keep EXACTLY): bg `#FBF5EC`, surface `#FFFFFF`, surface2 `#FBF3E9`,
  ink `#211B14`, ink-soft `#86796B`, line `#EBE0D0`, accent `#F0542D`, accent-ink `#FFF6F0`,
  accent2 `#EED350`, accent2-ink `#2A2406`, palm `#1E8E5A`, star `#EAB308`, backdrop `#E7DDCD`.
  Rounded, soft, warm; display font `--fd` (rounded), body `--fb` (system). 
- Use the project's shadcn skill/guidance if available (e.g. the `vercel:shadcn` skill) for
  CLI, Tailwind v4 setup, and theming conventions.
</context>

<requirements>
1. **Stand up Tailwind + shadcn/ui** in this Next.js 15 App Router project (npm). Initialize
   shadcn (`components.json`), Tailwind config, and the globals CSS layer. Prefer the current
   shadcn defaults (Tailwind v4 + CSS-variable theming) unless the repo dictates otherwise.
2. **Theme shadcn to the Paradise design — this is the whole point.** Map the Paradise palette
   onto shadcn's semantic tokens so stock components come out looking like the current app
   with no per-component overrides:
   - `--background` ← bg `#FBF5EC`, `--foreground` ← ink, `--card`/`--popover` ← surface,
     `--muted` ← surface2, `--muted-foreground` ← ink-soft, `--border`/`--input` ← line,
     `--primary` ← accent `#F0542D` with `--primary-foreground` ← accent-ink,
     a secondary/accent mapped to accent2 `#EED350` / accent2-ink, `--ring` ← accent.
   - Keep the rounded feel: set the shadcn radius to match the current generous corners
     (cards ~18px, buttons ~15–18px, pills 999px). Wire the display/body fonts (`--fd`/`--fb`)
     into Tailwind's font tokens.
   - Preserve the existing `@keyframes` and the warm gradients/shadows used in the hero etc.
3. **Rebuild every screen with shadcn primitives + Tailwind utilities**, preserving the design:
   - Use `Button`, `Card`, `Badge`, `Slider` (budget), `Sheet` (the `HandoffSheet` overlay is
     a natural bottom sheet → `Sheet`/`Drawer`), `Separator`, `Skeleton` (the `Generating`
     loader), `Input`/`Label` where relevant, and chips as a `Button`/`Toggle` variant that
     reproduces the `chip()` look. Add only the components you actually use via the shadcn CLI.
   - Match the current look closely: the Landing hero gradient + overlay + floating badge, the
     3-step wizard, the orbiting loader, the results cards, the detail view, the handoff sheet.
4. **Make it mobile-first and responsive (full redesign):**
   - Default (mobile) styles first; layer `sm:`/`md:`/`lg:` breakpoints for larger screens.
   - Constrain content to a comfortable centered column on mobile; on desktop use the extra
     width where it helps (e.g. Results as a multi-column grid, Detail side-by-side, a sensible
     max-width like `max-w-md`/`lg:max-w-3xl`). No fixed 390px widths, no fixed 844px height.
   - Replace fixed-px hero/heights with fluid/responsive sizing.
5. **Remove the fake-phone chrome:** delete `PhoneFrame.tsx` and `StatusBar.tsx`. Replace the
   `PhoneFrame` wrapper in `page.tsx` with a real responsive app shell (full-bleed mobile,
   centered max-width on desktop). The sticky `WizardBar`/`DetailBar` become a responsive
   sticky/fixed bottom action bar on mobile, constrained to the content column on desktop
   (keep `env(safe-area-inset-bottom)` handling).
6. **Keep all behavior identical:** Clerk (`SignInButton`/`SignedIn`/`SignedOut`/`UserButton`),
   Convex wiring, the `usePlanner` state machine, the guest-claim flow, every screen
   transition, and all copy. No backend or data changes.
</requirements>

<implementation>
Suggested order (adapt as needed; for efficiency run independent reads/installs together):

1. Read the files listed in <context>. Map out each screen's structure and which shadcn
   component replaces each hand-built piece. After reading, reflect before coding.
2. Install + init Tailwind and shadcn; create `components.json`. Verify the dev server still
   boots with an empty Tailwind layer before porting screens.
3. Put the Paradise palette into the shadcn theme tokens (globals CSS `:root`/`@theme`), keep
   the existing keyframes, and wire fonts + radius. Build one component (e.g. `Button`) and
   confirm it renders in Paradise orange before mass-porting.
4. Build the responsive app shell in `page.tsx`; delete `PhoneFrame` + `StatusBar` and rewire
   `scrollRef`. Since the phone's inner scroll region is gone, attach `scrollRef` to the new
   scroll container (or update `usePlanner` to reset window scroll) so screen-change scroll
   reset still works — verify this, don't assume.
5. Port screens one at a time (Landing → Wizard → Generating → Results → Detail → HandoffSheet),
   replacing inline styles with shadcn components + Tailwind classes. After each, check it in
   the browser at a narrow and a wide viewport.
6. Keep `theme.ts` only if still referenced; if the palette now lives in Tailwind/shadcn tokens,
   migrate the `chip()`/`fieldLabel` consumers and remove dead code cleanly (no orphan exports).

CRITICAL — do not break these, and WHY:
- **Preserve every e2e hook.** `e2e/paradise-plan.spec.ts` drives the flow by
  `data-screen-label="Landing"` / `"Preferences"`, the visible text "Selections summary", and
  buttons by accessible name ("Get started", "Continue", "Surprise me", "Reserve…"). Keep these
  exact `data-screen-label` attributes, the same button text, and real `<button>`/role
  semantics (shadcn `Button` renders a `<button>`, so this holds) — otherwise the suite fails.
- **Palette must match.** Do not introduce shadcn's default slate/zinc theme; if anything looks
  gray instead of warm cream/orange, the token mapping is wrong — fix the tokens, not the
  components.
- **No behavior/copy changes.** This is a UI re-platform, not a redesign of content or logic.
- **No leftover device mock.** Grep to confirm no remaining imports of `PhoneFrame`/`StatusBar`
  and no stray fixed `390`/`844` dimensions.
</implementation>

<output>
Modify/create (relative paths):
- `package.json` / lockfile — add Tailwind + shadcn deps.
- `components.json`, Tailwind config, and `src/app/globals.css` — shadcn setup + Paradise tokens.
- `src/components/ui/*` — shadcn components added via CLI.
- `src/app/page.tsx` — responsive app shell; remove `PhoneFrame` usage; rewire `scrollRef`.
- `src/components/screens/*.tsx` — rebuilt with shadcn + Tailwind, responsive, design-matched.
- `src/components/Logo.tsx`, `ImageSlot.tsx`, `GuestClaim.tsx` — updated as needed.
- Delete `src/components/PhoneFrame.tsx` and `src/components/StatusBar.tsx` (use `git rm`).
- `src/lib/theme.ts` — migrate or remove cleanly if superseded by Tailwind tokens.
</output>

<verification>
Do not declare success until ALL pass. Run independent checks together where possible.
1. `npx tsc --noEmit` — no new type errors.
2. `npm run build` — production build succeeds (catches Tailwind/shadcn config + RSC issues
   that `dev` can hide).
3. `npm run dev` boots on http://localhost:3000 with no console/module errors.
4. **Responsiveness:** verify the app at a mobile width (~375px) and a desktop width (~1280px):
   no horizontal scroll on mobile, content uses desktop width sensibly, no fixed phone frame,
   no fake status bar. Prefer the Playwright MCP browser tools if connected; if not (they were
   absent in a prior session), use the Playwright e2e suite's Chromium and/or curl the rendered
   HTML, and SAY which method you used.
5. **Flow intact:** `npm run test:e2e` passes (Landing → 3-step wizard → Surprise me → results →
   detail → handoff). If a selector legitimately had to change, update the spec and explain why.
6. **Visual parity:** confirm the Paradise palette renders (warm cream background, orange
   primary buttons, yellow accent, rounded cards) — not shadcn's default gray theme.
7. Stop the dev server when done. Report: components added, the token-mapping diff, what each
   screen became, how `scrollRef` was rewired, and verification results.
</verification>

<success_criteria>
- Tailwind + shadcn/ui installed and initialized; UI built from shadcn components.
- shadcn tokens mapped to the Paradise palette so components match the current design (no gray
  default theme); rounded radius and `--fd`/`--fb` fonts wired.
- All six screens rebuilt with shadcn + Tailwind, mobile-first, responsive on desktop.
- `PhoneFrame` and `StatusBar` deleted; no fake notch/bezel; `scrollRef` reset still works.
- Clerk, Convex, `usePlanner`, guest-claim, all copy and transitions unchanged.
- `tsc --noEmit`, `npm run build`, and `npm run test:e2e` all pass; e2e selectors preserved.
- No dead code, no orphaned imports, no leftover 390/844 fixed dimensions.
</success_criteria>
