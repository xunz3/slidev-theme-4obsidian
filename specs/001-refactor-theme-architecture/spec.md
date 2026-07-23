# Feature Specification: Refactor Theme Architecture

**Feature Branch**: Not created (no branch hook configured)

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Refactor the theme following the code review findings for
preset isolation, asset performance, configuration consistency, shared-frame maintainability,
and regression testing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Preset Overrides (Priority: P1)

As a presentation author, I can select a global visual preset and override it on individual
slides, knowing that every affected slide uses only the selected preset's visual rules while
retaining the same content and layout behavior.

**Why this priority**: Per-slide preset selection is a documented public capability. Style
leakage makes that capability unreliable and can produce inconsistent presentations.

**Independent Test**: Create a deck with each supported global preset and override individual
slides to each other preset. Verify headings, tables, callouts, code, chrome, and branded
decoration against decks where the same preset is selected globally.

**Acceptance Scenarios**:

1. **Given** the default preset is selected globally, **When** a slide selects the UCAS or ICT
   preset, **Then** its visible presentation matches the corresponding globally selected preset
   for the same content and layout.
2. **Given** UCAS or ICT is selected globally, **When** a slide selects the default preset,
   **Then** no global brand-specific styling or decoration remains on that slide.
3. **Given** any supported preset combination, **When** the presentation changes between light
   and dark modes, **Then** the selected slide preset remains legible and visually isolated.

---

### User Story 2 - Lightweight Theme Delivery (Priority: P2)

As a presenter or deck publisher, I receive optimized theme assets that preserve the approved
brand appearance without carrying non-rendering metadata or avoidable file weight.

**Why this priority**: Oversized brand assets increase deployment size and work against fast,
portable presentations, especially for decks that do not use every preset.

**Independent Test**: Compare the approved brand assets and representative rendered slides
before and after optimization, then measure the shipped asset sizes and total presentation
output.

**Acceptance Scenarios**:

1. **Given** an existing presentation that uses UCAS branding, **When** optimized assets are
   used, **Then** the emblem and wordmark remain visually equivalent at presentation scale.
2. **Given** a presentation using only the default preset, **When** it is prepared for
   distribution, **Then** avoidable metadata from unused brand artwork does not inflate the
   delivered output.
3. **Given** any supported preset deck, **When** slides load and change, **Then** theme-owned
   branding does not introduce visible layout shift.

---

### User Story 3 - Safer Theme Maintenance (Priority: P3)

As a theme maintainer, I can change supported presentation settings or evolve preset branding
through clearly owned responsibilities and receive fast feedback when compatibility, visual
behavior, or performance regresses.

**Why this priority**: Consolidated rules and repeatable checks reduce drift and make future
preset work safer, but they follow correction of the current user-visible preset problem.

**Independent Test**: Review each supported presentation option and confirm it has one
authoritative definition, then intentionally introduce representative configuration, visual,
and size failures and verify that the quality checks report them.

**Acceptance Scenarios**:

1. **Given** a supported presentation option, **When** a maintainer inspects its accepted
   values, default, and normalization behavior, **Then** those rules have one authoritative
   source and are applied consistently at deck and slide scope.
2. **Given** a proposed theme change, **When** required quality checks run, **Then** failures in
   preset isolation, supported deck builds, visual consistency, or asset budgets block release.
3. **Given** a new preset-specific decoration, **When** it is introduced, **Then** shared
   content, metadata, and chrome behavior do not require a parallel implementation.

### Edge Cases

- A slide specifies an unsupported preset, density, or chrome value.
- Boolean-like presentation settings arrive as native booleans or supported textual values.
- A deck has no theme configuration and relies entirely on documented defaults.
- A slide combines a local preset override with local density, chrome, header, footer, and
  page-number overrides.
- The same content contains long headings, wide tables, code, generated callouts, media, and
  bilingual text.
- A brand asset is displayed as a small chrome mark, a cover lockup, or a large watermark.
- A presentation is built standalone rather than from Obsidian-generated markup.
- A visual check cannot run in the expected environment; the release records the skipped gate,
  reason, owner, and follow-up instead of silently passing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A slide-level preset selection MUST determine all preset-specific visual behavior
  within that slide, regardless of the globally selected preset.
- **FR-002**: The refactoring MUST preserve all documented layouts, presentation configuration
  keys, per-slide overrides, ordinary Slidev Markdown behavior, and generated Obsidian semantic
  markup.
- **FR-003**: Every supported preset, density, chrome, header, footer-author, page-number, and
  accent option MUST have one authoritative definition for accepted values, defaults, and
  normalization behavior.
- **FR-004**: Shared presentation structure, metadata display, and chrome behavior MUST remain
  common across presets; preset-specific visual identity MUST remain independently changeable.
