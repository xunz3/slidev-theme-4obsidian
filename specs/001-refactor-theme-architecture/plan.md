# Implementation Plan: Refactor Theme Architecture

**Branch**: `001-refactor-theme-architecture` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-refactor-theme-architecture/spec.md`

## Summary

Refactor the published Slidev theme so each slide's resolved preset is the sole authority for
tokens, canvas styling, content styling, and branding, independent of the deck preset. The
implementation will centralize presentation option definitions and first-valid resolution in a
typed module, make the shared `SlideFrame` emit and own the resolved `.slidev-layout` canvas plus
its inner frame, delegate visual-only brand artwork to one branding component, and split preset
CSS into resolved-canvas-scoped files. Conservative UCAS SVG optimization and a Node/Playwright
release-gate harness will enforce
configuration compatibility, the 3 × 3 preset matrix, representative light/dark visuals,
accessibility and interaction behavior, asset budgets, layout stability, and production-output
budgets without adding a runtime dependency.

## Technical Context

**Language/Version**: TypeScript 5.9 through the Slidev toolchain, Vue 3 single-file components,
CSS, Markdown, and Node.js ESM scripts on the declared Node.js `>=20.19.0` runtime

**Primary Dependencies**: `@slidev/client`, `@slidev/types`, and `@slidev/cli` 52.15.2;
`slidev-pane`; existing `playwright-chromium` 1.61.1 for browser checks; pinned `axe-core` as
the only new development-only test dependency. A repository-owned Node script performs exact
metadata removal, so no SVG optimizer or image-diff dependency is added.

**Storage**: N/A; versioned Vue/CSS/TypeScript/Markdown/static assets plus ignored production
build and screenshot outputs

**Testing**: Slidev production builds, Node.js built-in test/assertion scripts,
Playwright Chromium DOM/keyboard/layout-shift/screenshot checks, static CSS/config/asset
contract checks, and recorded before/after byte measurements

**Target Platform**: Static Slidev presentations in Chromium-class modern browsers at the
canonical 16:9 canvas, including standalone decks and decks containing `obsidian-slidev`
semantic markup

**Project Type**: Published frontend theme/library with reusable layouts, components, styles,
configuration, and bundled brand assets

**Performance Goals**:

- Reduce `assets/UCAS/emblem.svg` plus
  `assets/UCAS/emblem-name-bilingual-hz.svg` from 2,124,415 bytes to no more than
  424,883 bytes combined, with every shipped brand asset no larger than 256,000 bytes.
- Keep total raw file bytes at or below 105% of fresh pre-refactor baselines:
  3,394,174 bytes for `dist/` (example deck), 4,534,603 bytes for
  `fixtures/dist-default/`, and 3,447,080 bytes for `fixtures/dist-fixture/`.
- Record zero layout-shift entries attributable to theme-owned branding after initial
  navigation begins, and no geometry change after brand image decode.
- Keep the complete blocking quality suite below five minutes on the maintained environment.

**Constraints**: Preserve all current layout names, valid configuration and frontmatter keys,
layout props, `--presentation-*` tokens, `.slide-frame`/`.slide-layout-*` classes, ordinary
Slidev Markdown, and `.obsidian-slidev-*` semantics; keep Obsidian conversion out of the theme;
use one shared render tree; add no runtime dependency; preserve brand geometry, colors,
transparency, wording, proportions, and licensing

**Scale/Scope**: Three presets, nine deck-preset/slide-preset pairs, two color modes, three
density modes, three chrome modes, seven presentation options, eleven layouts, standalone and
generated-markup decks, and all currently shipped UCAS/ICT brand assets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-Research Gate

- **Maintainable Preset Architecture — PASS**: The affected surfaces are
  `components/SlideFrame.vue`, all shared `layouts/*.vue`, `setup/main.ts`,
  `styles/tokens.css`, `styles/base.css`, `styles/layouts.css`,
  `styles/obsidian.css`, and `styles/presets.css`. The design retains every shared layout and
  one frame, adds one pure configuration module and one visual-only branding child, and leaves
  conversion logic outside the repository.
- **Tests Are Release Gates — PASS**: Existing build coverage remains `pnpm run build`,
  `build:default`, `build:ucas`, `build:ict`, and `build:fixture`. A new
  `fixtures/preset-isolation.md` plus Node/Playwright checks cover all nine preset pairs,
  invalid inputs, textual booleans, shared content, representative layouts, light/dark 16:9
  screenshots, contrast, overflow, keyboard navigation, focus visibility, and TOC behavior.
  `fixtures/obsidian-protocol.md` remains mandatory.
- **Consistent Presentation Experience — PASS**: Contracts preserve
  `themeConfig.presentation`, documented slide overrides and compatibility aliases, shared
  semantic classes, all layouts, and bilingual typography. The resolver uses first-valid
  precedence, so malformed local input cannot suppress a valid deck value. No migration is
  needed for valid decks.
- **Measured Projection Performance — PASS**: Fresh baseline builds contain 3,232,547 bytes
  (`dist/`), 4,318,670 bytes (`fixtures/dist-default/`), and 3,282,934 bytes
  (`fixtures/dist-fixture/`). The two required oversized SVGs total 2,124,415 bytes. Checks use
  raw file-byte sums, per-asset byte limits, browser-rendered brand comparisons, and
  Playwright layout-shift/geometry observations. The metadata-only cleanup is expected to
  reduce that pair to 249,795 bytes without changing paths, coordinates, IDs, dimensions, or
  decoded pixels. No new asset may exceed 250 KiB.

### Post-Design Re-evaluation

- **Maintainable Preset Architecture — PASS**: `SlideFrame` owns the existing outer
  `.slidev-layout` and inner `.slide-frame` pair and binds both from one resolved state.
  Preset rules anchor to `data-presentation-preset` on that local canvas; the document-root
  deck value never selects into a slide. Preset CSS and branding own no layout, metadata,
  navigation, or conversion behavior.
- **Tests Are Release Gates — PASS**: The quality-gate contract defines deterministic commands,
  inputs, evidence, failure output, and skip-record requirements. The protocol fixture and all
  affected builds are blocking.
- **Consistent Presentation Experience — PASS**: The configuration and frame contracts define
  accepted values, defaults, aliases, precedence, canvas ownership, accessibility behavior, and
  semantic compatibility without expanding the public option surface.
- **Measured Projection Performance — PASS**: The data model records immutable baselines and
  before/after measurements; the quickstart validates the exact 80%, 250 KiB, 5%, layout-shift,
  and five-minute thresholds.

No constitutional exception or complexity waiver is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-refactor-theme-architecture/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── presentation-configuration.md
│   ├── preset-frame.md
│   └── quality-gates.md
└── tasks.md                         # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
assets/
├── ICT/
└── UCAS/                            # Conservatively optimized, visually verified artwork

components/
├── PresetBranding.vue               # Visual-only brand assets and decorative markup
└── SlideFrame.vue                    # Owns resolved layout canvas, frame, metadata, and chrome

layouts/                              # Existing eleven layouts; all keep the shared frame

setup/
├── authors.ts
├── main.ts                           # Applies normalized deck state to the document root
├── presentation-config.ts            # Sole option/default/normalization/resolution authority
└── shiki.ts

styles/
├── base.css
├── layouts.css
├── obsidian.css
├── tokens.css
├── presets.css                       # Stable aggregate import
└── presets/
    ├── default.css
    ├── ucas.css
    └── ict.css

fixtures/
├── default-preset.md
├── ict-preset.md
├── obsidian-protocol.md
├── preset-isolation.md               # Shared source for generated 3 × 3 matrix decks
└── ucas-preset.md

tests/quality/
├── run.mjs                           # Bounded, actionable release-gate orchestrator
├── assets.spec.mjs
├── accessibility.spec.mjs
├── configuration.spec.mjs
├── preset-isolation.spec.mjs
└── baselines/
    ├── output-sizes.json             # Clean frozen-lock pre-refactor measurements
    └── visual/                       # Approved presentation-scale raster references

scripts/
├── check-presentation-css.mjs
├── measure-build-output.mjs
├── optimize-brand-assets.mjs
└── run-quality-gates.mjs

qa/refactor-theme-architecture/
├── performance-after.json
└── visual-review.md                  # Reviewer, date, status, skips, and follow-up owner

package.json                          # Commands; obsolete duplicate presentation defaults removed
README.md                             # Public API, pageNumber override, and validation commands
```

**Structure Decision**: Keep the existing single-package Slidev theme layout. Add a pure
configuration module under `setup/`, a visual-only child beside `SlideFrame`, and
resolved-canvas-scoped preset files beneath `styles/presets/`. Move ownership—not the public
class names—of the existing `.slidev-layout` wrappers from each layout into `SlideFrame`, so
background and inherited typography resolve from the same local state without duplicating
bindings across eleven layouts. Repository-only fixtures/tests/scripts/QA evidence remain
excluded from the published package. Do not add a second application, preset-specific layout
tree, conversion layer, or runtime schema library.

## Complexity Tracking

No constitution violations require justification.
