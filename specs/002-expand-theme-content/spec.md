# Feature Specification: Expand Theme Content

**Feature Branch**: Not created (no branch hook configured)

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "Expose the theme's existing Obsidian presentation styles to
standalone deck authors; add reusable callout, figure, and author-card components; add closing
and image-and-text layouts; allow slide-level accent overrides; add common code, process,
status, and keyboard authoring aids; and complete task-list and highlighted-text styling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reuse Styled Semantic Content (Priority: P1)

As a standalone Slidev author, I can add an Obsidian-style callout, a captioned figure, or the
deck's author details through concise authoring interfaces, without installing the
`obsidian-slidev` conversion plugin or writing raw figure and card markup.

**Why this priority**: This exposes presentation capabilities that the theme already owns but
that ordinary Markdown authors cannot currently reach. It is the highest-value gap because it
removes repeated manual markup from common academic slides.

**Independent Test**: Build a standalone deck that uses all 19 supported callout types, a
captioned image, and author metadata containing both strings and structured records. Verify the
content in every supported preset and mode without enabling the conversion plugin.

**Acceptance Scenarios**:

1. **Given** a standalone deck with no Obsidian conversion plugin, **When** an author adds a
   typed callout with a title and formatted body content, **Then** it has the same meaning and
   preset-specific visual treatment as the equivalent generated Obsidian callout.
2. **Given** a local or remote image source, caption, and accessible description, **When** an
   author adds a figure, **Then** the slide shows semantic image-and-caption content with the
   theme's established media spacing, radius, and shadow treatment.
3. **Given** deck-level author metadata, **When** an author places the author-card collection on
   a closing or acknowledgement slide, **Then** every valid author is shown once with available
   name, institution, and email details and no empty labels.

---

### User Story 2 - Compose Common Academic Slides (Priority: P1)

As an academic presenter, I can create a polished closing slide and either orientation of a
figure-and-text slide without adapting a generic centered or two-column layout.

**Why this priority**: Closing slides and figure-and-text pages occur in most academic talks.
Dedicated layouts reduce authoring effort and produce more consistent alignment, spacing, and
projection behavior.

**Independent Test**: Create closing slides through both documented closing layout names and
create image-left and image-right slides with the same figure and body content. Verify optional
contact and logo content, mirrored placement, and graceful behavior when optional content is
omitted.

**Acceptance Scenarios**:

1. **Given** a final message, **When** an author selects either the `end` or `thanks` layout,
   **Then** the message is presented as a complete closing slide and may include author contact
   details and an author-supplied logo.
2. **Given** image, caption, and text content, **When** an author selects `image-left`, **Then**
   the figure occupies the left media region and the text occupies the right content region
   without raw figure markup.
3. **Given** the same content, **When** an author selects `image-right`, **Then** the placement is
   mirrored while hierarchy, media treatment, reading order, and available space remain
   equivalent.

---

### User Story 3 - Change Accent by Section (Priority: P2)

As a deck author, I can override the presentation accent on an individual slide so that
sections can have distinct emphasis colors without splitting the talk into separate decks.

**Why this priority**: The existing accent control is useful but deck-wide only. Slide-level
scope completes the established configuration model and supports section-level visual
organization.

**Independent Test**: Set a deck accent, override it on one slide, follow it with a slide that
has no override, and repeat this in every preset and supported mode.

**Acceptance Scenarios**:

1. **Given** a valid deck accent and a different valid slide accent, **When** the overridden
   slide is displayed, **Then** its accent-aware content uses the slide value while protected
   institutional identity colors remain unchanged.
2. **Given** an accented slide followed by a slide with no local accent, **When** navigation
   advances, **Then** the following slide returns to the deck or preset accent with no color
   leakage.
3. **Given** an empty or unsupported local accent value, **When** the slide is displayed,
   **Then** the next valid deck or preset value is used.

---

### User Story 4 - Explain Technical Work Clearly (Priority: P3)

As a technical or research presenter, I can show a large code example, an ordered process, a
chronological research path, compact status labels, and keyboard shortcuts using theme-native
presentation patterns.

**Why this priority**: These additions make technical talks easier to scan and author, but
authors can already approximate them with existing layouts and Markdown.

**Independent Test**: Build one slide for each of the `code`, `Steps`, `Timeline`, `Tag`,
`Badge`, and `Kbd` authoring patterns, including long and bilingual content, and verify
projection legibility and document reading order.

**Acceptance Scenarios**:

1. **Given** a title and one primary code sample, **When** an author selects the `code` layout,
   **Then** the title remains visible and the code uses the full available content width without
   overlapping slide chrome.
