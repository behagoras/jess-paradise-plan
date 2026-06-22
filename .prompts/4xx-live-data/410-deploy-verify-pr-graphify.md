<objective>
Ship the completed reverse-search rebuild to production, verify the live flow end-to-end with Playwright, update the pull request, and refresh the graphify knowledge graph. This is the final phase (Phase 3) of the rebuild (405→410): prove the real-data, honest, non-deterministic discovery engine works in prod.

Why this matters: typecheck and dev smoke tests are not proof. Real users hit prod; this phase confirms the deployed app returns varied real destinations, completes total-trip cost on Detail, hands off via real affiliate links, and contains NO fabricated data anywhere · then records the work.
</objective>

<context>
- Next.js (App Router) + Convex + Clerk, deployed on Vercel. Repo: behagoras/jess-paradise-plan. Live prod URL: https://paradise-plan.vercel.app/. PR #6 is already MERGED, so this phase opens a NEW PR for the rebuild (do not reuse #6), from a fresh branch off main.
- Depends on Phases 405–409 being implemented and type-clean in the working tree.
- HONESTY RULE: production must show only real data; if you spot ANY fabricated value (price, nights, rating, scarcity, badge, fake link) in the live app, treat it as a release blocker and fix it before declaring done · past sweeps caught real bugs only in prod (e.g. a fabricated nights count).
- Convex env (prod deployment) must hold every key the features read: TRAVELPAYOUTS_TOKEN, NUITE_PROD_API_KEY / NUITE_SANDBOX_API_KEY, VIATOR_API_KEY, OPENTRIPMAP_API_KEY. Verify before deploying (do not print secret values).
</context>

<requirements>
1. Pre-flight: `npx convex codegen` + `npx tsc --noEmit` clean. Confirm the prod Convex deployment has all required env vars (names only). Stage ONLY the files this rebuild changed with `git add <file>` (never `git add .`); commit per logical phase with conventional messages.
2. Deploy: push Convex functions to the PROD deployment and deploy the Next app to Vercel production.
3. Verify with Playwright MCP against the LIVE prod URL `https://paradise-plan.vercel.app/`: (a) run the wizard twice with the same inputs and confirm the result set VARIES (non-determinism) and is NOT always Cancún; (b) confirm a SET FILTER DELIVERS: pick a specific vibe + weather + month and confirm the surfaced destinations visibly reflect that filter; (c) confirm every price displays in MXN; (d) open a destination and confirm a real flight + (when available) real hotel + real activity total with an honest confidence label; (e) trigger a hand-off and confirm the deep links are real; (f) pick a destination with no hotel/activity/image and confirm hide-missing (no fabricated lines; imageless is acceptable). Capture screenshots.
4. Honesty audit of the live app: scan every screen for fabricated content; fix any blocker and redeploy.
5. Open a NEW PR (PR #6 is already merged): push a fresh branch off main and open a PR titled for the reverse-search rebuild (real MXN data, vibe index, total-trip cost, affiliate hand-off), describe the phases, and link the verification screenshots. End the PR body with the required Claude Code attribution. No em dashes in the title, body, or commits.
6. Refresh the knowledge graph: run `/graphify --update` so the new convex/destIndex.ts, convex/liteapi.ts, convex/viator.ts, and the changed planner/scoring modules are reflected. Update the graphify graph and any affected docs.
</requirements>

<output>
- Production deployment (Convex prod + Vercel prod)
- A new PR (not #6) with description + verification screenshots
- Refreshed graphify graph (graphify-out/) and synced docs
</output>

<verification>
- The live prod URL passes all checks in requirement 3 (variation, real totals, real hand-off links, hide-missing).
- No fabricated data remains anywhere in the live app.
- PR #6 reflects the final state; graphify graph is current.
</verification>

<success_criteria>
The deployed app delivers the promise: budget + origin + vibe → varied, real, honestly-priced destinations with working affiliate hand-offs and zero fabrication, verified live, recorded in PR #6 and the knowledge graph.
</success_criteria>
