# Implementation Plan: Expand Theme Content

**Branch**: `002-expand-theme-content` | **Date**: 2026-07-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-expand-theme-content/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

**Agent context update**: Not applicable in this Spec Kit 0.12.8 checkout. The installed
integration manifest does not include `.specify/scripts/bash/update-agent-context.sh`, and the
repository has no generated agent-context file to update. The missing command was verified after
Phase 1; no substitute context file was invented.

## Summary

Expose the theme's existing semantic presentation language directly to standalone Slidev
authors. The implementation will add typed Vue components for callouts, figures, authors,
ordered content, status labels, and keyboard input; add shared closing, image-and-text, and code
layout experiences; extend the existing presentation resolver so `accent` can be overridden on
one slide; and complete shared task-list and highlight styling. All authoring paths will reuse
`SlideFrame`, `.obsidian-slidev-*` media/callout semantics, and the existing token/preset system
without moving Obsidian conversion into the theme or adding a runtime dependency.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Vue 3.5.34 single-file components, CSS, and ESM on
Node.js `>=20.19.0`

**Primary Dependencies**: Slidev `52.15.2` (`@slidev/client`, `@slidev/types`,
`@slidev/cli`), Vue supplied by Slidev, and the existing `slidev-pane` addon; no new runtime
dependency is planned

**Storage**: N/A; author input is deck/slide frontmatter, Vue props/slots, and Markdown-rendered
content

**Testing**: Node's built-in test runner, existing production-build gates, Playwright Chromium
`1.61.1`, Axe `4.12.1`, exact pixel baselines, output-size manifests, and browser-side
navigation instrumentation. Navigation timing uses at least 20 post-warm-up samples per
affected scenario, timestamps the in-page key event, waits for fonts/images plus two unchanged
animation frames with no mutation, resize, or layout-shift signal, and reports nearest-rank p95.

**Target Platform**: Slidev 52 browser presentations and static production output; canonical
review environment is Chromium at a 980 × 552 logical 16:9 viewport and DPR 2

**Project Type**: Published npm Slidev theme/library with Vue layouts/components and shared CSS

**Performance Goals**: Production output growth at or below 5% for representative standalone
and protocol decks; affected-slide p95 navigation-to-visual-stability at or below 100 ms and no
more than 10% slower than baseline; zero theme-owned post-visibility layout shift

**Constraints**: Preserve ordinary Markdown and existing `.obsidian-slidev-*` generated markup;
keep the three presets on one shared render tree; retain logical source order and accessible
contrast in light/dark modes; contain long/bilingual content within the 16:9 canvas; add no
unjustified shipped asset over 250 KiB

**Scale/Scope**: 19 callout variants; 8 public content components; 5 public layout names backed
by 3 shared layout behaviors; one configuration-scope expansion; task/highlight integration;
3 presets × 2 modes, including 114 callout variant/preset/mode checks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Maintainable Preset Architecture**: Identify affected shared layouts, `SlideFrame`,
  semantic markup, and tokens. Confirm the design does not fork layout or component behavior
  solely for a preset and keeps Obsidian conversion outside the theme.
  **PASS (pre-design)** — Components and layouts will render through `SlideFrame`, shared
  layout shells, `.obsidian-slidev-*` callout/media classes, and `--presentation-*` tokens.
  Presets may override tokens only. No parser, converter, preset-specific component, or
  preset-specific layout is introduced.
- **Tests Are Release Gates**: Name the affected build commands, protocol fixture coverage,
  regression fixture or test, and light/dark 16:9 visual-review matrix.
  **PASS (pre-design)** — `pnpm run quality` remains the blocking aggregate gate, with focused
  `pnpm run build`, `pnpm run build:fixture`, preset builds, and Node test files available for
  diagnosis. Planning includes a standalone expanded-content fixture, extensions to the
  generated protocol fixture, component/configuration regressions, all preset/mode visual and
  Axe checks at 980 × 552, and a recorded human review.
- **Consistent Presentation Experience**: Document public configuration or semantic-contract
  effects, cross-preset behavior, accessibility, overflow, and bilingual typography.
  **PASS (pre-design)** — `accent` is the only configuration option whose scope changes, from
  deck-only to deck-and-slide. New components/layouts use one documented contract across all
  presets, semantic HTML and logical DOM order, visible focus for email links, non-focusable
  static labels/tasks, fallback image text, containment rules, and existing bilingual fonts.
