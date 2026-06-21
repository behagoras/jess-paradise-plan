<objective>
Implement EVERY recommendation in the Paradise Plan "Improvement Spec" (artifacts/ui-docs-improvement-spec.html) across the running codebase — UI/UX trust fixes, documentation corrections, cross-link reconciliations, and internal refactors. The spec is an adversarial audit (33 findings, 8 leverage moves, a quick-wins list, and a Sprint 0→2 roadmap) of a working Next.js + Convex travel-planner prototype.

The end goal: kill the user's "the experience feels long" complaint, close every trust gap where the UI shows fake/dead data, and make the docs describe the app that actually exists — WITHOUT introducing any live data integration yet.

This matters because the maintainer is solo: the repo currently holds three contradictory product visions (the BUILT wizard, a 2019 XD checkout flow, and an unbuilt Spanish "Drift" feed) and ~1,700 lines of vision docs against ~9 stale README lines for the built app. Reducing that confusion and shipping the cheap usability wins is the highest-leverage work available.
</objective>

<context>
Tech stack: Next.js 15 (App Router, src/ layout), React 19, TypeScript, Tailwind v4 + shadcn/ui (New York style, CSS variables in src/app/globals.css), Convex (session persistence only), Clerk (auth). Confirm against @package.json and @components.json.

The built app is a state machine: Landing → 3-step Wizard → 2.9s Generating loader → top-3 Results → Detail → HandoffSheet (Expedia). It runs on 6 hardcoded destinations in src/lib/data.ts, scored synchronously in src/lib/usePlanner.ts. There are NO network/API calls anywhere in src/.

