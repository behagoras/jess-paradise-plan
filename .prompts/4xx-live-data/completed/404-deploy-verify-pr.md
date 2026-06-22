<task>
Ship it: deploy the secrets + Convex + the app to PRODUCTION, verify the entire flow in prod with Playwright MCP (real data, never lying), fix any screen that fails, then open ONE pull request. This is prompt 4 of 4 - the finish line. Continue on branch `feat/travelpayouts-real-data`.
</task>

<execution_contract>
NON-BLOCKING: never ask the user anything and never wait for interactive input. All credentials are pre-provisioned before the sequence starts (Convex auth + deployment, Vercel auth + linked project, gh auth, the Travelpayouts token, Playwright MCP). Use non-interactive flags (`--yes`, `--prod`, tokens from env). If a step genuinely cannot proceed without a credential, do NOT hang: record the blocker, finish everything else you can (including committing fixes), and report exactly what was missing at the end - do not call AskUserQuestion. Prefer fixing-forward over stopping.
</execution_contract>

<why_this_matters>
The owner wants the app live and provably real in production - not just on localhost. The proof is a Playwright-MCP walk through the deployed prod URL showing real flights, hotels, prices, and dates, with no fabricated elements. The deliverable closes with a single PR summarizing the whole "real data" sweep.
</why_this_matters>

<locked_decisions>
1. Deploy target is **production**.
2. Secrets must be deployed: the Travelpayouts token in Convex (`TRAVELPAYOUTS_TOKEN`), and all `NEXT_PUBLIC_*` envs (Convex URL, Clerk keys, `NEXT_PUBLIC_TP_MARKER`) present in Vercel prod.
3. Verify in prod with **Playwright MCP**, exercising the WHOLE flow.
4. **Never lying:** if any screen shows fabricated/placeholder/broken data in prod, FIX it (commit on the branch) and re-verify before opening the PR.
5. Exactly ONE PR at the end.
</locked_decisions>

<context>
- Convex backend + Next.js on Vercel + Clerk. Read CLAUDE.md, README.md.
- The branch `feat/travelpayouts-real-data` already contains the data layer (401), the wired UI + real filters (402), and the honesty sweep (403).
- Existing e2e: `npm run test:e2e` (Playwright) as a fallback if Playwright MCP is unavailable. There is a `.playwright-mcp/` dir in the repo.
- Session note: if an interactive login is unavoidable, the human can run it via the `! <command>` prefix - but per the execution contract, assume auth is already done and use non-interactive paths first.
</context>

<requirements>
For maximum efficiency, run independent checks in parallel; after each result, reflect before the next step.

1. **Pre-flight (fast, non-interactive):** confirm `npx convex env list` shows `TRAVELPAYOUTS_TOKEN`; confirm `vercel whoami`, `gh auth status`, and that the Vercel project is linked (`vercel link`/`.vercel/project.json`). If a token is missing, set it from `.env.local` (`npx convex env set TRAVELPAYOUTS_TOKEN "$TRAVELPAYOUTS_API_KEY"`).
2. **Deploy Convex to prod:** `npx convex deploy -y` (production). Ensure prod has the token env. Capture the prod Convex URL.
3. **Deploy the app to prod:** ensure Vercel prod env vars are set (`vercel env ls`; add any missing with `vercel env add ... production`, sourcing values from `.env.local`/Convex), then `vercel deploy --prod --yes`. Capture the production URL.
4. **Verify in prod with Playwright MCP** (fall back to `PLAYWRIGHT_BASE_URL=<prod-url> npm run test:e2e` only if MCP is unavailable). Walk the WHOLE flow against the prod URL and assert real data:
   - Landing → Start.
   - Wizard Step 1 with DEFAULTS (When=Flexible, no destination) → Step 2 → Surprise.
   - Generating → Results: assert ≥1 real card, a real price, real airline + hotel text, real `N nights`/date window, and assert the ABSENCE of any `−%` badge / strikethrough / "seats left" / fake countdown.
   - Open a card → Detail: assert real outbound/return dates, real breakdown lines (only real ones), real total.
   - Hand-off sheet opens and the CTA deep-links out (don't complete an external booking).
   - Run a second variation: a named month and a different Departure point; assert the dates/prices change consistently.
   - Capture screenshots of each screen as evidence.
5. **Fix-forward:** for every failure or any fabricated/empty/broken element observed in prod, fix the code on the branch, redeploy, and re-verify. Repeat until the whole flow is real and clean. (Common risks to check: server-side token not reaching Convex prod; CORS/SSR for the actions; empty Results when a route has no fares - must hide gracefully, not error.)
6. **Open the PR:** push `feat/travelpayouts-real-data` and open ONE PR into `main` via `gh pr create`. Body: what changed (real Travelpayouts flight+hotel data, real filters/dates, removed fabrications, honesty sweep), how it was verified in prod (with the prod URL + screenshots/log summary), and any residual limitations (e.g. hotel data sparse on some routes). End the PR body with the "Generated with Claude Code" line from CLAUDE.md.
</requirements>

<output>
- Production Convex + Vercel deployments live with secrets set.
- Any fix commits on `feat/travelpayouts-real-data`.
- One PR open against `main`.
- A short final report in your last message: prod URL, what was verified, screenshots captured, and any blocker encountered.
</output>

<verification>
- The prod URL loads and completes the full flow with real data (verified via Playwright MCP evidence).
- No fabricated/placeholder element appears anywhere in the prod walk-through.
- `gh pr view` shows the single open PR with the summary + verification evidence.
</verification>

<success_criteria>
- App is deployed to production with all secrets in place.
- Whole flow tested in prod via Playwright MCP and passing with real data; every screen tells the truth.
- Exactly one PR created; final report delivered. No step blocked on the user.
</success_criteria>