2. **Given** an ordered set of process items or dated events, **When** an author uses `Steps` or
   `Timeline`, **Then** item order and relationships are visually clear and remain meaningful in
   linear reading order.
3. **Given** a status, category, or keyboard sequence, **When** an author uses `Tag`, `Badge`, or
   `Kbd`, **Then** the content is compact, legible, and semantically distinguishable from
   ordinary body text.

---

### User Story 5 - Preserve Obsidian Reading Cues (Priority: P3)

As an author presenting converted Obsidian notes, I can distinguish checked and unchecked
tasks and see highlighted passages rendered consistently with the rest of the theme.

**Why this priority**: These are small but visible gaps in the theme's responsibility for
rendering markup that the conversion plugin or Markdown pipeline already produces.

**Independent Test**: Present checked, unchecked, and nested task lists plus highlighted text
inside representative prose in every preset and mode, without changing conversion behavior.

**Acceptance Scenarios**:

1. **Given** checked and unchecked task-list markup, **When** the slide is displayed, **Then**
   both states are immediately distinguishable, aligned with their labels, and do not appear
   editable when they are presentation-only.
2. **Given** generated highlighted-text markup, **When** the slide is displayed, **Then** the
   marked phrase is visibly emphasized with readable text and sufficient contrast.
3. **Given** highlight-like characters inside code, **When** the slide is displayed, **Then**
   code content is not restyled as prose highlighting by the theme.

### Edge Cases

- A callout has an omitted, empty, or unsupported type; an omitted title; a very long title; or
  body content containing lists, code, links, and multiple paragraphs.
- A figure has no caption, an omitted accessible description, an explicitly decorative
  description, an unavailable source, or an unusually tall, wide, or transparent image.
- Author metadata is absent, a single string, a mixed list of strings and records, partially
  populated, duplicated intentionally, or long enough to require wrapping.
- A closing slide omits contact details or a logo, or receives a logo without an accessible
  description.
- An image-and-text slide has a missing image, a long caption, long bilingual prose, or content
  that approaches the 16:9 canvas boundary.
- A slide accent is empty, invalid, equal to the deck accent, low contrast in the active mode,
  or followed by a slide using another preset or no local override.
- A code sample has long unbroken lines, more lines than fit vertically, annotations, or no
  title.
- A steps or timeline collection has zero, one, or many items, or item labels vary greatly in
  length.
- A tag, badge, or keyboard sequence contains long text, multiple words, symbols, or bilingual
  characters.
- Task lists are nested, contain wrapped labels, mix checked and unchecked items, or appear
  inside another list.
- Highlighted text appears next to links, inline code, emphasis, or on a preset-specific
  colored surface.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All new public authoring interfaces MUST work in ordinary Slidev Markdown without
  requiring the `obsidian-slidev` conversion plugin.
- **FR-002**: `Callout` MUST support the 19 existing variants: `note`, `info`, `todo`,
  `abstract`, `summary`, `tip`, `success`, `check`, `warning`, `caution`, `attention`,
  `danger`, `error`, `failure`, `question`, `help`, `faq`, `quote`, and `cite`.
- **FR-003**: `Callout` MUST preserve a clear title-and-body hierarchy, accept formatted body
  content, provide a human-readable default title when one is not supplied, and fall back to a
  neutral callout when the requested type is empty or unsupported.
- **FR-004**: `Figure` MUST accept an image source and optional caption, support a separate
  accessible description, preserve an explicit decorative-image choice, and expose the same
  semantic media structure and visual treatment used by existing generated image figures.
- **FR-005**: When a figure has no separate accessible description, a non-empty caption MUST
  provide fallback descriptive text; an unavailable source MUST leave descriptive text
  available and MUST NOT destabilize the surrounding layout.
- **FR-006**: `Authors` MUST read the deck's existing root-level `authors` metadata by default
  and support both string entries and records containing `name`, `institution`, and `email`.
- **FR-007**: `Authors` MUST render one card per valid entry, omit unavailable fields without
  empty placeholders, make valid email addresses actionable, preserve declared author order,
  and render no empty collection when no valid authors exist.
- **FR-008**: The theme MUST provide `end` and `thanks` as equivalent closing-layout entry
  points with a primary closing message, optional contact or author details, and an optional
  author-supplied logo.
- **FR-009**: The theme MUST provide mirrored `image-left` and `image-right` layouts that let
  authors supply an image, accessible description, optional caption, and body content without
  writing raw figure markup.
- **FR-010**: Closing and image-and-text layouts MUST remain complete and balanced when optional
  metadata is omitted, and MUST preserve meaningful reading order independent of visual
  placement.
