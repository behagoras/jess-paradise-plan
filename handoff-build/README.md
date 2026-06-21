# handoff-build

Generates the **Paradise Plan handoff bundle** — a self-contained package you can
drop into a fresh Claude Code session to build the prototype.

The bundle is a **build artifact**. It is not stored in git; it is regenerated
from canonical sources so the copies can never drift.

## Build it

```bash
./handoff-build/build.sh
```

This writes `handoff-build/paradise-plan-handoff/` (gitignored). Zip and ship it,
or point a fresh session at it. See `bundle-readme.md` for how the bundle is used.

## Where the content actually lives (edit here, then rebuild)

| Bundle file | Canonical source |
| --- | --- |
| `PROMPT.md`, `PROMPT-SHORT.md` | `.prompts/1xx-design-handoff/` |
| `README.md` | `handoff-build/bundle-readme.md` |
| `context/la-idea-de-negocio.md` | `docs/la-idea-de-negocio.md` |
| `context/prototipo-drift.md` | `docs/wiki/prototipo-drift.md` |
| `context/drift-design-prompt.md` | `docs/sources/2026-06-prompt-interfaz-drift.md` |
| `context/Presentation.md` | `design/project-base/Presentation.md` |
| `flow/flujo-app-ui.md` | `docs/flujo-app-ui.md` |
| `flow/ParadisePlanMobile.pdf` | `design/project-base/ParadisePlanMobile.pdf` |
| `assets/screens/*.png` | `design/project-base/PP/` |
| `assets/Features-sitemap.jpg` | `design/project-base/Features.jpg` |
| `assets/Concept-map-journey.jpg` | `design/project-base/Concept map. PLanning with paradise.jpg` |

Never edit files under `paradise-plan-handoff/` directly — they are overwritten on
every build.
