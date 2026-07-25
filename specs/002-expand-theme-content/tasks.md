---

description: "Dependency-ordered implementation tasks for expanding the theme content surface"
---

# Tasks: Expand Theme Content

**Input**: Design documents from `/specs/002-expand-theme-content/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and
`quickstart.md`

**Tests**: Tests and verification are required because this feature changes public components,
layouts, shared configuration resolution, generated-markup rendering, accessibility,
performance baselines, and release gates. Write each story's contract/regression checks first,
confirm they expose the missing behavior, then implement the corresponding source changes.

**Organization**: Tasks are grouped by user story so standalone semantic components, academic
layouts, slide-local accents, technical authoring aids, and Obsidian reading cues remain
independently testable increments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with the identified neighboring work after its stated
  prerequisites because it writes different files
- **[Story]**: Maps implementation work to `US1`, `US2`, `US3`, `US4`, or `US5`
- Every task names the exact repository file or directory it changes or validates

## Phase 1: Setup (Pre-feature Measurement Infrastructure)

**Purpose**: Establish trustworthy output/navigation measurement and capture immutable
pre-rendering-change evidence before any component, layout, setup, or style implementation.

**Critical ordering rule**: T006 must finish before any task from Phase 2 or later changes
`components/`, `layouts/`, `setup/`, `styles/`, `fixtures/`, or published package contents.

- [X] T001 [P] Write failing Node coverage for reviewed baseline provenance, stable logical main-CSS/main-JS/SlideFrame bundle grouping, exact 5% ceilings, split mutation modes, and normal-run baseline immutability in `tests/quality/performance-baselines.spec.mjs`
- [X] T002 [P] Write the failing unchanged-control navigation contract with in-page ArrowRight timestamps, font/image readiness, mutation/resize/layout-shift observation, two stable animation frames, raw samples, and nearest-rank p95 in `tests/quality/navigation-performance.spec.mjs`
- [X] T003 [P] Implement stable logical bundle classification, clean-tree totals, reviewed before/after schemas, and immutable baseline comparison in `scripts/measure-build-output.mjs` and satisfy `tests/quality/performance-baselines.spec.mjs`
- [X] T004 [P] Implement reusable browser-side timing, geometry, and layout-shift instrumentation for at least 20 post-warm-up control transitions in `tests/quality/navigation-performance.mjs` and satisfy `tests/quality/navigation-performance.spec.mjs`
- [X] T005 Add separate reviewed visual and performance baseline-update modes in `scripts/run-quality-gates.mjs`, integrate their checks into `tests/quality/run.mjs`, and expose `quality:update-visual-baselines` plus `quality:update-performance-baselines` in `package.json` without changing runtime dependencies
- [X] T006 Run the reviewed pre-feature performance update before rendering changes and record fresh optimized output totals/logical bundles, unchanged-control timing samples, commit/tool/lockfile metadata, reviewer, and rationale in `tests/quality/baselines/output-sizes.json`, `tests/quality/baselines/navigation-performance.json`, and `qa/expand-theme-content/performance-before.json`

**Checkpoint**: Pre-feature evidence is immutable, reflects the current optimized repository,
and can be compared with later rendering changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared fixture/build/test surfaces, frame variants, generic asset guard,
and component stylesheet entry required by every user story.

**Critical**: Complete this phase before implementing any user story.

### Expanded-content Build and Browser Harness

- [X] T007 [P] Create the plugin-free deck shell, root mixed author metadata, stable control slides, preset-generation markers, and per-story insertion sections in `fixtures/expanded-content.md`
- [X] T008 Extend production-build generation for `fixtures/expanded-content.md` under global default/UCAS/ICT, create the reusable built-page harness in `tests/quality/content-contracts.spec.mjs`, and register the expanded builds plus future content/navigation specs in `tests/quality/helpers.mjs` and `tests/quality/run.mjs`

### Shared Frame Variant Contract

- [X] T009 [P] Write failing configuration coverage for shared `closing`, `image-text`, and `code` frame variants, including `chrome: auto` behavior and rejection of unsupported variants, in `tests/quality/configuration.spec.mjs`
- [X] T010 Implement the shared `closing`, `image-text`, and `code` frame variants and closing auto-chrome derivation without preset-specific branches in `setup/presentation-config.ts`

### Recursive Asset Contract

- [X] T011 [P] Write failing recursive shipped-asset coverage that retains every existing brand-fidelity assertion while detecting unlisted files over 256,000 bytes under `assets/` and `public/` in `tests/quality/assets.spec.mjs`
- [X] T012 Implement recursive theme-owned asset discovery, explicit author-fixture exclusions, and reviewed exception metadata while preserving the current brand allowlist/fidelity model in `tests/quality/brand-assets.mjs` and `tests/quality/assets.spec.mjs`

### Shared Component Style Entry

- [X] T013 [P] Create the shared generic component stylesheet in `styles/components.css` and import it in stable order from `styles/index.ts` without moving generated-markup rules out of `styles/obsidian.css`

**Checkpoint**: The fresh baselines remain untouched, all shared frame/test/build surfaces exist,
and user-story tests can be authored against production-built slides.

---

## Phase 3: User Story 1 - Reuse Styled Semantic Content (Priority: P1) MVP

**Goal**: Let standalone Slidev authors use all 19 callouts, accessible figures, and normalized
author cards without the Obsidian conversion plugin or raw semantic markup.

**Independent Test**: Build the standalone expanded-content deck under all three presets, inspect
light and dark modes, and verify 114/114 callout type cases plus neutral/rich fallbacks, figure
alternative/failure states, mixed author records, ordering, actionable email, and no empty
collection.

### Tests for User Story 1

- [X] T014 [US1] Populate the six 19-type callout-family slides, neutral/rich callout fallbacks, meaningful/caption-fallback/decorative/missing/failed/tall/wide/transparent figures, and string/mixed/partial/duplicate/empty author cases with stable markers in `fixtures/expanded-content.md`
- [X] T015 [P] [US1] Write failing production-DOM and computed-style coverage for all 114 canonical callout cases, default titles, neutral normalization, labelled note semantics, formatted bodies, generated-callout equivalence, figure alt precedence/error geometry, author normalization/order/links, and empty suppression in `tests/quality/content-contracts.spec.mjs`
- [X] T016 [P] [US1] Add failing Axe, image-alternative, email focus, non-color callout cue, overflow, long-title, bilingual, and runtime-error scenarios for the US1 fixture markers in `tests/quality/accessibility.spec.mjs`
- [X] T017 [P] [US1] Add failing representative callout-family/neutral/figure/author visual scenarios and callout/figure/author navigation-stability scenarios in `tests/quality/visual-baselines.mjs` and `tests/quality/navigation-performance.spec.mjs`

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement the immutable 19-value tuple, case-insensitive normalizer, semantic-family mapping, human-readable default titles, and neutral fallback in `setup/callouts.ts`
- [X] T019 [US1] Implement the globally authorable labelled `role="note"` component with exact `.obsidian-slidev-callout*` class/data/title/body compatibility and formatted default slot in `components/Callout.vue`
- [X] T020 [P] [US1] Implement the globally authorable native figure/image/caption component with tri-state alt resolution, contain/cover fitting, reserved viewport, missing/failed-source fallback, and exact `.obsidian-slidev-media*` compatibility in `components/Figure.vue`
- [X] T021 [P] [US1] Extend normalization with plural-first/singular-fallback deck resolution, preserved source order/duplicates, partial-record handling, and actionable-email validation in `setup/authors.ts`
- [X] T022 [US1] Implement the conditional semantic author list and focus-visible mail links in `components/Authors.vue`, then make `components/SlideFrame.vue` and `layouts/cover.vue` consume the shared resolver without changing existing footer/cover output
- [X] T023 [US1] Add neutral/non-color callout cues, stable image viewport/failure treatment, and responsive author cards using shared tokens in `styles/obsidian.css`, `styles/components.css`, and `styles/tokens.css` while preserving preset refinements
- [X] T024 [US1] Run `node --test tests/quality/content-contracts.spec.mjs tests/quality/accessibility.spec.mjs tests/quality/navigation-performance.spec.mjs`, build all three expanded-content preset variants plus `fixtures/obsidian-protocol.md`, and resolve every US1 mismatch in `components/`, `setup/`, `styles/`, or `fixtures/expanded-content.md` without updating approved performance baselines

**Checkpoint**: User Story 1 independently delivers the standalone semantic-component MVP and
passes all 114 callout cases plus figure/author accessibility and compatibility checks.

---

## Phase 4: User Story 2 - Compose Common Academic Slides (Priority: P1)

**Goal**: Provide equivalent `end`/`thanks` closing layouts and mirrored `image-left`/
`image-right` layouts with optional metadata, stable media, and logical source order.

**Independent Test**: Build both closing names and both image orientations with identical short,
long, bilingual, missing, and optional content; verify alias equivalence, existing Slidev input
compatibility, narrative-then-figure DOM order, mirrored geometry, accessible contact/logo/image,
and no post-visibility shift.

**Story dependency**: Uses the shared `Authors` and `Figure` semantics completed by US1.

### Tests for User Story 2

- [X] T025 [US2] Add `end`, `thanks`, `image-left`, and `image-right` slides covering default-slot compatibility, optional/omitted contact/authors/logo, meaningful/decorative/missing/failed logos, legacy `image`/`class`/`backgroundSize`, missing images, long captions, and bilingual prose in `fixtures/expanded-content.md`
- [X] T026 [P] [US2] Write failing alias-identity, props/defaults, empty-region, email/logo fallback, built-in-input compatibility, identical DOM order, mirrored geometry, and missing-image-collapse assertions in `tests/quality/content-contracts.spec.mjs`
- [X] T027 [P] [US2] Add failing closing/image-layout Axe, focus, overflow, visual, delayed-success, failed-media, and zero-layout-shift scenarios in `tests/quality/accessibility.spec.mjs`, `tests/quality/visual-baselines.mjs`, and `tests/quality/navigation-performance.spec.mjs`

### Implementation for User Story 2

- [X] T028 [P] [US2] Implement the private shared closing message/contact/authors/logo structure, `showAuthors: false` compatibility default, tri-state logo alt, stable logo shell, and closing frame delegation in `internals/ClosingLayout.vue`
- [X] T029 [P] [US2] Implement the private narrative-then-figure DOM, orientation-only CSS state, `image`/`class`/`backgroundSize` compatibility, new `imageAlt`/`caption` inputs, and missing-image collapse in `internals/ImageTextLayout.vue`
- [X] T030 [US2] Expose the closing experience through `layouts/end.vue` and an exact-module `layouts/thanks.vue` alias without copied props, slots, or behavior
- [X] T031 [US2] Expose the shared image/text experience through thin `layouts/image-left.vue` and `layouts/image-right.vue` adapters that differ only by orientation
- [X] T032 [US2] Add balanced closing, mirrored two-region, bounded caption/media, omitted-region, long/bilingual, and responsive rules using shared tokens in `styles/layouts.css` and `styles/tokens.css`
- [X] T033 [P] [US2] Add `internals/` to the published `files` allowlist while keeping exactly eight new public auto-registered component names in `package.json`
- [X] T034 [US2] Run focused content/Axe/navigation tests, build both closing aliases and both image orientations under all presets/modes, and resolve every US2 compatibility, reading-order, media-failure, overflow, or layout-shift mismatch in `internals/`, `layouts/`, `styles/`, `package.json`, or `fixtures/expanded-content.md`

**Checkpoint**: User Story 2 completes the P1 academic-layout slice without changing existing
built-in authoring or introducing orientation-dependent reading order.

---

## Phase 5: User Story 3 - Change Accent by Section (Priority: P2)

**Goal**: Resolve a valid slide `accent` ahead of the deck/preset value on that slide only,
without leaking across navigation or recoloring protected institutional identity.

**Independent Test**: In every preset and mode, navigate valid local → unaccented → empty →
invalid → another valid local slides, verify first-valid fallback and simultaneous mounted-slide
isolation, and compare protected UCAS/ICT branding before and after the override.

### Tests for User Story 3

- [X] T035 [US3] Add valid/equal-to-deck/unaccented/empty/invalid/second-valid accent sequences with accent-aware content, chrome, semantic callouts, and protected UCAS/ICT identity markers in `fixtures/expanded-content.md`
- [X] T036 [P] [US3] Write failing pure resolution coverage for `accent` scope metadata, local/deck/preset first-valid precedence, valid CSS forms, empty/invalid fallback, and unchanged deck-only setup behavior in `tests/quality/configuration.spec.mjs`
- [X] T037 [P] [US3] Write failing production-browser coverage for per-frame variables, no document-root local value, simultaneous mounted-slide isolation, navigation reset, all consumer roles, semantic fixed colors, and protected-brand style/pixel stability in `tests/quality/content-contracts.spec.mjs` and `tests/quality/preset-isolation.spec.mjs`
- [X] T038 [P] [US3] Add failing representative accent override/fallback/leakage visual and navigation scenarios for all presets and modes in `tests/quality/visual-baselines.mjs` and `tests/quality/navigation-performance.spec.mjs`

### Implementation for User Story 3

- [X] T039 [US3] Change the canonical `accent` option to `deck-and-slide`, add `slideKeys: ['accent']`, and resolve local → deck → preset without changing other option contracts in `setup/presentation-config.ts`
- [X] T040 [US3] Apply the resolved accent only through each rendered canvas style in `components/SlideFrame.vue` and keep `setup/main.ts` restricted to deck-level document-root state with no navigation watcher or imperative local cleanup
- [X] T041 [US3] Audit and correct accent consumers versus protected warning/success/danger/question and official identity roles across `styles/base.css`, `styles/components.css`, `styles/layouts.css`, `styles/obsidian.css`, and `styles/presets/`
- [X] T042 [US3] Run configuration, content, preset-isolation, visual-scenario, and navigation tests across the full accent sequence in all preset/mode builds and resolve every US3 precedence, leakage, contrast, or protected-brand mismatch in `setup/`, `components/`, `styles/`, or `fixtures/expanded-content.md`

**Checkpoint**: User Story 3 independently supports section accents with deterministic fallback,
multi-slide safety, and locked institutional identity.

---

## Phase 6: User Story 4 - Explain Technical Work Clearly (Priority: P3)

**Goal**: Add a full-width code layout plus semantic Steps, Timeline, Tag, Badge, and Kbd
authoring patterns for technical and research presentations.

**Independent Test**: Build one standalone slide for every pattern, including zero/one/many
sequence items, long code lines/files, missing titles, multi-key chords, symbols, and bilingual
content; verify native reading order, non-color distinctions, no misleading focus targets, and
contained overflow.

### Tests for User Story 4

- [X] T043 [US4] Add stable code-layout, zero/one/many Steps/Timeline, dated/undated events, long/bilingual Tag/Badge, and single/chord Kbd cases to `fixtures/expanded-content.md`
- [X] T044 [P] [US4] Write failing production-DOM/Axe coverage for code title/full-width/overflow behavior, ordered-list source meaning, zero/one/many decoration, optional time semantics, Tag/Badge non-color distinction, and non-focusable native Kbd sequences in `tests/quality/content-contracts.spec.mjs` and `tests/quality/accessibility.spec.mjs`
- [X] T045 [P] [US4] Add failing representative code/process/timeline/status/keycap visual and navigation scenarios with long and bilingual content in `tests/quality/visual-baselines.mjs` and `tests/quality/navigation-performance.spec.mjs`

### Implementation for User Story 4

- [X] T046 [P] [US4] Implement the globally authorable ordered-list wrapper with source-order semantics and zero/one/many-safe decoration hooks in `components/Steps.vue`
- [X] T047 [P] [US4] Implement the globally authorable chronological ordered-list wrapper with optional native time-label hooks and accessibility-hidden decoration in `components/Timeline.vue`
- [X] T048 [P] [US4] Implement non-focusable category and status text containers with distinct structural cues and no live-region roles in `components/Tag.vue` and `components/Badge.vue`
- [X] T049 [P] [US4] Implement native single-key and filtered structured chord rendering with nested `<kbd>` elements, visible plus separators, and readable accessible text in `components/Kbd.vue`
- [X] T050 [P] [US4] Implement the shared-frame code layout with optional visible heading space, full-width primary `.slidev-code-wrapper`, contained horizontal/vertical overflow, and unchanged Slidev highlighting/annotations in `layouts/code.vue`
- [X] T051 [US4] Add projection-sized sequence rails/markers, non-color Tag/Badge cues, responsive keycaps, and code-layout containment through shared tokens in `styles/components.css`, `styles/layouts.css`, and `styles/tokens.css`
- [X] T052 [US4] Run focused content/Axe/navigation tests and all expanded-content preset builds, then resolve every US4 semantic, source-order, title, non-color, focus, long-line, bilingual, or overflow mismatch in `components/`, `layouts/code.vue`, `styles/`, or `fixtures/expanded-content.md`

**Checkpoint**: User Story 4 independently provides static technical authoring aids that remain
meaningful without decoration and legible at the canonical viewport.

---

## Phase 7: User Story 5 - Preserve Obsidian Reading Cues (Priority: P3)

**Goal**: Render checked/unchecked tasks and prose highlights as theme-owned, accessible,
presentation-only reading cues without changing conversion or parsing responsibilities.

**Independent Test**: Present checked, unchecked, nested, wrapped, and mixed task markup plus
native/generated prose highlights in every preset/mode; verify disabled/non-focusable task
state, aligned non-color cues, contrast, adjacent inline semantics, and no highlight styling in
code.

### Tests for User Story 5

- [X] T053 [US5] Add checked/unchecked/nested/wrapped task cases and prose/link/emphasis/inline-code/code-block highlight cases to `fixtures/expanded-content.md`, then add raw generated task/highlight compatibility markup without new `==...==` parsing to `fixtures/obsidian-protocol.md`
- [X] T054 [P] [US5] Write failing production-DOM coverage for preserved checked state, disabled/non-focusable inputs, click/keyboard non-toggle behavior, nested/wrapped alignment, native/generated highlight equivalence, adjacent inline distinctions, and no code selector match in `tests/quality/content-contracts.spec.mjs`
- [X] T055 [P] [US5] Add failing task/highlight Axe, focus-order, non-color, contrast, overflow, visual, and navigation-stability scenarios for every preset/mode in `tests/quality/accessibility.spec.mjs`, `tests/quality/visual-baselines.mjs`, and `tests/quality/navigation-performance.spec.mjs`

### Implementation for User Story 5

- [X] T056 [P] [US5] Implement an idempotent scoped normalizer that preserves `checked`, sets presentation task inputs disabled/non-focusable, and handles initially rendered plus later-added slide DOM in `setup/task-lists.ts`
- [X] T057 [US5] Invoke and clean up the task normalizer through the existing app setup lifecycle without adding parser/converter behavior or per-navigation global accent work in `setup/main.ts`
- [X] T058 [P] [US5] Add aligned nested/wrapped task boxes with explicit check cues and prose-only native/generated highlight styling that excludes `pre`/`code` in `styles/base.css` and `styles/obsidian.css`
- [X] T059 [US5] Run focused content/Axe/navigation tests plus standalone and protocol builds in every preset/mode, then resolve every US5 state, focus, nesting, contrast, selector-scope, compatibility, or stability mismatch in `setup/`, `styles/`, `fixtures/expanded-content.md`, or `fixtures/obsidian-protocol.md`

**Checkpoint**: User Story 5 independently restores the missing reading cues while task state
remains presentation-only and highlight syntax remains outside theme parsing.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Complete public documentation/examples, reviewed visuals, after-performance
evidence, package/compatibility audits, and the final release gate.

- [X] T060 [P] Document all eight components, five layout names, accepted props/slots, defaults, tri-state alt behavior, author/email rules, slide-accent precedence, task/highlight behavior, containment fallbacks, and no-migration compatibility in `README.md`
- [X] T061 [P] Replace representative raw callout/figure/card authoring with the public components and add concise closing/image-text/accent/code/process/status/keyboard/task/highlight examples without enabling conversion in `example.md`
- [X] T062 Run the reviewed visual-only update for all approved US1–US5 scenarios, verify fixed zero-tolerance metadata, and commit the resulting manifest/images under `tests/quality/baselines/visual/` while retaining contact sheets under `.artifacts/quality/screenshots/`
- [X] T063 Review every public interface and fallback at 980 × 552 DPR 2 in default/UCAS/ICT light and dark modes, perform the five-example README usability trial, and record reviewer/date/environment/results plus any skip owner/follow-up in `qa/expand-theme-content/visual-review.md`
- [X] T064 [P] Run clean after builds and navigation measurements without updating baselines, compare standalone/protocol totals and logical bundles against 5% ceilings plus p95 against 100 ms/110% limits, and record sorted files/raw samples/status in `qa/expand-theme-content/performance-after.json`
- [X] T065 [P] Run a package dry-run and audit `package.json` so `internals/` ships, exactly the intended public components/layouts auto-register, no new runtime dependency/remote asset appears, every shipped asset is covered by the 256,000-byte gate, and repository-only tests/fixtures/QA artifacts stay unpublished
- [X] T066 Run `pnpm run build`, `pnpm run build:default`, `pnpm run build:ucas`, `pnpm run build:ict`, `pnpm run build:fixture`, and the standalone expanded-content builds, resolving every existing-deck, built-in-layout, ordinary-Markdown, or `.obsidian-slidev-*` regression in `example.md`, `fixtures/`, `components/`, `internals/`, `layouts/`, `setup/`, or `styles/`
- [X] T067 Execute every step in `specs/002-expand-theme-content/quickstart.md`, run `pnpm run assets:check` and `pnpm run quality`, confirm all 114 callouts, accessibility, exact visual, performance, layout-shift, package, and baseline-integrity gates pass below 300,000 ms, and finalize `qa/expand-theme-content/performance-after.json` plus `qa/expand-theme-content/visual-review.md` with no unexplained failure or skip

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately; T001 and T002 define failing contracts, T003 and
  T004 implement their separate measurement surfaces, T005 joins the reviewed commands, and
  T006 must freeze the real pre-feature evidence before rendering changes.
- **Phase 2 (Foundational)**: Depends on T006 and blocks all user-story implementation.
- **Phase 3 (US1)**: Depends on Foundation; it is the suggested MVP.
- **Phase 4 (US2)**: Depends on Foundation and US1 because closing/image layouts reuse the
  `Authors` and `Figure` contracts; completing it finishes the full P1 delivery slice.
- **Phase 5 (US3)**: Depends on Foundation and is behaviorally independent of US1/US2.
- **Phase 6 (US4)**: Depends on Foundation and is behaviorally independent of US1–US3.
- **Phase 7 (US5)**: Depends on Foundation and is behaviorally independent of US1–US4.
- **Phase 8 (Polish)**: Depends on every selected user story.

### User Story Dependency Graph

```text
Pre-feature measurement
  └── Shared fixture, frame variants, and quality foundation
        ├── US1 Semantic Components (MVP)
        │     └── US2 Academic Layouts (complete P1 slice)
        ├── US3 Slide Accent
        ├── US4 Technical Aids
        └── US5 Reading Cues
                └──────────────┐
        US1 ──> US2 ───────────┤
        US3 ───────────────────┤
        US4 ───────────────────┴──> Polish and release evidence