Read these before changing anything:
- @artifacts/ui-docs-improvement-spec.html — the spec being implemented (open the #backlog section for all 33 findings with file:line evidence; #decision and #roadmap for sequencing).
- @CLAUDE.md — project conventions.
- @README.md — currently stale; you will fix it.
- @src/lib/usePlanner.ts, @src/lib/data.ts, @src/components/screens/Wizard.tsx, @src/components/screens/Detail.tsx, @src/components/screens/Generating.tsx, @src/components/screens/Landing.tsx, @src/components/screens/Results.tsx, @src/components/screens/HandoffSheet.tsx, @src/components/BrandRail.tsx, @src/app/page.tsx, @src/app/layout.tsx, @src/middleware.ts, @src/lib/useGuestId.ts, @convex/schema.ts, @convex/trips.ts

Graphify: a knowledge graph of this repo exists at graphify-out/ (graphify-out/GRAPH_REPORT.md). The spec's god-object and cohesion findings are derived from it. Consult it to ground the refactor work (usePlanner() = god node, 15 edges; cn() = 39 edges; Community 0 "App Shell" cohesion 0.06). If line numbers in the spec have drifted, treat them as approximate and locate by symbol/content, not by absolute line.
</context>

<critical_constraint>
STALE / HARDCODED DATA IS EXPECTED AND ACCEPTABLE. The product will connect to real APIs (Amadeus Flight Inspiration, Travelpayouts) in the FUTURE — NOT in this task. Therefore, for every finding:

- Do NOT add any live data fetch, API client, env var, or async sourcing layer.
- When a finding's "longer-term" fix requires real data (e.g. departure-filtered Amadeus search), implement ONLY the honest-now path: hide/collapse the input until live data makes it meaningful, OR filter/derive against the existing static catalog (DEST_BASE, dest.nights, dest.departsIn, state.when). Never wire a fake input to a fake source.
- Honesty over theater: replace fake live signals (scarcity counts, "1,240 trips", pulsing live badges, dishonest loader copy) with honest equivalents or remove them — do not make them "look" live.
- Where the spec says "when real data exists, this becomes real," leave a clearly-marked `// TODO(live-data):` comment at the seam so the future integration point is obvious.
</critical_constraint>

<resolved_decisions>
These forks in the spec are already decided — implement exactly these:

1. WIZARD STEP 1 = "Collapse, keep when+intensity." Keep the two fields that actually drive output (When → discount; Activity intensity → scoring) visible in Step 1. Move budget, departure, packages, vacation type, and who's-traveling (travelerTypes) into a collapsed, optional "More filters" disclosure (default closed). Do NOT delete the field components — relocate them. This is the lower-risk path and sets the optional-filter pattern the days filter plugs into.

2. HANDOFF CTA = "Implement window.open now." Wire the commented-out redirect in HandoffSheet.tsx (~line 50) to `window.open(...)` an affiliate/provider deep link. Use a clearly-marked placeholder URL (e.g. an Expedia search URL built from the destination, marked `// TODO(live-data): real affiliate deep link`). Reframe the Convex trip-save as BROWSING HISTORY, not a booking — update any README/doc copy that calls it a "booking record." This commits the repo to the Drift affiliate-only model.

3. SCOPE = "Everything." Implement all findings: every UI/UX/trust fix, every documentation correction, all cross-link reconciliations, AND the internal refactors (T5: split the usePlanner god object, extract pricing magic-numbers to named constants, dedupe GUEST_COOKIE into a shared constants module).
</resolved_decisions>

<implementation>
Work in the spec's roadmap order so cheap, low-risk wins land first and each layer de-risks the next. Use the spec's #backlog evidence (file:line) as your task list; the items below are the consolidated, deduplicated set.

SPRINT 0 — Quick wins (UI trust + flow length)
1. Delete Step 3 (summary) as a separate screen. Move the "Surprise me" CTA onto Step 2: change the WizardBar isLast logic in src/app/page.tsx (~line 114) so step 2 shows the CTA. Optionally add a one-line micro-summary in the bar (e.g. "Feeling: Beach, Nightlife · Hot weather"). Remove the now-dead Step3Summary (Wizard.tsx ~253-306) and any [1,2,3] step-tab references that assume 3 steps.
2. Collapse Step 1 per resolved decision #1 (when + intensity stay; rest go into a default-closed "More filters" disclosure). Mark the optional groups visually/aria as optional.
3. Detail "Swap" button (Detail.tsx ~132): it has no onClick. Delete it (there is only one activity per destination). Keep the existing "Remove activity" affordance.
4. Detail hardcoded dates "Jul 2"/"Jul 5" (Detail.tsx ~86,93): remove. Replace with honest generic copy ("Outbound · Nonstop" / "Return · Nonstop"), OR derive a vague-but-honest label from state.when + dest.departsIn/dest.nights (e.g. Flexible → "Flexible · Confirmed on booking"; named month → "Early {Month}"). No calendar library.
5. Results scarcity signals ("Departs in 18 days · 4 seats left"): these are fixed per-destination in data.ts and never change. Either remove the countdown, or derive departsIn honestly from state.when. Replace fixed "seats left" with non-deceptive copy. Mark `// TODO(live-data):` where real inventory would go.
6. Generating loader copy (Generating.tsx ~7-11): soften "Scanning 1,240 trips…" / "Pricing flexible departures…" / "Locking in your package…" to a single honest phase like "Matching your preferences…". The 2.9s timer (usePlanner.ts ~138-146) over synchronous scoring may stay as UX rhythm but the copy must not describe server work that does not happen. Add `// TODO(live-data):` noting copy becomes accurate once a real async search exists.
7. Fake trust signals: remove `animate-pp-pulse` from the "1,240 trips" live badge (Landing.tsx ~56, BrandRail.tsx ~78). Replace the STATS array (BrandRail.tsx ~4-8: "4.9★", "−38%", "60s") and "1,240 trips matched this week" (Landing.tsx ~57) with honest values ("6 curated destinations · 3 results per search · All prices estimated") or remove until real usage data exists.
8. WizardBar (page.tsx ~116) and DetailBar (page.tsx ~152): add `sm:inset-x-0` so the bar spans full card width in the sm+ floating-card layout instead of shrinking to content width.
9. Desktop landing hero (Landing.tsx ~38-68): the lg hero is a content-less 280px gradient duplicating BrandRail (all overlays are lg:hidden). Take the zero-complexity path: hide the right-pane hero entirely at lg so the CTA anchors above the fold (or replace with a tight stat/thumbnail row). Do not duplicate the BrandRail gradient.

SPRINT 1 — Make collected inputs real (against the static catalog only)
10. Budget filter: in computeOptions (usePlanner.ts ~155-166), after scoring, drop destinations where `DEST_BASE[d.key] > state.budget * 1.3` (≈30% tolerance). Handle the short/empty-results case gracefully (e.g. fall back to closest matches with a soft "widen your budget" note) since the catalog is only 6 destinations. Add budget to the relevant dependency arrays.
11. "Days available" filter (Idea #1 / Drift differentiator): add a days-range field to PlannerState (e.g. daysMin/daysMax or a "Trip length" chip row: Weekend / 3-4 / 5-7 / 1 week+). Place it inside the "More filters" disclosure so it does NOT re-lengthen Step 1. Use it in computeOptions to filter on dest.nights. Wire it into dependency arrays.
12. Departure: since real departure-aware pricing needs live data, do NOT fake it. Keep departure inside "More filters" (collapsed) and add a `// TODO(live-data):` note that it will filter origins once Amadeus exists. Remove it from any summary that implies it changed results.
13. Terminology fix with a silent runtime effect: WEATHER 'Mild' vs docs 'Medium' (data.ts ~66). Pick one canonical value and make data.ts, the rendered label, and the docs agree. Verify no destination's `weather` field breaks scoring (usePlanner.ts ~163). Also reconcile the display labels Include/Packages, Senior/Advanced Age, Who's-traveling/Traveler-type to one canonical set across data.ts, Wizard labels, and docs.
14. GUEST_COOKIE dedup: create src/lib/constants.ts exporting `GUEST_COOKIE = 'pp_guest'` (plain TS, NO Node/React/edge-incompatible imports). Import it in both src/middleware.ts and src/lib/useGuestId.ts. Remove the duplicate declarations.

SPRINT 1.5 — Handoff (resolved decision #2)
15. HandoffSheet.tsx (~50): implement `window.open(affiliateDeepLink, ...)` with a marked placeholder provider URL built from the destination. Keep the Convex save but reframe it (and its README/doc copy) as browsing history, not a booking.

SPRINT 2 — Documentation & decisions (these MUST match the code you just changed)
16. Fix the stale README.md: Styling row (~20) → "Tailwind v4 + shadcn/ui (New York style, CSS variables; tokens in src/app/globals.css)". Rewrite the Key files block (~56-70) with real src/-prefixed paths: remove lib/theme.ts, components/PhoneFrame.tsx, components/StatusBar.tsx; add src/components/BrandRail.tsx, GuestClaim.tsx, src/lib/useGuestId.ts, utils.ts, src/lib/constants.ts. Fix the ImageSlot path (~128). Fix "live price breakdown" (~35) → "static price breakdown (hardcoded seed data; see Notes)". Update the Wizard description (~32) to reflect the NEW collapsed 2-visible-field Step 1.
17. Add a BUILT-APP.md (or a "### Built app (what actually exists)" README section) documenting: the PlannerState shape and which fields drive scoring; the 6-DEST catalog + DEST_BASE + PROVIDER; the screen state machine and transitions; the Convex trips table fields (convex/schema.ts); and an explicit note that docs/wiki/ describes the unbuilt Drift VISION, not the current build.
18. Add a one-paragraph ADR (top of README.md or docs/index.md, or docs/adr/): record that the wizard is a deliberate transitional FILTER LAYER toward the Drift discovery-first feed — not abandoned work and not the final entry point. Reference docs/wiki/roadmap.md.
19. Record the affiliate-only checkout decision (resolved #2) as the canonical model. Banner docs/flujo-app-ui.md as "> STATUS: Historical reference — 2019 XD prototype" and remove/tag it in the handoff-build bundle (handoff-build/README.md ~28) so future sessions don't treat its first-party Checkout as current.
20. Add a "Language/market posture" note (README or docs/index.md): the built prototype is English (layout.tsx lang='en'); the Drift target is Spanish/México (docs/wiki/prototipo-drift.md). Mark the decision as open; do NOT localize in this task.
21. Document the previously-undocumented Generating screen and GuestClaim/Convex guest-claim flow in the built-app docs; add GuestClaim.tsx to Key files.

SPRINT 2 — Internal refactors (T5; behavior-preserving)
22. Split the usePlanner god object: extract pure functions `computeOptions(...)` → src/lib/scoring.ts and the pricing useMemo body → src/lib/pricing.ts (zero React deps). Move the Generating phase timers (e.g. PHASE_DELAYS = [950,1850,2900]) to a co-located constant in Generating.tsx or a constants module. Keep usePlanner as a thin coordinator; KEEP the PlannerApi shape unchanged so screens need no edits.
23. Extract pricing magic numbers (usePlanner.ts ~172-189: 0.34/0.16 discounts, 0.46/0.36/0.58 airline, 0.4/0.64/0.27 hotel, 0.16 activity, 0.16 tax) into named, commented constants (FLEXIBLE_DISCOUNT, FLIGHT_RATIO, TAX_RATE, etc.). Add a JSDoc above DEST_BASE explaining what "base price" denominates. No behavior change.
24. Add a screen-registry block comment in page.tsx documenting the 4 edit locations needed to add a screen (switch, bottomBar ternary, stageMax, optional bar) and the overlay pattern used by HandoffSheet.

SPRINT 3 — Ship it (open a PR)
25. After verification passes, commit the work and open a pull request:
    - Do NOT commit directly to the default branch. Create a feature branch first (e.g. `feat/improvement-spec`).
    - Stage and commit in logical chunks aligned to the sprints (UI quick wins, real filters, handoff, docs, refactors) with clear messages; OR a single well-described commit if the change set is cohesive.
    - End every commit message with the required trailer:
      `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
    - Push the branch and open the PR with `gh pr create`. Title: "Implement UI + docs improvement spec". Body must: link to artifacts/ui-docs-improvement-spec.html; summarize what changed per sprint; explicitly note that NO live data was wired (stale data is expected; real APIs come later) and list every `// TODO(live-data):` seam; call out the resolved decisions (collapsed Step 1, real window.open handoff, affiliate-only model); and list any of the 33 findings deliberately deferred and why.
    - End the PR body with:
      `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
    - Report the PR URL back.

GENERAL
- For maximum efficiency, when performing independent reads/searches, batch them in parallel.
- After each sprint's edits, reflect on whether the change preserved the PlannerApi contract and screen behavior before moving on.
- Match the surrounding code style (Tailwind utility classes, existing chip()/cn() helpers, existing component idioms). Do not introduce new dependencies.
</implementation>

<verification>
Before declaring complete, verify:
- `npm run lint` and `npx tsc --noEmit` (or `next build`) pass with no new errors.
- Grep the codebase: NO new fetch/API/env-var data sources were added; every deferred-to-live-data point carries a `// TODO(live-data):` marker.
- Wizard is now ≤2 screens; Step 1 shows only When + Activity intensity by default, with the rest in a closed "More filters" disclosure; "Surprise me" lives on Step 2.
- The Detail "Swap" button, hardcoded Jul 2/Jul 5 dates, pulsing live badge, and dishonest loader/stat copy are all gone or made honest.
- Budget and days-available filters measurably change the Results set against the static catalog (test: budget=$400 must NOT surface $1,340 Patagonia; a "Weekend"/short days selection filters by dest.nights). Confirm a graceful state when filters yield <3 results.
- HandoffSheet opens a (placeholder) provider URL via window.open; Convex save is reframed as browsing history in code comments and docs.
- GUEST_COOKIE is defined once in src/lib/constants.ts and imported by both middleware.ts and useGuestId.ts (confirm middleware still builds under its runtime).
- README has zero references to non-existent files (theme.ts, PhoneFrame.tsx, StatusBar.tsx); BUILT-APP.md exists; the entry-point ADR and affiliate-only decision are recorded; flujo-app-ui.md is bannered as historical.
- Refactor: computeOptions and pricing are pure functions in their own modules; PlannerApi shape unchanged (screens compile without edits); pricing magic numbers are named constants. App behavior (scores, prices) is identical to before the refactor for the same inputs.
- Run the app (`npm run dev`) and walk the full flow (Landing → Wizard → Generating → Results → Detail → Handoff) to confirm nothing is visually broken at mobile (390px) and tablet (≥640px) widths — the WizardBar/DetailBar must span full card width at sm+.
- Re-read the spec's #backlog and confirm each of the 33 findings has been either implemented or, where it required live data, addressed via the honest-now path with a TODO marker. Note any finding you deliberately deferred and why.
</verification>

<success_criteria>
- Every recommendation in artifacts/ui-docs-improvement-spec.html is implemented or honestly deferred-with-marker per the stale-data constraint.
- The "feels long" flow is shortened (3 wizard screens → ≤2; Step 1 collapsed) and no UI element shows fake/dead/contradictory data.
- Collected inputs (budget, days) genuinely affect Results against the static catalog; departure stays honestly collapsed.
- Documentation describes the app that actually exists, the wizard-as-filter-layer ADR and affiliate-only decision are recorded, and the historical XD doc is bannered.
- Internal refactors land without changing app behavior or the PlannerApi contract.
- lint + typecheck + build are green; the app runs and the full flow works at mobile and tablet widths.
- Work is committed on a feature branch (not the default branch) and a PR is opened via `gh pr create`, with the body summarizing changes, the no-live-data stance + TODO seams, and the resolved decisions. The PR URL is reported.
</success_criteria>
