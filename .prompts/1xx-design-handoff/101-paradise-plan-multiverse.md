<role>
You are a senior product designer and front-end engineer. You design distinctive, production-grade interfaces and you avoid generic "AI slop" aesthetics. If a frontend-design capability or skill is available to you, use it. Treat this as generation of a real product, not a design critique.
</role>

<objective>
Build ONE interactive, runnable web prototype of a travel app called "Paradise Plan", and make it a design-and-flow exploration tool with TWO independent, switchable verticals:

1. DESIGN (look & feel) — propose 4 genuinely distinct visual identities.
2. EXPERIENCE (flow paradigm) — propose 4 genuinely distinct interaction flows over the same product.

The user must be able to select a Design and an Experience independently and see both at once (a 4 x 4 matrix of combinations, 16 coherent states). On top of that, expose the design as editable design-token variables in a live panel, so changing the variables changes the design in real time.

End goal: let the founder open a single file, flip between visual directions and flow paradigms side by side, tweak the underlying tokens, and decide which design AND which experience to commit to before building the real MVP. Success is the founder thinking "I'd actually use this" and being able to point at exactly the design and the flow they want.
</objective>

<inputs>
Read these attached files BEFORE designing. They are the source of truth for WHAT the product is and WHAT screens/steps exist. Read them first, then plan, then build.

- `flow/flujo-app-ui.md` — THE canonical app flow (screens, steps, the 3-step preferences wizard, results, package detail, navigation). This is the backbone every Experience must cover. (Written in Spanish; the product/UI you build is in English.)
- `flow/ParadisePlanMobile.pdf` — the original mobile screens of that flow, as a visual reference of the existing content and structure.
- `assets/screens/` — the original 2019 desktop UI mockups (PNG). Use them ONLY to understand the existing flow and content. Do NOT reproduce them: they are dated. Your 4 designs must be fresh and modern.
- `assets/Features-sitemap.jpg` — the feature map / sitemap of the original product.
- `assets/Concept-map-journey.jpg` — the 5-stage user journey.
- `context/la-idea-de-negocio.md` — the business idea: the "why", the user, the positioning. Sets the tone (premium, editorial, aspirational). (Spanish.)
- `context/prototipo-drift.md` and `context/drift-design-prompt.md` — the prior design direction and constraints (anti-AI-slop notes, affiliate CTAs, the "what do I do there?" curation block, urgency without dark patterns). Strong reference for tone and craft. (Spanish.)
- `context/Presentation.md` — original problem statement, user needs, and personas.

For maximum efficiency, when you need to read several of these, read them in parallel rather than one at a time. After reading, briefly reflect on what you learned before you start building.
</inputs>

<product_context>
Paradise Plan is a budget-and-preferences travel discovery app. The user does NOT start from a destination. They start from budget, dates flexibility, and vibe, and the app returns a curated "surprise" trip package (flight + hotel + activity, and other verticals like cruises and experiences) that they can review and book.

Core user: a flexible traveler with mid-to-high spending power and no fixed calendar (DINK couples, singles with income, nomads, active retirees). Their line is literally "I want to travel. I don't know where or when. Show me the best trip." They value discovery over directed search, and "accessible luxury" unlocked by their flexibility.

Business model (current phase): AFFILIATE. The app does NOT take payments and does NOT book internally. It redirects to the provider (airline, cruise line, hotel, experience platform) with an affiliate link and earns commission. This is a hard constraint on the flow ending (see <flow_ending>).
</product_context>

<core_concept>
This prototype is built around two ORTHOGONAL axes the founder will evaluate separately:

AXIS A — DESIGN (4 options): the visual identity / look & feel. Driven entirely by a central set of design tokens (CSS variables or an equivalent config object). Each design is a named preset = one complete set of token values.

AXIS B — EXPERIENCE (4 options): the flow paradigm / interaction model. Each experience covers the same backbone job (preferences in, surprise package out, affiliate hand-off) but through a different interaction model.

Hard requirement: the two axes are INDEPENDENT. Any Design can render any Experience. Switching Design must NOT change the flow; switching Experience must NOT change the visual identity. Both selectors are always visible in a persistent control bar so the founder "sees both" at all times.

Also required: a live DESIGN-TOKEN PANEL. The active Design's tokens are editable in real time (the founder changes a variable, the whole app re-themes instantly). This is the literal meaning of "use the variables to change the design."
</core_concept>