```

Shared edits to `fixtures/expanded-content.md`, `tests/quality/content-contracts.spec.mjs`,
`tests/quality/visual-baselines.mjs`, and `tests/quality/navigation-performance.spec.mjs` should
be integrated story-by-story even when separate story branches are developed concurrently.

### Within Setup and Foundation

- T001 and T002 run in parallel.
- T003 depends on T001; T004 depends on T002; T003 and T004 then run in parallel.
- T005 depends on T003 and T004; T006 depends on T005.
- After T006, T007, T009, T011, and T013 run in parallel.
- T008 depends on T007; T010 depends on T009; T012 depends on T011.

### Within User Story 1

- T014 creates the source cases.
- T015, T016, and T017 run in parallel after T014 and must fail before implementation.
- T018, T020, and T021 run in parallel after the failing contracts exist.
- T019 depends on T018; T022 depends on T021.
- T023 depends on the finalized T019, T020, and T022 DOM hooks; T024 closes the story.

### Within User Story 2

- T025 creates the layout cases.
- T026 and T027 run in parallel after T025 and must fail before implementation.
- T028 and T029 run in parallel after the failing contracts exist.
- T030 depends on T028; T031 depends on T029.
- T032 and T033 can run in parallel after the shared SFC paths stabilize; T034 closes the story.

### Within User Story 3

- T035 creates the accent sequence.
- T036, T037, and T038 run in parallel after T035 and must fail before implementation.
- T039 depends on the pure contract; T040 depends on T039.
- T041 follows the resolved variable behavior; T042 closes the story.

### Within User Story 4

- T043 creates the technical-aid cases.
- T044 and T045 run in parallel after T043 and must fail before implementation.
- T046, T047, T048, T049, and T050 run in parallel after the failing contracts exist.
- T051 follows the final DOM hooks; T052 closes the story.

### Within User Story 5

- T053 creates standalone and protocol cases.
- T054 and T055 run in parallel after T053 and must fail before implementation.
- T056 and T058 run in parallel after the failing contracts exist.
- T057 depends on T056; T059 closes the story after T057 and T058.

### Final Phase

- T060 and T061 run in parallel after all public behavior stabilizes.
- T062 follows the final scenario definitions.
- T063, T064, and T065 can run in parallel after T062.
- T066 validates maintained build compatibility; T067 is the final release checkpoint.

---

## Parallel Execution Examples

### Setup and Foundation

```text
Parallel batch A:
  T001 — tests/quality/performance-baselines.spec.mjs
  T002 — tests/quality/navigation-performance.spec.mjs

