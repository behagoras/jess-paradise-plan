<objective>
Reload the current project context after substantial UI and documentation changes, then run an adversarial research workflow to identify the highest-leverage improvements.

The end goal is to give the user a rigorous, actionable review of what should improve next in the UI and documentation. Do not rely on prior memory of the project. Treat the repository as changed and re-read the relevant code, docs, and generated project intelligence from scratch.
</objective>

<context>
You are working in the project root.

First read `./CLAUDE.md` if it exists, then inspect the repository conventions, current git state, and recent changes.

The user specifically wants:
1. The updated UI and refactored documentation reloaded and reviewed.
2. Graphify loaded and used for codebase/documentation context.
3. A real Claude Code `/workflow` of adversarial investigations focused on what could be improved.
4. The user's existing answers and product ideas incorporated before producing findings.
5. Two polished HTML deliverables inspired by these references:
   - `https://www.reddit.com/r/ClaudeAI/comments/1t8aecu/the_unreasonable_effectiveness_of_html_when_using/`
   - `https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html`

Use the HTML approach because dense visual reports can communicate product, UX, documentation, and architecture findings more effectively than plain text. The HTML should be self-contained, easy to scan, and useful as a decision artifact.
</context>

<claude_execution_instructions>
This prompt is intended for Claude Code.

Model and delegation rules:
1. The main thread should use Opus.
2. Create and coordinate a `/workflow` for the adversarial investigations.
3. Use Sonnet for subagents by default.
4. If a Sonnet subagent returns a shallow, generic, poorly evidenced, internally inconsistent, or otherwise low-quality response, escalate that investigation to Opus-medium and use the stronger result.
5. Do not let model orchestration replace evidence. Every major claim must still be checked against local files, rendered UI behavior, Graphify output, or command output.
6. The prompt source may live at `.prompts/3xx-ui/302-adversarial-ui-audit.md` or under `.prompts/3xx-ui/completed/302-adversarial-ui-audit.md`. It does not matter that the original prompt is completed; use the same audit intent and proceed.
</claude_execution_instructions>

<initial_questions>
The user has already answered the required pre-finding questions. Use these answers as authoritative input and do not ask them again unless a blocker prevents analysis:

1. Intended audience for the UI and docs: the user themself, as the programmer/maintainer.
2. Screens or user journeys to scrutinize: all flows and all docs.
3. Improvement dimension that matters most right now: usability.
4. Known concern: the experience feels long.
5. Recommendation style: ideas to implement, including both quick wins and stronger product directions when useful.

Additional product ideas to consider as input, not implementation commands:
1. In filters, add "days you want to go."
2. Filters should be optional.
3. Favorite feature for trips.
4. Saved filters.
5. Notification when a new trip appears.
6. Receive emails with destinations.
7. Discovery algorithm, StumbleUpon-style.
8. Research AI experience.
</initial_questions>

<research_workflow>
Create a `/workflow` with adversarial investigations.

Use Sonnet subagents for the independent investigation tracks. If `/workflow` is unavailable in the current Claude Code environment, explicitly say that, then emulate the workflow manually with separate, clearly labeled passes. If any Sonnet result is weak, repeat that investigation with Opus-medium before synthesizing.

For maximum efficiency, whenever you need to perform multiple independent reads or searches, invoke tools in parallel rather than sequentially.

Required investigation tracks:
1. UI reality check:
   - Inspect the current UI implementation, routes, components, styles, layout systems, and visual patterns.
   - If the app can be run locally, start the dev server and inspect the actual UI in a browser.
   - Capture screenshots or use browser inspection when possible.
   - Look for hierarchy issues, inconsistent interaction patterns, cramped layouts, unclear affordances, broken responsive states, misleading empty/loading/error states, and places where the UI no longer matches the product intent.

2. Documentation reality check:
   - Re-read the refactored documentation, including README files, planning docs, specs, roadmap docs, and any docs referenced by `CLAUDE.md`.
   - Compare docs against the current UI and code behavior.
   - Look for stale claims, missing setup steps, unclear architecture explanations, duplicated concepts, broken narrative flow, and docs that over-explain while failing to answer practical questions.

3. UX/docs mismatch pass:
   - Identify where the UI teaches one mental model and the docs teach another.
   - Flag naming mismatches, outdated screenshots/descriptions, inconsistent terminology, and missing explanation for newly introduced UI flows.

4. Adversarial user pass:
   - Assume the product is being evaluated by a skeptical first-time user.
   - Identify moments of confusion, distrust, friction, or cognitive overload.
   - Prioritize findings that could block adoption or cause users to abandon the flow.

5. Adversarial maintainer pass:
   - Assume a new maintainer must change the UI or docs next week.
   - Identify unclear ownership, brittle component boundaries, missing conventions, hard-coded assumptions, and documentation gaps that would slow safe iteration.

6. Opportunity synthesis:
   - Convert the strongest findings into concrete improvements.
   - Separate quick wins from deeper product/design/system improvements.
   - Include tradeoffs and why each recommendation matters.
</research_workflow>

<graphify_requirements>
Graphify is required for this task. Read it, update it, and use it as project intelligence.

1. Read the local Graphify skill/instructions before running commands so you follow the repo's installed workflow:
   - `./.codex/skills/graphify/SKILL.md`
2. Inspect the current Graphify state before updating:
   - Check whether `./graphify-out/graph.json` exists.
   - If present, read or inspect `./graphify-out/GRAPH_REPORT.md`, `./graphify-out/graph.json`, and any available Graphify metadata enough to understand the existing graph's coverage and age.
   - Note whether the graph appears stale relative to the current `git status`, recent UI changes, or documentation refactor.
