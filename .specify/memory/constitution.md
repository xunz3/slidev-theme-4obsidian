<!--
Sync Impact Report
- Version change: template (unratified) → 1.0.0
- Modified principles:
  - Template Principle 1 → I. Maintainable Preset Architecture
  - Template Principle 2 → II. Tests Are Release Gates
  - Template Principle 3 → III. Consistent Presentation Experience
  - Template Principle 4 → IV. Measured Projection Performance
  - Template Principle 5 → removed (the project defines four principles)
- Added sections:
  - Architecture and Compatibility Constraints
  - Development Workflow and Quality Gates
- Removed sections:
  - None; template placeholders were replaced by project-specific sections
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ .specify/templates/commands/ (directory not present; no command templates to update)
- Runtime guidance reviewed:
  - ✅ README.md (already documents presets, protocol fixtures, and validation commands)
- Follow-up TODOs: none
-->
# Slidev Theme Lilac Constitution

## Core Principles

### I. Maintainable Preset Architecture
All presets MUST use the shared layouts, `SlideFrame`, semantic markup, and design-token
system. A preset MAY change visual expression through scoped tokens, assets, and narrowly
targeted styles; it MUST NOT fork a layout or duplicate component behavior solely to achieve
a visual variation. Theme rendering MUST remain separate from `obsidian-slidev` conversion
logic. Public APIs, component contracts, and non-obvious design decisions MUST be typed or
documented. Changes MUST keep files cohesive, remove dead code, and avoid dependencies or
abstractions without a demonstrated use. This keeps each preset independently expressive
without multiplying maintenance paths.

### II. Tests Are Release Gates
Every behavior change MUST include verification proportional to its risk. At minimum, affected
example or preset decks MUST build successfully. Changes to generated Obsidian markup,
integration styling, or shared presentation behavior MUST also build
`fixtures/obsidian-protocol.md`. Visual changes MUST be reviewed in every affected preset,
in both light and dark modes where supported, at the canonical 16:9 viewport; the review MUST
cover overflow, clipping, contrast, typography, and representative layouts. Bug fixes MUST add
a reproducible fixture or automated regression test when feasible. Required checks MUST pass
before merge; a skipped check requires a documented reason and follow-up owner.

### III. Consistent Presentation Experience
The stable configuration surface is `themeConfig.presentation`, with documented per-slide
overrides. All presets MUST accept the same supported configuration keys, layouts, ordinary
Slidev Markdown, and `.obsidian-slidev-*` semantic contract. Defaults MUST produce a complete,
legible deck without preset-specific author work. Shared content MUST preserve hierarchy,
meaning, layout behavior, and interaction across presets even when visual identity differs.
User-visible additions MUST define accessible contrast, readable projection sizing, keyboard
and focus behavior when interactive, overflow behavior, and bilingual typography where
applicable. Intentional compatibility changes require migration notes and a constitutionally
reviewed version change.

### IV. Measured Projection Performance
Performance MUST be evaluated for changes to CSS, fonts, assets, components, or rendering.
Plans MUST state a measurable budget or baseline for affected output, and reviews MUST record
before-and-after evidence. Production build output MUST NOT grow by more than 5% in total or
in the affected bundle without documented justification. Any new individual shipped asset
larger than 250 KiB MUST be optimized or explicitly justified. Preset selection MUST reuse the
shared render tree and MUST NOT duplicate content or introduce work proportional to the number
of available presets. Slides MUST remain responsive during navigation and MUST avoid layout
shift caused by theme-owned media or fonts. Performance regressions are release blockers unless
the approved tradeoff and mitigation are recorded.

## Architecture and Compatibility Constraints

- The theme owns presentation and rendering; `obsidian-slidev` owns Obsidian Markdown
  conversion.
- `SlideFrame`, shared layouts, semantic class names, and `--presentation-*` tokens are
  compatibility surfaces. Breaking changes require migration guidance.
- Presets MUST support standalone Slidev use and optional `obsidian-slidev` integration.
- The supported Node.js version and package API MUST remain declared in `package.json`.
- New runtime dependencies, remote resources, or bundled brand assets MUST include rationale,
  license compatibility, fallback behavior, and size impact.

## Development Workflow and Quality Gates

1. Specifications MUST define independent user scenarios plus measurable UX, compatibility,
   accessibility, and performance outcomes.
2. Plans MUST complete the Constitution Check before implementation and repeat it after design.
   Any exception MUST name the violated rule, why it is necessary, and the rejected simpler
   alternative.
3. Tasks MUST include implementation, relevant build or fixture checks, visual review,
   documentation, and performance measurement; tests are not optional for behavior changes.
4. Reviews MUST verify the public API and semantic boundary, inspect affected presets and
   modes, and confirm that required commands pass.
5. Releases MUST update user-facing documentation for configuration, layout, preset, or
   compatibility changes and MUST NOT ship with unexplained failed or skipped gates.

## Governance

This constitution supersedes conflicting repository practices and generated template guidance.
Amendments require a documented proposal, rationale, impact analysis, and maintainer approval.
An amendment MUST update affected templates and migration guidance in the same change.

Constitution versions follow semantic versioning: MAJOR for removal or incompatible
redefinition of a principle or governance rule, MINOR for a new principle or materially
expanded obligation, and PATCH for clarifications that do not change required behavior.

Every feature plan and code review MUST demonstrate compliance with the current constitution.
Reviewers MUST block unresolved violations. Approved exceptions MUST be explicit, narrowly
scoped, time-bounded where possible, and recorded in the plan's Complexity Tracking table.
The constitution and its dependent templates MUST be reviewed whenever the theme's public API,
preset architecture, testing strategy, or release process changes.

**Version**: 1.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-23