Parallel batch B after T006:
  T007 — fixtures/expanded-content.md
  T009 — tests/quality/configuration.spec.mjs
  T011 — tests/quality/assets.spec.mjs
  T013 — styles/components.css and styles/index.ts
```

### User Story 1

```text
Test batch after T014:
  T015 — tests/quality/content-contracts.spec.mjs
  T016 — tests/quality/accessibility.spec.mjs
  T017 — visual and navigation scenario definitions

Implementation batch after tests fail:
  T018 — setup/callouts.ts
  T020 — components/Figure.vue
  T021 — setup/authors.ts
```

### User Story 2

```text
Test batch after T025:
  T026 — layout contract assertions
  T027 — layout accessibility, visual, and stability scenarios

Implementation batch after tests fail:
  T028 — internals/ClosingLayout.vue
  T029 — internals/ImageTextLayout.vue
```

### User Story 3

```text
Parallel test batch after T035:
  T036 — pure accent resolution
  T037 — browser isolation and protected-brand checks
  T038 — accent visual and navigation scenarios
```

### User Story 4

```text
Parallel implementation batch after T044 and T045 fail:
  T046 — components/Steps.vue
  T047 — components/Timeline.vue
  T048 — components/Tag.vue and components/Badge.vue
  T049 — components/Kbd.vue
  T050 — layouts/code.vue
