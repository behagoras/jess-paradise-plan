<objective>
Refactor this Next.js 15 (App Router) project to use the conventional `src/` directory
layout, then verify the app still boots and renders correctly via `npm run dev` and the
Playwright MCP browser. The end goal is a cleaner root that separates application source
from configuration and tooling, with ZERO behavior changes — every route, import, and test
must work exactly as before.
</objective>

<context>
- Project: Paradise Plan — Next.js 15 App Router + Clerk + Convex, TypeScript, Playwright e2e.
- Package manager: npm. Dev server: `npm run dev` (Next.js on http://localhost:3000).
- Read `./CLAUDE.md` (if present) and `./README.md` first for project conventions.
- Current root-level source that must move into `src/`:
  - `app/`            (App Router: layout.tsx, page.tsx, globals.css, sign-in/, sign-up/, ConvexClientProvider.tsx)
  - `components/`     (GuestClaim, ImageSlot, Logo, PhoneFrame, StatusBar, screens/)
  - `lib/`            (data.ts, theme.ts, useGuestId.ts, usePlanner.ts)
  - `middleware.ts`   (Clerk middleware — must live next to `app/`, i.e. `src/middleware.ts`)
- Current path alias (`tsconfig.json`): `"@/*": ["./*"]`.
- Import aliases in use across the codebase:
  `@/components/*`, `@/lib/*`, and crucially `@/convex/_generated/api`.
</context>

<constraints>
CRITICAL — these are the gotchas that make this refactor non-trivial. Honor them or the build breaks:

1. **`convex/` MUST stay at the project root.** Convex requires its folder at the repo root;
   do NOT move it into `src/`. The codebase imports `@/convex/_generated/api`, so after you
   repoint `@/*` to `./src/*`, that import will break unless you ALSO add a dedicated alias.
   In `tsconfig.json`, set:
   ```json
   "paths": {
     "@/*": ["./src/*"],
     "@/convex/*": ["./convex/*"]
   }
   ```
   (More specific keys take precedence, so `@/convex/_generated/api` resolves to root `convex/`.)

2. **Keep at the root** (do NOT move): `convex/`, `e2e/`, `playwright.config.ts`,
   `next.config.mjs`, `next-env.d.ts`, `tsconfig.json`, `package.json`, `middleware`-unrelated
   config, `.env.local`, `public/` (if any). Standard "src move" scope only.

3. **Use `git mv`** for every move so history is preserved and Next.js/TS pick up the new paths.

4. **Do NOT rewrite the `@/...` imports** in source files — the whole point of the alias update
   is that `@/components/*` and `@/lib/*` keep working unchanged. Only add the `@/convex/*`
   alias. Verify no file used a *relative* import that crosses the moved boundary (e.g.
   `../lib/...` from `app/`); if any exist, fix them to `@/...` or correct relative paths.

5. **Behavior must not change.** No new dependencies, no refactoring of component logic, no
   formatting churn beyond the moves and the single tsconfig edit.
</constraints>

<implementation>
Work in this order:

1. Read `./README.md` and `./tsconfig.json` to confirm the current alias and any conventions.
2. Create `src/` and move source into it with git:
   - `git mv app src/app`
   - `git mv components src/components`
   - `git mv lib src/lib`
   - `git mv middleware.ts src/middleware.ts`
3. Update `./tsconfig.json` `paths` exactly as shown in constraint #1 (add `@/convex/*`, repoint `@/*`).
4. Grep for paths that may still assume a root layout and fix only what is genuinely broken:
   - `grep -rnE "from ['\"]\.\.?/" src` — catch relative imports that now cross the `src` boundary.
   - Check `next.config.mjs`, `playwright.config.ts`, and any config for hardcoded `./app`,
     `./components`, or `./lib` paths (Next.js auto-detects `src/`, so usually none needed).
   - Confirm `tsconfig.json` `include` still covers `src` (its `**/*.ts(x)` globs do).
5. Confirm `convex/` and `e2e/` remain at root and untouched.
</implementation>

<verification>
Do not declare success until ALL of these pass. For maximum efficiency, run independent checks together.

1. **Type check / build sanity:** run `npx tsc --noEmit` — it must complete with no new errors.
2. **Dev server boots:** start `npm run dev` (run it in the background) and wait for the
   "Ready" / compiled message on http://localhost:3000. There must be no module-resolution
   or "Can't resolve '@/...'" errors in the dev output.
3. **App renders via Playwright MCP:** using the Playwright MCP browser tools, navigate to
   `http://localhost:3000`, take a snapshot/screenshot, and confirm:
   - The landing page renders (no Next.js error overlay, no blank page).
   - The browser console shows no fatal errors (Clerk/Convex network warnings without a
     dev key are acceptable; module-not-found / React render crashes are NOT).
   - Navigate to `/sign-in` and confirm it also renders.
4. **Clean up:** stop the background dev server when verification is done.
5. Report the final `src/` tree and the exact `tsconfig.json` paths diff.
</verification>

<success_criteria>
- `app/`, `components/`, `lib/`, and `middleware.ts` now live under `src/`; `convex/` and `e2e/`
  remain at the root.
- `tsconfig.json` aliases updated: `@/*` → `./src/*`, plus `@/convex/*` → `./convex/*`.
- No source `@/...` imports were rewritten; `@/convex/_generated/api` still resolves.
- `npx tsc --noEmit` passes; `npm run dev` boots without resolution errors.
- Playwright MCP confirms `/` and `/sign-in` render with no fatal console/build errors.
- Moves done via `git mv` (history preserved); no unrelated changes in the diff.
</success_criteria>