- **FR-011**: A valid slide-level `accent` value MUST override the deck-level accent for that
  slide only; a missing, empty, or invalid slide value MUST fall back to the next valid deck or
  preset value.
- **FR-012**: A local accent MUST affect the same documented content and chrome roles as the
  existing deck accent and MUST NOT recolor protected official logo or institutional identity
  artwork.
- **FR-013**: The theme MUST provide a `code` layout with a title region and one primary code
  region that uses the full available content width, contains horizontal overflow, and avoids
  overlap with theme chrome.
- **FR-014**: `Steps` MUST present an ordered process with visibly distinct sequence markers,
  while `Timeline` MUST present chronologically ordered events with clear labels and
  relationships.
- **FR-015**: `Steps` and `Timeline` MUST preserve source order and meaning when visual
  decoration is unavailable, and MUST handle zero, one, or many items without broken
  presentation chrome.
- **FR-016**: `Tag` and `Badge` MUST provide compact treatments for category and status content
  respectively, and MUST remain distinguishable without relying on color alone.
- **FR-017**: `Kbd` MUST identify keyboard input semantically and support both single keys and
  multi-key sequences without making them appear interactive.
- **FR-018**: Generated task-list markup MUST show aligned, visually distinct checked and
  unchecked states, including nested and wrapped items, while retaining its presentation-only
  interaction state.
- **FR-019**: Generated highlighted-text markup MUST receive theme-owned emphasis styling that
  remains distinct from links, selection, and inline code and does not alter code blocks.
- **FR-020**: All additions MUST use the same shared content behavior across presets; a preset
  MAY vary visual expression but MUST NOT require a separate authoring contract.
- **FR-021**: User documentation and representative examples MUST cover every new component,
  layout, the slide-level accent precedence rule, task lists, and highlighted text.
- **FR-022**: Verification MUST include standalone Markdown, existing generated Obsidian
  markup, all supported presets, supported light and dark modes, representative bilingual
  content, and the canonical 16:9 presentation viewport.
- **FR-023**: The feature MUST NOT change Obsidian Markdown conversion responsibilities, and
  existing generated callout, media, task-list, and highlight markup MUST remain accepted.
- **FR-024**: Existing decks that do not use the additions MUST require no authoring or
  configuration changes.

### Experience and Compatibility Requirements *(mandatory)*

- **UX-001**: Every added component and layout MUST preserve consistent hierarchy, spacing,
  and meaning across all supported presets while allowing each preset's established visual
  identity.
- **UX-002**: Representative short, long, and bilingual content MUST remain legible at the
  canonical 16:9 viewport with no unintended clipping, overlap, or horizontal slide overflow;
  long content MUST have a documented containment or authoring fallback.
- **UX-003**: Text, icons, status distinctions, accent-aware surfaces, task states, and
  highlighted passages MUST meet the project's accessible contrast expectations in every
  supported mode and MUST NOT rely on color alone where meaning is conveyed.
- **UX-004**: Source order MUST remain logical for closing, image-and-text, steps, and timeline
  content. Actionable email links MUST remain keyboard reachable with visible focus, while
  non-interactive labels, keycaps, and presentation-only task boxes MUST not create misleading
  focus targets.
- **COMP-001**: Existing `themeConfig.presentation` behavior, documented per-slide overrides,
  ordinary Slidev Markdown, and the `.obsidian-slidev-*` semantic contract MUST remain
  compatible. The `accent` option is the sole configuration item whose documented scope
  expands from deck-only to deck-and-slide.
- **COMP-002**: Component-authored callouts and figures MUST be semantically and visually
  equivalent to their generated Obsidian counterparts, without requiring changes to existing
  generated markup.
- **COMP-003**: All new component and layout names, accepted content, defaults, fallbacks, and
  accessibility expectations MUST be documented as public authoring contracts.

### Performance Requirements *(mandatory)*

- **PERF-001**: Before-and-after production output measurements MUST be recorded for the
  representative standalone deck and generated-markup protocol deck; total output and any
  affected shipped bundle MUST NOT grow by more than 5% without an approved justification.
- **PERF-002**: At the maintained 16:9 review viewport, the 95th-percentile interval from a
  navigation input to a visually stable affected slide MUST remain within 100 milliseconds and
  MUST NOT regress by more than 10% from the recorded baseline.
- **PERF-003**: Theme-owned figures, optional logos, components, and layouts MUST introduce no
  observable layout shift after the slide becomes visible.
- **PERF-004**: Any new individual theme-owned shipped asset larger than 250 KiB MUST be
  optimized or explicitly justified; author-supplied deck media is excluded from this budget.

### Key Entities