```

### User Story 5

```text
Parallel batch after T053:
  T054 — task/highlight DOM contracts
  T055 — task/highlight accessibility, visual, and stability scenarios

Parallel implementation batch:
  T056 — setup/task-lists.ts
  T058 — styles/base.css and styles/obsidian.css
```

---

## Implementation Strategy

### MVP First

1. Complete pre-feature measurement (T001–T006).
2. Complete the shared foundation (T007–T013).
3. Complete US1 semantic components (T014–T024).
4. Stop and validate 114/114 callout cases plus standalone Figure/Authors behavior.
5. Demo or review the standalone-component MVP before adding layouts.

### Incremental Delivery

1. **MVP**: Setup + Foundation + US1 exposes callouts, figures, and authors to standalone decks.
2. **Complete P1 slice**: US2 adds closing aliases and both image/text orientations.
3. **Section styling**: US3 adds safe slide-local accents.
4. **Technical communication**: US4 adds code, sequence, status, and keyboard patterns.
5. **Converted-note fidelity**: US5 completes tasks and highlights.
6. **Release readiness**: Polish records reviewed visuals/performance and runs the full gate.

### Parallel Team Strategy

1. Pair the output and navigation measurement tasks, then freeze T006 before any rendering work.
2. Split fixture/build, frame-config, asset-guard, and stylesheet-foundation work after T006.
3. Build US1 first; then assign US2 to the contributor familiar with Figure/Authors internals.
4. Develop US3, US4, and US5 on separate branches after Foundation, coordinating the shared
   fixture and quality-scenario files during integration.
5. Rejoin for T062–T067 so reviewed baselines and final evidence describe one source state.

---

## Notes

- `[P]` marks only tasks with separate write targets after their stated prerequisites.
- Every user-story test task precedes implementation and must demonstrate the missing behavior.
- T006 is a hard gate: never reconstruct or refresh the pre-feature baseline after rendering
  implementation.
- Normal `pnpm run quality` and `pnpm run assets:check` must leave approved baselines unchanged.
- Do not add runtime dependencies, remote resources, parser behavior, or bundled author logos.
- Preserve unrelated user changes and keep generated `.artifacts/quality/` output untracked.
- Complete a logical task or tightly related task group before committing.
