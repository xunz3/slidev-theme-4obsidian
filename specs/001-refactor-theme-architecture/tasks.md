---

description: "Dependency-ordered implementation tasks for the theme architecture refactor"
---

# Tasks: Refactor Theme Architecture

**Input**: Design documents from `/specs/001-refactor-theme-architecture/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and
`quickstart.md`

**Tests**: Tests and verification are required because this feature changes shared rendering,
configuration resolution, preset CSS, brand assets, and release gates. Write each story's
contract/regression checks first, confirm they expose the current failure, then implement the
corresponding behavior.

**Organization**: Tasks are grouped by user story so preset isolation, asset delivery, and
maintainer safeguards can be implemented and validated as distinct increments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with the identified neighboring work because it uses different
  files and has no dependency on an incomplete task
- **[Story]**: Maps implementation work to `US1`, `US2`, or `US3`
- Every task names the exact repository file or directory it changes or validates

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preserve immutable pre-refactor measurements and establish the dependency,
command, and artifact surfaces required by every story.

- [X] T001 Build `example.md`, `fixtures/default-preset.md`, and `fixtures/obsidian-protocol.md` from clean output directories and commit their 3,232,547 B, 4,318,670 B, and 3,282,934 B baselines, 5% ceilings, sorted file manifests, Git identifier, tool versions, and `pnpm-lock.yaml` hash to `tests/quality/baselines/output-sizes.json`
- [X] T002 [P] Ignore generated quality servers, builds, logs, screenshots, diffs, and Axe output by adding `.artifacts/quality/` to `.gitignore` while leaving `tests/quality/baselines/` and `qa/refactor-theme-architecture/` tracked
- [X] T003 Pin `axe-core` as an exact development-only dependency and add `assets:optimize`, `assets:check`, `quality`, and `quality:update-baselines` command entries in `package.json` and `pnpm-lock.yaml`, with no change to runtime dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the single typed configuration authority used by the application setup,
shared frame, layouts, and quality checks.

**Critical**: Complete this phase before implementing any user story.

### Foundational Tests

- [X] T004 Write failing Node contract coverage for all option definitions, defaults, accepted enum and textual boolean inputs, first-valid deck/slide/prop precedence, invalid-value inheritance, accent validation, and derived chrome/header behavior in `tests/quality/configuration.spec.mjs`

### Foundational Implementation

- [X] T005 Implement immutable option definitions, derived TypeScript types, pure normalizers, deck resolution, per-slide resolution, CSS-color validation, all eleven frame variants, and chrome/header derivation in `setup/presentation-config.ts`
- [X] T006 Refactor `setup/main.ts` to consume normalized deck state from `setup/presentation-config.ts`, safely apply or remove root diagnostic attributes and accent properties, and remove the obsolete `slidev.themeConfig.presentation` defaults from `package.json`

**Checkpoint**: Configuration behavior has one executable authority, the contract test passes,
and user-story work can begin.

---

## Phase 3: User Story 1 - Reliable Preset Overrides (Priority: P1) MVP

**Goal**: Make the resolved slide preset the sole styling and branding authority while
preserving the existing shared layout hierarchy, public classes, metadata, chrome, and
semantic markup.

**Independent Test**: Build decks for global default, UCAS, and ICT from one canonical fixture;
for all nine explicit global-to-local preset pairs in light and dark mode, compare each slide
with an unoverridden target-preset slide and verify matching canvas/frame state, computed
styles, branding, screenshots, overflow, focus, navigation, and TOC behavior.

### Tests for User Story 1

- [X] T007 [P] [US1] Create identical bilingual headings, lists, tables, inline/block code, quotes, generated callouts/warnings/captions, chrome, stable case IDs, target slides, all three local preset overrides, invalid inputs, textual booleans, and representative layouts in `fixtures/preset-isolation.md`
- [X] T008 [P] [US1] Create a failing structural preset check in `scripts/check-presentation-css.mjs` that rejects root-to-slide preset selectors, incomplete light/dark/density token sets, missing local canvas anchors, `!important` isolation patches, and preset-specific frame or layout components
- [X] T009 [US1] Write the failing 3 × 3 × 2 public-API regression in `tests/quality/preset-isolation.spec.mjs`, generating three global-preset decks from `fixtures/preset-isolation.md` and asserting mirrored canvas/frame attributes, computed style fingerprints, allowed brand DOM, loaded images, overflow, same-run screenshots, keyboard/TOC behavior, and theme-owned layout stability

### Implementation for User Story 1

- [X] T010 [US1] Create visual-only preset/variant/attachment branding mappings with approved asset imports, accessible lockup names, decorative-image semantics, stable intrinsic dimensions, and existing brand class names in `components/PresetBranding.vue`
- [X] T011 [US1] Refactor `components/SlideFrame.vue` to use `setup/presentation-config.ts`, own the outer `.slidev-layout.<variant>` and inner `.slide-frame--<variant>` elements, mirror resolved preset/density attributes, apply accent and optional canvas style on the outer element, preserve metadata/chrome/navigation behavior, and delegate only visual markup to `components/PresetBranding.vue`
- [X] T012 [US1] Remove duplicated outer canvas wrappers and local `ChromeSetting` declarations, import shared frame/config types, and pass unchanged slots, props, variant classes, and cover/intro background styles through `layouts/default.vue`, `layouts/cover.vue`, `layouts/intro.vue`, `layouts/section.vue`, `layouts/toc.vue`, `layouts/center.vue`, `layouts/two-cols.vue`, `layouts/statement.vue`, `layouts/quote.vue`, `layouts/figure.vue`, and `layouts/references.vue`
- [X] T013 [P] [US1] Move the default preset's complete light/dark token sets, compact/normal/relaxed density values, canvas typography/background, shared-content refinements, and variant rules under `.slidev-layout[data-presentation-preset="default"]` in `styles/presets/default.css`
- [X] T014 [P] [US1] Move the UCAS preset's complete light/dark token sets, compact/normal/relaxed density values, canvas/content rules, and variant-specific branding under `.slidev-layout[data-presentation-preset="ucas"]` in `styles/presets/ucas.css`
- [X] T015 [P] [US1] Move the ICT preset's complete light/dark token sets, compact/normal/relaxed density values, canvas/content rules, and variant-specific branding under `.slidev-layout[data-presentation-preset="ict"]` in `styles/presets/ict.css`
- [X] T016 [US1] Replace the monolithic rules in `styles/presets.css` with stable ordered imports of `styles/presets/default.css`, `styles/presets/ucas.css`, and `styles/presets/ict.css`, preserving preset-neutral behavior in `styles/tokens.css`, `styles/base.css`, `styles/layouts.css`, and `styles/obsidian.css`
- [X] T017 [US1] Run `node scripts/check-presentation-css.mjs`, `node --test tests/quality/configuration.spec.mjs tests/quality/preset-isolation.spec.mjs`, `pnpm run build`, `pnpm run build:default`, `pnpm run build:ucas`, `pnpm run build:ict`, and `pnpm run build:fixture`; resolve every mismatch in `components/`, `layouts/`, `setup/`, `styles/`, or `fixtures/preset-isolation.md`

**Checkpoint**: User Story 1 passes all 18 equivalence cases and every supported deck/layout
continues to use one shared frame with no global-preset leakage.

---

## Phase 4: User Story 2 - Lightweight Theme Delivery (Priority: P2)

**Goal**: Remove verified non-rendering SVG metadata, preserve brand appearance and geometry,
prevent image-driven layout shift, and keep measured production output within its frozen
budget.

**Independent Test**: Validate all shipped UCAS/ICT assets against pre-optimization structural
and browser-raster references, confirm exact required-pair and per-file byte limits, run the
optimizer twice with no second diff, observe stable post-decode geometry in light/dark UCAS
slides, and measure clean example/default-only/protocol builds against the recorded ceilings.

### Tests for User Story 2

- [X] T018 [US2] Capture immutable pre-optimization bytes, dimensions/view boxes, paths, IDs, transforms, transparency, license context, display roles, and presentation-scale RGBA references for every shipped asset in `tests/quality/baselines/brand-assets.json` and `tests/quality/baselines/visual/brands/`
- [X] T019 [US2] Write the failing asset contract in `tests/quality/assets.spec.mjs` to enforce the 256,000 B per-file limit, 424,883 B required-pair limit, absence of ICC/color-profile metadata, preserved SVG structure and alpha, Canvas RGBA equivalence, explicit rendered dimensions, no broken image, no post-decode geometry change, and optimizer idempotence

### Implementation for User Story 2

- [X] T020 [P] [US2] Implement deterministic allowlisted removal of only the shared `<color-profile>` element, unused `xmlns:xlink`/`xmlns:svg` declarations, and Inkscape generator comment, with structural preconditions and actionable refusal errors, in `scripts/optimize-brand-assets.mjs`
- [X] T021 [P] [US2] Implement clean-directory regular-file byte measurement, sorted manifests, lockfile hashing, baseline comparison, and reproducible metadata capture in `scripts/measure-build-output.mjs`
- [X] T022 [US2] Apply `scripts/optimize-brand-assets.mjs` to `assets/UCAS/emblem.svg`, `assets/UCAS/emblem-name-bilingual-hz.svg`, `assets/UCAS/emblem-name-bilingual-stacked.svg`, `assets/UCAS/emblem-name-bilingual-hz-kaiti.svg`, `assets/UCAS/emblem-name-bilingual-vt.svg`, and `assets/UCAS/emblem-name-bilingual-vt-kaiti.svg` without changing geometry, IDs, colors, dimensions, transparency, wording, or licensing
- [X] T023 [US2] Run `pnpm run assets:optimize` twice and `pnpm run assets:check`, confirming a no-diff second optimization, exact 70,710 B emblem and 179,085 B horizontal-wordmark results, a 249,795 B pair total, all brand files at or below 256,000 B, raster equivalence, and stable image geometry in `tests/quality/assets.spec.mjs`
- [X] T024 [US2] Rebuild `example.md`, `fixtures/default-preset.md`, and `fixtures/obsidian-protocol.md` into clean directories, use `scripts/measure-build-output.mjs` to enforce 3,394,174 B, 4,534,603 B, and 3,447,080 B ceilings, and record sorted after-state evidence in `qa/refactor-theme-architecture/performance-after.json`

**Checkpoint**: User Story 2 preserves approved artwork at presentation scale, removes the
known metadata payload from all six UCAS SVGs, stays within every asset/output budget, and
introduces no brand-image layout shift.

---

## Phase 5: User Story 3 - Safer Theme Maintenance (Priority: P3)

**Goal**: Give maintainers one bounded, actionable release gate that detects configuration,
architecture, build, visual, accessibility, interaction, asset, output, and timing regressions
without changing the public API or adding a runtime dependency.

**Independent Test**: Run one command from a clean checkout and verify all maintained and
generated decks, configuration/structure checks, all layouts/presets/modes, Axe checks,
keyboard/TOC/focus behavior, screenshots, asset and output budgets, cleanup, and the
five-minute bound; then exercise deterministic negative cases and confirm contextual non-zero
failures.

### Tests for User Story 3

- [X] T025 [P] [US3] Write Playwright/Axe coverage for WCAG A/AA serious and critical findings, meaningful/decorative image names, landmarks, headings, contrast, focusable controls, visible focus outlines, ArrowRight navigation, TOC Tab/Enter/click activation, console errors, broken images, clipping, overflow, and all eleven layouts in `tests/quality/accessibility.spec.mjs`
- [X] T026 [P] [US3] Extend `tests/quality/configuration.spec.mjs` and `scripts/check-presentation-css.mjs` to reject duplicate defaults/normalizers/type unions, layout-local presentation resolution, package presentation defaults, root-authoritative preset CSS, incomplete preset token sets, preset-specific frames/layouts, and README contract drift including slide-level `pageNumber`
- [X] T027 [P] [US3] Capture approved representative 980 × 552 DPR-2 light/dark visual references and fixed tolerance metadata for default, UCAS, ICT, generated protocol markup, chrome, and all eleven layouts in `tests/quality/baselines/visual/`

### Implementation for User Story 3

- [X] T028 [US3] Implement the bounded release-gate orchestrator in `tests/quality/run.mjs` to create empty absolute build directories, generate three matrix decks, run at most two builds concurrently, serve outputs locally, execute every quality spec and measurement, retain contextual evidence under `.artifacts/quality/`, clean up child processes, report slow phases, and exit 2 at 300 seconds
- [X] T029 [P] [US3] Implement the maintainer entry point and explicit reviewed baseline-update mode in `scripts/run-quality-gates.mjs`, finalize the four command mappings in `package.json`, and guarantee that normal `assets:check` and `quality` runs never mutate `tests/quality/baselines/`
- [X] T030 [US3] Add deterministic mutation-free self-checks for representative configuration, screenshot, asset-size, skipped-gate, and timeout failures in `tests/quality/run.mjs`, asserting contextual case fields, retained artifact paths, non-zero exit semantics, skip owner/follow-up requirements, and `.artifacts/quality/summary.json` output
- [X] T031 [P] [US3] Update `README.md` so accepted values, defaults, textual booleans, aliases, first-valid precedence, local `pageNumber`, unchanged layouts/semantic markup, no-migration compatibility, asset commands, focused diagnostics, aggregate quality command, baseline review procedure, and five-minute release gate match the contracts
- [X] T032 [US3] Run `pnpm run quality` and its intentional-failure self-checks, fix all failures in `tests/quality/`, `scripts/`, `fixtures/`, `setup/`, `components/`, `layouts/`, `styles/`, or `README.md`, and verify `.artifacts/quality/summary.json` reports every phase and a total duration below 300,000 ms

**Checkpoint**: User Story 3 provides one authoritative configuration surface, one shared
render tree, documented commands, actionable negative-case reporting, and a passing bounded
release gate.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete human review, compatibility/package audits, and the final clean
end-to-end release run.

- [X] T033 [P] Review default, UCAS, and ICT at the canonical 16:9 viewport in light and dark mode for all eleven layouts, representative long/bilingual content, typography, overflow, clipping, contrast, brand fidelity, and layout stability, then record reviewer, date, result, and any skip reason/owner/follow-up in `qa/refactor-theme-architecture/visual-review.md`
- [X] T034 Run `pnpm run build`, `pnpm run build:default`, `pnpm run build:ucas`, `pnpm run build:ict`, and `pnpm run build:fixture`, resolving any standalone Markdown, layout, or `.obsidian-slidev-*` compatibility regression in `example.md`, `fixtures/`, `layouts/`, `styles/`, or `components/`
- [X] T035 [P] Run a package dry-run and audit `package.json` so published `assets/`, `components/`, `layouts/`, `setup/`, `styles/`, and `README.md` are complete while `.artifacts/`, `tests/`, `scripts/`, `qa/`, and fixtures remain repository-only and `axe-core` remains development-only
- [X] T036 Execute every step in `specs/001-refactor-theme-architecture/quickstart.md`, rerun `pnpm run assets:check` and `pnpm run quality`, confirm normal gates leave `tests/quality/baselines/` unchanged, and finalize `qa/refactor-theme-architecture/performance-after.json` plus `qa/refactor-theme-architecture/visual-review.md` with no unexplained failure or skip

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately; T001 must capture the pre-refactor lockfile/build
  evidence before T003 changes dependency metadata
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user-story implementation
- **Phase 3 (US1)**: Depends on Phase 2; this is the MVP and highest-priority behavior fix
- **Phase 4 (US2)**: Depends on Phase 2 and is technically independent of US1, although the
  recommended priority sequence completes US1 first
- **Phase 5 (US3)**: Depends on both US1 and US2 because its aggregate gate verifies their
  finalized behavior and budgets
- **Phase 6 (Polish)**: Depends on every selected user story

### User Story Dependency Graph

```text
Setup
  └── Foundational configuration authority
        ├── US1 Reliable Preset Overrides (MVP)
        └── US2 Lightweight Theme Delivery
              └──────────────┐
        US1 ─────────────────┴──> US3 Safer Theme Maintenance
                                      └── Polish and release evidence