- **Callout**: A typed semantic notice with one of 19 supported meanings, an optional authored
  title, a default title, formatted body content, and a neutral fallback.
- **Figure**: An image presentation unit with a source, accessible description, optional
  caption, decorative state, and stable media semantics.
- **Author Record**: One declared contributor represented by a string or by available name,
  institution, and email fields, in deck-declared order.
- **Closing Slide**: A final-slide presentation containing a primary message and optional author
  details, contact information, and logo.
- **Image-and-Text Slide**: A mirrored two-region presentation containing one primary figure
  and one content narrative with a logical source order.
- **Accent Override**: A validated slide color preference with explicit local, deck, and preset
  fallback precedence and a defined set of affected presentation roles.
- **Sequence Item**: One ordered step or timeline event with a marker, label, and body content.
- **Status Label**: Compact tag or badge content whose category or state remains identifiable
  without color alone.

### Out of Scope

- Adding new callout meanings beyond the existing 19 variants.
- Changing how the `obsidian-slidev` plugin parses or converts Obsidian Markdown.
- Adding parsing support for `==highlight==` where the active Markdown pipeline does not
  already generate highlight markup.
- Making rendered task-list checkboxes editable or persisting task state from a presentation.
- Bundling, downloading, licensing, or managing logos supplied by deck authors.
- Supporting video, audio, or embedded web content through the image-only `Figure` interface.
- Redesigning existing presets, layouts, brand identities, or the overall configuration model.
- Adding interactive workflow editing, timeline animation, or diagram-authoring behavior to
  `Steps` or `Timeline`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authors can reproduce 100% of the representative standalone callout, captioned
  figure, author-card, closing-slide, and image-and-text tasks without raw HTML or the
  conversion plugin.
- **SC-002**: All 19 callout variants pass the visual and semantic review matrix in all three
  supported presets and both supported modes, for 114 successful variant/preset/mode checks.
- **SC-003**: Both closing layout names and both image-and-text orientations pass representative
  short, long, and bilingual content review in every supported preset and mode with zero
  unintended clipping, overlap, or reading-order failures.
- **SC-004**: In every supported preset and mode, a locally accented slide uses its valid local
  value, the immediately following unaccented slide returns to its expected fallback, and all
  invalid-value cases resolve without visible leakage.
- **SC-005**: Representative code, steps, timeline, tag, badge, keyboard, task-list, and
  highlighted-text slides produce zero critical or serious accessibility findings and zero
  distinctions that depend on color alone.
- **SC-006**: Existing standalone and generated-markup fixture decks complete all required
  checks with no author changes and zero unexplained visual, semantic, interaction, or
  compatibility regressions.
- **SC-007**: A maintainer following the English documentation can create the five P1 authoring
  examples in 10 minutes or less, and at least 90% of the documented authoring tasks are
  completed correctly on the first attempt.
- **SC-008**: Measured production output growth remains at or below 5%, no new unjustified
  theme-owned asset exceeds 250 KiB, and affected slide navigation meets the stated stability
  and responsiveness budget.
- **SC-009**: Every new public authoring interface has at least one standalone example, one
  documented fallback or edge case, and a recorded review in each applicable preset and mode.

## Assumptions

- The roadmap's P0, P1, and P2 groups map to specification priorities P1, P2, and P3
  respectively; all groups remain in scope, but P1 forms the independently useful first
  delivery slice.
- The currently supported preset set is `default`, `ucas`, and `ict`; mode-specific review
  applies wherever each preset supports light and dark presentation.
- The existing 19 callout names and their semantic color groups are the canonical compatibility
  set for this feature.
- `Authors` uses root-level deck metadata already accepted by the theme. Explicit per-instance
  author data, author editing, and data persistence are not required for the first delivery.
- `end` and `thanks` are equivalent names for one closing experience rather than independently
  designed layouts.
- Image-and-text layouts use one primary image. Authors may provide it through the documented
  slide metadata or the `Figure` authoring interface, but both orientations expose the same
  capabilities.
- A figure caption is a reasonable fallback accessible description when no separate
  description is supplied; authors can explicitly mark decorative images with an empty
  description.
- Optional closing-slide logos are local or author-controlled presentation assets and include
  author-provided accessible text when they communicate information.
- Steps, timelines, tags, badges, and keycaps are static presentation content; no interaction
  or motion is required.
- Task-list markup produced for presentations is non-editable by default, and the theme's
  responsibility is to communicate state rather than change it.
- Feature documentation and specification artifacts are written in English, while authored
  presentation content may be English, Chinese, or bilingual.
- The existing semantic callout and media styling, normalized author metadata, shared slide
  frame, presentation tokens, preset system, and representative fixture decks remain available
  dependencies.
