#!/usr/bin/env bash
#
# Regenerate the self-contained Paradise Plan handoff bundle from canonical sources.
#
# The bundle (paradise-plan-handoff/) is a build artifact — it is gitignored and
# must NOT be edited by hand. Edit the canonical source instead, then re-run this:
#
#   docs/        → business / research / flow content (the Obsidian vault)
#   design/      → original 2019 source mockups, presentation, PDFs
#   .prompts/    → the handoff prompts (PROMPT.md / PROMPT-SHORT.md)
#   handoff-build/bundle-readme.md → the bundle's own "how to use" README
#
# Usage:  ./handoff-build/build.sh   (run from anywhere)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/handoff-build/paradise-plan-handoff"

rm -rf "$OUT"
mkdir -p "$OUT/context" "$OUT/flow" "$OUT/assets/screens"

# --- prompts (canonical: .prompts/) ---
cp "$ROOT/.prompts/1xx-design-handoff/101-paradise-plan-multiverse.md"       "$OUT/PROMPT.md"
cp "$ROOT/.prompts/1xx-design-handoff/102-paradise-plan-multiverse-short.md" "$OUT/PROMPT-SHORT.md"

# --- bundle instructions (canonical: handoff-build/bundle-readme.md) ---
cp "$ROOT/handoff-build/bundle-readme.md" "$OUT/README.md"

# --- context (canonical: docs/, design/project-base/) ---
cp "$ROOT/docs/la-idea-de-negocio.md"                    "$OUT/context/la-idea-de-negocio.md"
cp "$ROOT/docs/wiki/prototipo-drift.md"                  "$OUT/context/prototipo-drift.md"
cp "$ROOT/docs/sources/2026-06-prompt-interfaz-drift.md" "$OUT/context/drift-design-prompt.md"
cp "$ROOT/design/project-base/Presentation.md"           "$OUT/context/Presentation.md"

# --- flow (canonical: docs/, design/project-base/) ---
cp "$ROOT/docs/flujo-app-ui.md"                       "$OUT/flow/flujo-app-ui.md"
cp "$ROOT/design/project-base/ParadisePlanMobile.pdf" "$OUT/flow/ParadisePlanMobile.pdf"

# --- assets (canonical: design/project-base/) ---
cp "$ROOT/design/project-base/Features.jpg"                            "$OUT/assets/Features-sitemap.jpg"
cp "$ROOT/design/project-base/Concept map. PLanning with paradise.jpg" "$OUT/assets/Concept-map-journey.jpg"
cp "$ROOT/design/project-base/PP/"*.png                                "$OUT/assets/screens/"

echo "Built handoff bundle → $OUT"
echo "  $(find "$OUT" -type f | wc -l | tr -d ' ') files"