```

### Within User Story 1

- T007 and T008 run in parallel.
- T009 depends on T007 and T008 and must demonstrate the current isolation failure.
- T010 depends on the failing regression contract; T011 depends on T010.
- T012 depends on the final `SlideFrame` API from T011.
- T013, T014, and T015 run in parallel after the resolved canvas hierarchy is available.
- T016 depends on all three preset files; T017 validates the complete story.

### Within User Story 2

- T018 must capture source evidence before any SVG changes.
- T019 depends on T018 and must fail against the current oversized/profile-bearing assets.
- T020 and T021 run in parallel after the contract is fixed.
- T022 depends on T020; T023 depends on T018 through T022.
- T024 depends on T021 and the optimized assets validated by T023.

### Within User Story 3

- T025, T026, T027, and T031 can run in parallel after US1 and US2 stabilize.
- T028 depends on the executable tests and baselines from T025 through T027.
- T029 and T030 can run in parallel after T028 because they change separate command and
  diagnostic surfaces.
- T032 depends on T025 through T031 and closes the story.

### Final Phase

- T033 and T035 can run in parallel after US3.
- T034 supplies the final compatibility builds.
- T036 depends on T033 through T035 and is the final release checkpoint.

---

## Parallel Execution Examples

### User Story 1

```text
Parallel batch A:
  T007 — author fixtures/preset-isolation.md
  T008 — author scripts/check-presentation-css.mjs