<the_four_designs>
Propose and implement 4 genuinely distinct visual directions. YOU choose them; do not ask the user. Make them feel like 4 different companies, not 4 color swaps. For each, briefly justify the direction in a short on-screen note or a DESIGN-NOTES section.

Spread them across the design space (these are seeds, refine or replace with better ideas):
- An editorial, magazine-grade luxury direction (big evocative imagery, expressive type, generous whitespace).
- A bold, high-contrast "deals ticker" direction with energy and urgency (the modern heir to the Vacations To Go "90-Day Ticker").
- A soft, calm, modern-consumer direction (rounded, friendly, airy, approachable).
- A dark, premium, cinematic direction (rich darks, jewel accents, focused spotlighting).

Each design must define a FULL token set, not just colors. Avoid the generic AI aesthetic: no identical gray cards, no default purple gradients, no decorative emoji sprinkled through the copy. Aim for deliberate hierarchy, intentional contrast, and subtle micro-interactions.
</the_four_designs>

<the_four_experiences>
Propose and implement 4 genuinely distinct flow paradigms. YOU choose them; do not ask the user. Every experience must cover the shared backbone in <shared_backbone>, but the interaction model should feel materially different. Seeds (refine or replace):

1. Guided Wizard — the classic step-by-step preferences wizard (closest to the documented flow): Step 1 trip data, Step 2 preference filters, Step 3 summary, then "Surprise Me", results, detail, hand-off.
2. Conversational "Surprise Me" — a chat / prompt-led capture where the user types or picks a mood, budget, and days, and the app answers with curated options inline. The form becomes a conversation.
3. Deal Feed — a swipeable / scrollable card feed of flexibility deals as the primary surface (filters live as an overlay). Discovery-first, browse before you specify.
4. Map / Explorer — a map or board-driven explorer where budget + vibe paint surprise destinations the user explores spatially.

Briefly justify each experience on-screen or in DESIGN-NOTES. The point is to compare flows, so the differences must be real (different first screen, different way to express preferences, different way results appear), not cosmetic.
</the_four_experiences>

<shared_backbone>
Regardless of paradigm, every Experience must let the user complete this happy path end to end, interactively:

1. Entry / landing with the value proposition ("Plan your paradise vacation today" / budget-and-preferences, not destination).
2. Preference capture: departure point, dates flexibility, number of travelers, budget range, package types (Flight / Hotel / Activity / Car / Cruise / Boat), vacation type (family / friends / adventure / discovery / lone wolf), traveler type, and vibe filters (Beach, Nightlife, Nature, Luxury, Hidden, Cruises, etc.) plus weather preference.
3. A "Surprise" generation moment that produces results.
4. Results: multiple package options with a real, fully-populated first option (use the Cancun example from the flow doc), reviews/stars, and a selection summary.
5. Package detail / personalization: flight + hotel + activity, each editable, with a price breakdown and total.
6. Affiliate hand-off (see <flow_ending>).

Preserve user state across switching: if the founder fills in preferences, then switches Experience or Design, their selections should persist (single shared state model). Use realistic in-memory state; no real network calls.
</shared_backbone>

<flow_ending>
All 4 experiences end in the AFFILIATE model. This is non-negotiable because it matches the real business and the Mexico legal constraints for an affiliate (you cannot present a final price or capture payment yourself):

- The final CTA is always "Reserve with [provider]" (a redirect-style button that does not need to navigate anywhere real).
- Prices are shown as "from" / approximate, with a subtle note that the final price is confirmed on the provider's site.
- NO internal checkout, NO payment capture, NO card fields.
- Experiences MAY differ in the pre-booking MOMENT (e.g. a polished review summary, a save-to-wishlist, a share-itinerary, honest scarcity like "departs in 18 days / few seats left") but none of them takes a payment.
</flow_ending>

<design_tokens>
Theming is variable-driven and is the single source of styling truth.

- Define a central token system (CSS custom properties under theme classes/attributes, or a JS tokens object that writes CSS variables). Each of the 4 Designs is a named preset = a complete set of token values.
- Token categories to include (at minimum): color (background, surface/elevated, primary/accent, secondary, text, muted, border, success/urgency), typography (font families for display and body, type scale, weights, line-height), spacing/density scale, border-radius scale, shadow/elevation, and an imagery treatment (e.g. overlay, saturation, duotone).
- The live DESIGN-TOKEN PANEL lets the user edit the active Design's tokens (color pickers, font selectors, sliders for radius/spacing/density) and see the change apply instantly across whatever Experience is active. Include a "reset to preset" control.
- Because design = tokens, swapping the Design preset is just swapping the variable set; nothing in the flow logic should change.
</design_tokens>

