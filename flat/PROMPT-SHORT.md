# Paradise Plan — design + flow exploration prototype (short brief)

You are a senior product designer and front-end engineer. Use your frontend-design judgment and avoid generic "AI slop". Build a real, interactive prototype, not a mockup.

## What the product is
Paradise Plan is a travel app where the user does NOT start from a destination. They start from budget, date flexibility, and vibe, and the app returns a curated "surprise" trip package (flight + hotel + activity, plus cruises and experiences) to review and book. Business model is AFFILIATE: it never takes payment, it redirects to the provider.

## What to build: ONE app, TWO independent verticals (both visible and switchable)
- **Design** (look & feel): propose **4 distinct visual identities**, each defined entirely by **design-token variables**.
- **Experience** (flow paradigm): propose **4 genuinely different flows** over the same product (e.g. guided wizard, conversational "Surprise Me", swipeable deal feed, map/explorer).

The two axes are independent: any Design renders any Experience (16 combinations). Keep both selectors in a persistent control bar so they are always visible, and add a **live token panel** so editing a variable re-themes the app in real time. User selections must persist when switching Design or Experience.

## Shared backbone (every Experience must cover it, end to end and clickable)
Landing → preference capture (departure, dates flexibility, travelers, budget, package types, vacation type, vibe/weather filters) → a "Surprise" generation moment → results with options (use the Cancun example) and reviews → package detail (flight + hotel + activity, editable, with price breakdown) → **affiliate hand-off**.

## Hard rules
- Ending is always affiliate: final CTA "Reserve with [provider]", prices shown as "from" with a "final price confirmed on provider's site" note. **No checkout, no payment capture.**
- UI copy in **English**. **No em dashes** in copy. No identical gray cards, no default purple gradients, no decorative emoji.
- Responsive (good on mobile). Hardcoded data, no real network calls, no localStorage for core state.
- Pick the stack you judge best (a single self-contained HTML with CSS variables, or a single-file React with a tokens object). It must run with minimal setup.

## How to navigate the attached bundle (read first, in parallel)
- `flow/flujo-app-ui.md` — the canonical app flow (Spanish; build the UI in English). This is the backbone.
- `flow/ParadisePlanMobile.pdf` and `assets/screens/` — original screens. Use them to understand flow and content only; do NOT copy the dated 2019 look.
- `context/la-idea-de-negocio.md`, `context/prototipo-drift.md`, `context/drift-design-prompt.md`, `context/Presentation.md` — business idea, tone, prior design direction and constraints, personas.

## Output
Create the prototype under `./prototype/` plus a short `./prototype/DESIGN-NOTES.md` listing your 4 designs, your 4 experiences, the token system, and how to run it. State your 4 designs and 4 experiences (1-2 lines each) before building. When done, tell me how to open it.

Goal: I open one file, flip between the 4 designs and the 4 flows independently, tweak the tokens live, walk any flow to the affiliate hand-off, and decide which design + which experience to commit to.