Parallel batch B after the frame hierarchy is stable:
  T013 — author styles/presets/default.css
  T014 — author styles/presets/ucas.css
  T015 — author styles/presets/ict.css
```

### User Story 2

```text
Parallel batch after T019 exposes the current failures:
  T020 — implement scripts/optimize-brand-assets.mjs
  T021 — implement scripts/measure-build-output.mjs
```

### User Story 3

```text
Parallel batch A after US1 and US2:
  T025 — author tests/quality/accessibility.spec.mjs
  T026 — strengthen configuration and structural checks
  T027 — capture tests/quality/baselines/visual/
  T031 — update README.md

Parallel batch B after T028:
  T029 — wire scripts/run-quality-gates.mjs and package.json
  T030 — exercise tests/quality/run.mjs failure diagnostics
```

---

## Implementation Strategy

### MVP First

1. Complete Setup (T001–T003).
2. Complete the foundational configuration authority (T004–T006).
3. Complete Reliable Preset Overrides (T007–T017).
4. Stop and validate all 18 light/dark global-to-local comparisons plus the maintained builds.
5. Demo or review the corrected public preset override behavior before broadening the release
   infrastructure.

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 provides correct preset isolation with one shared frame.
2. **Performance increment**: US2 removes the verified SVG payload and proves asset/output
   budgets without changing visual identity.
3. **Maintenance increment**: US3 consolidates the full blocking release gate and public
   documentation.
4. **Release readiness**: Polish completes human sign-off, package audit, quickstart, and final
   evidence.

### Parallel Team Strategy

1. Complete T001–T006 sequentially where dependencies require.
2. After the foundation, one contributor can execute US1 while another captures and implements
   US2 asset work.
3. Within US1, split the three preset CSS files after T012.
4. After US1 and US2 stabilize, split accessibility checks, structural checks, visual
   baselines, and documentation before integrating the orchestrator.
5. Rejoin for T032 and the final release phase.

---

## Notes

- `[P]` marks only work with separate write targets and no unmet dependency.
- User-story tests precede implementation and must expose the current defect or missing gate.
- Keep approved baselines immutable during normal checks; update them only through the
  explicitly reviewed baseline command.
- Preserve user changes and avoid committing generated `.artifacts/quality/` output.
- Complete a logical task or tightly related task group before committing.