3. Update Graphify before relying on its answers:
   - Prefer `/graphify . --mode deep --update`.
   - If no graph exists, run `/graphify . --mode deep`.
   - If slash commands are unavailable, use the local Graphify CLI/instructions from `./.codex/skills/graphify/SKILL.md` to perform the equivalent update or rebuild.
   - If the update fails, document the exact limitation and continue with manual repository analysis.
4. After the update or rebuild, query the refreshed graph before broad manual exploration. Ask questions such as:
   - "What are the major UI, documentation, and planning communities in this repository?"
   - "Which files connect the UI implementation to documentation or specs?"
   - "What concepts appear central to the current product experience?"
   - "Which nodes or files look most central to recent UI and documentation changes?"
   - "Where does the graph show weak or missing connections between docs, specs, and UI implementation?"
5. Use Graphify findings as context, not as unquestioned truth. Cross-check important claims against actual files.
6. Include a short "Graphify evidence" section in both HTML reports covering:
   - whether Graphify was read and updated,
   - what graph queries were used,
   - which graph insights materially influenced findings,
   - any Graphify limitations or stale areas that remain.
</graphify_requirements>

<html_deliverables>
Create two self-contained HTML reports. They must be useful when opened directly in a browser with no server.

Deliverable 1:
Save to `./artifacts/ui-docs-improvement-spec.html`.

Purpose:
Create a polished improvement spec that helps the user decide what to build or refine next.

Include:
1. Executive summary with the 5-8 highest-leverage improvements.
2. Current-state map of UI, docs, and product narrative.
3. Prioritized improvement backlog grouped by impact and effort.
4. UI recommendations with concrete before/after intent, not generic advice.
5. Documentation recommendations with concrete restructure or wording guidance.
6. Cross-links between UI issues and doc issues.
7. Decision table showing quick wins, strategic bets, dependencies, and risks.
8. A concise implementation roadmap.

Deliverable 2:
Save to `./artifacts/adversarial-ux-docs-audit.html`.

Purpose:
Create a rigorous adversarial audit that exposes weak spots, contradictions, and uncomfortable questions.

Include:
1. Red-team summary of the strongest critiques.
2. Failure modes by user journey.
3. Claims that the docs or UI make implicitly, and whether the code/product supports them.
4. Evidence table with file references, screenshots if available, and confidence levels.
5. "What would break trust?" section.
6. "What would confuse a maintainer?" section.
7. Unanswered questions for the user, embedded in the HTML as a dedicated section.
8. A ranked risk register with severity, likelihood, evidence, and recommended next action.

HTML quality requirements:
1. Use semantic HTML, CSS, and minimal JavaScript only when it adds real value.
2. Make both reports responsive and readable on laptop and mobile widths.
3. Use visual structure: tabs, filters, collapsible evidence, priority badges, side-by-side comparisons, or simple diagrams where helpful.
4. Do not create decorative filler. Every visual element should help comprehension.
5. Include file references as text paths with line numbers where available.
6. Include a generated timestamp and a short methodology note.
7. Keep assets inline or avoid external assets so the files are portable.
</html_deliverables>

<analysis_requirements>
Thoroughly analyze the repository and consider multiple perspectives before writing recommendations.

Use these local evidence sources where available:
1. `git status --short`
2. `git diff --stat`
3. `git diff`
4. `git log --oneline -n 20`
5. `package.json` and related config files
6. top-level docs and planning docs
7. UI source files, routes, components, styles, and design-system files
8. `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, or Graphify query output

Do not stop at surface-level comments like "improve consistency" or "make docs clearer." Every major recommendation must include:
1. The specific problem.
2. Why it matters.
3. Evidence from code, UI, docs, or Graphify.
4. A concrete proposed improvement.
5. Priority and effort estimate.
6. Residual risk or tradeoff.
</analysis_requirements>

<constraints>
Do not modify product code or documentation unless the user explicitly asks for implementation after reviewing the reports. This task is an audit and improvement-spec task.

Do not assume the current UI works because tests pass. Inspect real rendered behavior when practical.

Do not assume the documentation is accurate because it is newly refactored. Compare it against the current code and UI.

Do not produce only Markdown. The required primary outputs are the two HTML files.

If you cannot run the app, Graphify, browser inspection, or a command, continue with the available evidence and document the limitation clearly in both HTML reports.
</constraints>

<verification>
Before declaring complete:
1. Confirm both HTML files exist:
   - `./artifacts/ui-docs-improvement-spec.html`
   - `./artifacts/adversarial-ux-docs-audit.html`
2. Open or inspect both files enough to verify they contain real findings, not placeholder sections.
3. Verify the reports reference concrete local evidence from code/docs/git/Graphify.
4. If a dev server was used, stop any server process you started unless the user asked to keep it running.
5. Provide the user with the file paths and a concise summary of the top findings.
</verification>

<success_criteria>
The task is complete when:
1. The user's targeted answers and product ideas were incorporated before findings were produced.
2. Graphify was loaded, queried, updated, or explicitly documented as unavailable.
3. A structured adversarial workflow was run or faithfully emulated.
4. Two self-contained HTML reports were created in `./artifacts/`.
5. The reports contain specific, evidence-backed recommendations for improving the updated UI and refactored documentation.
6. The final response summarizes the highest-priority improvements and links to the generated HTML files.
</success_criteria>
