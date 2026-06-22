<task>
Do a complete "never lie" honesty sweep across every screen and string in the app: anything still fabricated, simulated, or promising something the app can't deliver must be made real, hidden, or relabeled truthfully. Then update the docs to match reality. This is prompt 3 of 4. Continue on branch `feat/travelpayouts-real-data`.
</task>

<execution_contract>
NON-BLOCKING: never ask the user anything and never wait for input. Make every decision autonomously using the rules below and the conventions in CLAUDE.md/README.md. If a judgment call arises, prefer the most honest option (hide over fake) and note it in the commit message. Do not run AskUserQuestion. Do not pause the sequence.
</execution_contract>

<why_this_matters>
Prompts 401–402 made the core flow (wizard → results → detail → handoff) real. But "barrido completo / never lying" means the WHOLE app - landing copy, badges, ratings, countdowns, provider names, placeholders, microcopy, and docs - must contain zero claims that aren't backed by real data. A single fake "4 seats left" or "−34%" undermines the trust the rest of the work earned.
</why_this_matters>

<locked_decisions>
1. For every visible claim, exactly one of: (a) make it real (backed by API/DB), (b) hide it, or (c) relabel it to something true and clearly framed (e.g. "from" estimates explicitly disclosed). No fabricated specifics.
2. Hide-missing over fake-fallback, always.
3. Docs must describe the app as it actually behaves after this sweep.
</locked_decisions>

<context>
Read CLAUDE.md, README.md (has ADRs), BUILT-APP.md, and docs/ (docs/index.md, docs/wiki/*, docs/flujo-app-ui.md). The repo already values honesty - several files carry `TODO(live-data)` and "honest no-op" comments. Search the whole `src/` tree, not just the screens touched earlier.
</context>

<requirements>
1. **Inventory pass (think hard / thoroughly analyze).** Build a list of every on-screen claim and feature across all screens (`src/components/screens/*`, `src/components/*`, `src/app/*`, landing/marketing copy, `src/lib/data.ts` static strings). For each, classify real / hide / relabel. Specifically scrutinize:
   - Fabricated specifics: `−34%` / any discount, strikethrough "original" prices, `seats` ("X seats left"), `departsIn` countdowns, hardcoded `rating` values, "Best match"/"Great deal" badges, `slotHint` placeholders.
   - `PROVIDER = "Expedia"` vs. the actual Hotellook/Travelpayouts hand-off target - make the named provider match where the user is actually sent.
   - Landing `HOW_IT_WORKS` and any hero/marketing copy that promises capabilities (e.g. "best deal", "ready-to-book") - keep only what's true now.
   - Any remaining `TODO(live-data)` / "honest no-op" / "pure UX rhythm" comments - resolve them (the feature is now live) or, if still not live, ensure the related UI is hidden, not faked.
   - Image placeholders: real photos are fine; ensure no placeholder masquerades as real inventory.
2. **Apply the fixes.** Make real where a data source exists (reuse prompt-401 actions / `convex/trips.ts`), hide where it doesn't, relabel where a true generic statement is appropriate. Ratings/reviews: if not backed by real data, hide them rather than show invented numbers.
3. **Disclosures:** keep clearly-framed estimate language ("Prices shown are 'from' estimates · final price confirmed on the provider's site") only where it is accurate; remove it where prices are now exact.
4. **Docs sync:** update README ADRs, BUILT-APP.md, docs/index.md, and the relevant docs/wiki/* (e.g. prototipo-drift, roadmap, arquitectura-mvp) to describe the now-real data flow and the Travelpayouts integration. Remove stale "no-op/seed data" descriptions.
</requirements>

<output>
Modify whichever `src/` files contain fabricated claims (screens, components, `src/lib/data.ts`), plus docs: `README.md`, `BUILT-APP.md`, `docs/index.md`, and affected `docs/wiki/*`. Keep changes surgical and in the existing style.
</output>

<verification>
1. `npm run lint` and typecheck pass.
2. `grep -rinE "seats|departsIn|−[0-9]+%|line-through|Best match|Great deal|Expedia|TODO\\(live-data\\)|honest no-op|pure UX rhythm" src/` - every remaining hit is justified (real or intentionally honest) and you can say why.
3. Manual pass through every screen confirming nothing displayed is fabricated.
4. Commit on `feat/travelpayouts-real-data` (Co-Authored-By per CLAUDE.md). No PR yet.
</verification>

<success_criteria>
- No screen displays a fabricated number, badge, countdown, rating, or capability claim.
- Provider names and disclosures match what actually happens.
- Docs describe the real, live-data behavior.
- Lint/typecheck clean; committed on the shared branch.
</success_criteria>