<interaction_requirements>
- Fully interactive and navigable: every Experience's happy path must be clickable end to end. No dead screens on the main path.
- Persistent control bar always visible with: a Design selector (4), an Experience selector (4), and a toggle to open the design-token panel. The founder must be able to change one axis without touching the other.
- Responsive and good on mobile (the founder reviews from a phone). Mobile-first where it matters.
- Subtle, tasteful motion and micro-interactions; no gratuitous animation.
- Realistic, aspirational sample data, hardcoded. Multi-vertical: cruises and packages should feel like protagonists, plus experiences, hotels, and inspiration flights. Mexicanize some examples (departures from CDMX), use destinations like Mediterranean/Caribbean cruises, Lisbon or Tokyo flight+hotel, a gastronomic experience in Oaxaca, and the Cancun example from the flow doc.
- Keep the "what do I do there?" curation idea visible somewhere in the detail view (narrative + suggested activities) — it is the product's real differentiator.
</interaction_requirements>

<copy_and_language>
- ALL user-facing copy is in ENGLISH (the original mockups are in English: "GET STARTED", "Surprise Me", About Us, Contact Us). The reference docs are in Spanish; translate intent, do not copy Spanish strings into the UI.
- Do NOT use em dashes in UI copy. The founder considers them a tell of AI-generated text. Use commas, periods, or parentheses instead.
- Tone: aspirational and confident, not corporate, not cheesy.
</copy_and_language>

<tech>
- Choose the stack YOU judge best for a high-fidelity, interactive, self-contained design prototype (use your frontend-design judgment per the Claude Code docs). A single self-contained HTML file with CSS custom properties as the tokens, or a single-file React app with a tokens object, are both good fits; pick one and justify it briefly.
- Hard requirements regardless of stack: (a) the prototype runs with minimal setup and is easy to open and share; (b) design is driven by the token variables described above; (c) no real network calls (data is hardcoded); (d) no localStorage/sessionStorage dependency for core behavior (use in-memory state).
- If you scaffold a project, keep it minimal and include a one-line run instruction in the README/output.
</tech>

<output>
Create the prototype in this repository under `./prototype/`:
- The runnable prototype file(s) (e.g. `./prototype/index.html` or a minimal app).
- `./prototype/DESIGN-NOTES.md` — a short rationale: the 4 designs (name + 1-2 lines each), the 4 experiences (name + 1-2 lines each), the token system overview, and how to run it.

Read any `CLAUDE.md` in the repo first and follow its conventions. Tell the user exactly how to open/run the result when done.
</output>

<process>
1. Read the input files in <inputs> (in parallel), and reflect on the flow, tone, and constraints.
2. Decide and briefly state your 4 Designs and your 4 Experiences before building (1-2 lines each), then build.
3. Implement the shared state model and the token system first, then the control bar (both selectors + token panel), then each Experience over the shared backbone, then theme all 4 Designs.
4. Populate realistic multi-vertical sample data, including the Cancun example.
5. Verify against <verification>, fix gaps, then report how to run it.

Go beyond the basics. This is the artifact that decides the product's design and flow direction, so make all 16 combinations feel intentional and polished, not like a template with the colors changed.
</process>

<verification>
Before declaring done, confirm:
- Both axes work INDEPENDENTLY: I can hold a Design fixed and cycle all 4 Experiences, and hold an Experience fixed and cycle all 4 Designs. All 16 states render coherently.
- The live token panel re-themes the app in real time and has a reset-to-preset.
- All 4 Experiences are genuinely different paradigms (different entry, different preference capture, different results presentation), and each completes the happy path end to end.
- Every flow ends in an affiliate "Reserve with [provider]" CTA, prices are "from" with a confirm-on-provider note, and there is no checkout or payment capture anywhere.
- User selections persist when switching Design or Experience.
- Copy is in English with no em dashes; no generic-AI-slop visuals (no identical gray cards, no default purple gradients, no decorative emoji in copy).
- Responsive on mobile.
</verification>

<success_criteria>
The founder opens one file, sees both a Design selector and an Experience selector, flips between them freely, tweaks the design tokens live, walks any of the 4 flows to an affiliate hand-off, and can confidently say "this design + this experience is the one." The prototype communicates the business thesis (accessible luxury through flexibility, multi-vertical, affiliate) without extra explanation.
</success_criteria>