- **FR-005**: Existing brand artwork MUST remove non-rendering metadata and other avoidable
  weight while preserving approved visual appearance and transparent-background behavior.
- **FR-006**: Required verification MUST cover supported builds, global-to-local preset
  combinations, representative layouts, light and dark modes, accessibility checks, and
  performance budgets.
- **FR-007**: A reproducible regression scenario MUST protect the corrected global-default to
  local-UCAS/ICT override behavior.
- **FR-008**: Quality checks MUST report actionable failures and MUST be runnable by maintainers
  through documented project commands.
- **FR-009**: The refactoring MUST remove obsolete or duplicate presentation rules and MUST NOT
  introduce a new runtime dependency without documented justification.
- **FR-010**: Any unavoidable public behavior change MUST include migration guidance; otherwise,
  existing decks MUST require no content or configuration changes.

### Experience and Compatibility Requirements *(mandatory)*

- **UX-001**: Identical content using the same selected preset MUST preserve hierarchy,
  spacing behavior, brand treatment, and chrome whether the preset is global or slide-local.
- **UX-002**: Representative slides MUST remain legible at the canonical 16:9 presentation
  viewport with no new clipping, unintended overflow, contrast failure, or typography
  regression.
- **UX-003**: Existing keyboard navigation, focus visibility, and interactive table-of-contents
  behavior MUST remain unchanged and operable.
- **COMP-001**: `themeConfig.presentation`, documented per-slide overrides, all current layouts,
  ordinary Slidev Markdown, and `.obsidian-slidev-*` markup MUST remain compatible.

### Performance Requirements *(mandatory)*

- **PERF-001**: The two currently oversized UCAS emblem and horizontal wordmark assets MUST
  decrease by at least 80% in combined raw size, and each resulting shipped brand asset MUST
  be no larger than 250 KiB unless an explicit exception is approved.
- **PERF-002**: Before-and-after output measurements MUST be recorded for the example deck, the
  default-only preset deck, and the generated-markup protocol deck. Total output MUST NOT grow
  by more than 5% in any measured deck.
- **PERF-003**: Theme-owned assets and preset changes MUST introduce no observable layout shift
  during initial display or slide navigation.

### Key Entities

- **Presentation Configuration**: The supported global settings, per-slide overrides, accepted
  values, defaults, and fallback behavior.
- **Preset**: A visual identity that shares the theme's layouts and semantic behavior while
  owning its tokens, brand assets, and narrowly scoped visual rules.
- **Slide Frame**: The shared presentation structure responsible for content placement,
  metadata, header, footer, and page information.
- **Brand Asset**: Approved preset artwork with a visual identity, display roles, file size,
  transparency behavior, and licensing context.
- **Regression Scenario**: A repeatable combination of global preset, local override, mode,
  layout, and representative content with an expected outcome.

### Out of Scope

- Adding, removing, or redesigning a visual preset.
- Changing the documented configuration surface or semantic markup contract.
- Changing Obsidian Markdown conversion behavior.
- Redesigning existing layouts or brand identities.
- Optimizing third-party presentation runtime assets that are not owned by this theme.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 9 global-preset to slide-preset combinations produce the same visible result
  as the equivalent globally selected target preset for representative shared content.
- **SC-002**: All affected preset and protocol presentations complete required verification
  with zero unexplained build, visual, accessibility, or interaction regressions.
- **SC-003**: The combined raw size of the two oversized UCAS assets is reduced by at least 80%,
  with no theme-owned brand asset exceeding 250 KiB without an approved exception.
- **SC-004**: Existing standalone and Obsidian-generated sample decks work without author
  changes in 100% of documented layouts and configuration scenarios.
- **SC-005**: Maintainers can identify one authoritative rule set for every public presentation
  option, with zero conflicting duplicate definitions found during review.
- **SC-006**: The complete required quality-check suite finishes within 5 minutes on the
  maintained development environment and reports a clear cause for every intentional failure.
- **SC-007**: Before-and-after visual review finds no perceptible change to approved emblem,
  wordmark, transparency, or brand color appearance at normal presentation scale.

## Assumptions

- This is a compatibility-preserving internal refactoring; no new user-facing theme capability
  or preset is required.
- The current documented configuration, layouts, fixtures, and public semantic classes define
  the compatibility baseline.
- Embedded color-profile metadata in the oversized artwork is not required to preserve approved
  on-screen brand colors, subject to visual verification.
- Existing representative decks provide sufficient content coverage when expanded with an
  explicit preset-isolation regression scenario.
- The maintained development environment can perform production builds and browser-based
  visual and interaction checks.
- Official brand artwork may be optimized for delivery without changing its shape, wording,
  proportions, or licensing status.