- **Measured Projection Performance**: State the affected build or asset baseline, measurable
  budget, collection method, and allowed threshold. Flag any new asset over 250 KiB.
  **PASS (pre-design)** — Record clean production-output trees before and after for the
  standalone representative deck and `fixtures/obsidian-protocol.md`, enforce the existing 5%
  ceiling, and add repeatable browser navigation/stability evidence for the 100 ms and 10%
  limits. No new theme-owned binary or remote asset is planned; the 250 KiB asset gate remains
  blocking.

Any failed gate MUST be recorded in Complexity Tracking with an approved exception before
implementation proceeds.

**Pre-design gate result**: PASS. No exception is required to begin Phase 0.

### Post-design Constitution Re-check

- **Maintainable Preset Architecture — PASS**: The final design exposes eight public
  components, five public layout names, and two private shared layout SFCs outside Slidev's
  auto-registration trees. All public layouts use `SlideFrame`; callout/figure components reuse
  the generated semantic classes; generic components use shared tokens. `thanks` aliases `end`,
  image orientation is CSS-only, and no preset or converter implementation is forked.
- **Tests Are Release Gates — PASS**: The design adds a standalone expanded-content fixture,
  preserves/extends the protocol fixture, defines 114 exhaustive callout cases, and adds
  content-contract, source-order, task-state, accent, p95, delayed-media, output, asset, Axe,
  exact-visual, and human-review gates. Existing builds and the sub-300-second aggregate command
  remain blocking.
- **Consistent Presentation Experience — PASS**: The contracts define one public prop/slot
  surface across presets, preserve Slidev built-in `end`/image-layout inputs, keep logical DOM
  order, use native semantics, define image/author/task fallbacks and focus behavior, and state
  long/bilingual containment guidance. Local accent is per-frame and protected identity roles
  are explicit.
- **Measured Projection Performance — PASS**: The design requires a fresh immutable
  pre-rendering-change baseline, 5% total/logical-bundle ceilings, at least 20 browser-side
  samples with nearest-rank p95, an absolute 100 ms ceiling, a 10% unchanged-control ceiling,
  delayed-media zero-layout-shift cases, and recursive 250 KiB shipped-asset enforcement.

**Post-design gate result**: PASS. The Phase 1 design introduces no constitution violation or
exception.

## Project Structure

### Documentation (this feature)

```text
specs/002-expand-theme-content/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   ├── components.md
│   ├── layouts.md
│   ├── presentation-accent.md
│   └── quality-gates.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
components/
├── SlideFrame.vue
├── Callout.vue
├── Figure.vue
├── Authors.vue
├── Steps.vue
├── Timeline.vue
├── Tag.vue
├── Badge.vue
└── Kbd.vue

internals/
├── ClosingLayout.vue
└── ImageTextLayout.vue

layouts/
├── end.vue
├── thanks.vue
├── image-left.vue
├── image-right.vue
└── code.vue

setup/
├── authors.ts
├── callouts.ts
├── main.ts
├── presentation-config.ts
└── task-lists.ts

styles/
├── base.css
├── components.css
├── layouts.css
├── obsidian.css
├── tokens.css
└── presets/
    ├── default.css
    ├── ucas.css
    └── ict.css

fixtures/
├── expanded-content.md
└── obsidian-protocol.md

tests/quality/
├── accessibility.spec.mjs
├── configuration.spec.mjs
├── content-contracts.spec.mjs
├── navigation-performance.spec.mjs
├── visual.spec.mjs
└── baselines/

qa/expand-theme-content/
├── performance-before.json
├── performance-after.json
└── visual-review.md

package.json
README.md
example.md
```

**Structure Decision**: Extend the existing single-package theme in place. Public components
live in `components/`, public layouts remain one root-level SFC per Slidev layout name, and thin
alias/orientation adapters delegate to shared layout shells under the new shipped `internals/`
directory. That directory is deliberately outside Slidev's recursively auto-registered
`components/` and `layouts/` trees and is added to `package.json.files`. Pure configuration,
callout, author, and presentation-only task normalization stay in `setup/`; semantic and layout
styling stay in shared CSS entry points, with preset files limited to tokens or narrow visual
refinements. The maintained fixture and quality harness are extended rather than creating a
second application or test system.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations or approved exceptions are planned.
