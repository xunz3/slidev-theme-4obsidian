<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Modified principles:
  - II. Tests Are Release Gates → proportional automated and maintainer-owned review, with no
    default external reviewer cohort
  - III. Consistent Presentation Experience → explicit pre-1.0 evolution policy
  - IV. Measured Projection Performance → IV. Stable Projection Behavior
- Added sections: none
- Removed sections: mandatory build/output/navigation performance budgets and measurements
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ .specify/templates/commands/ (directory not present; no command templates to update)
- Runtime guidance reviewed:
  - ✅ README.md
- Follow-up TODOs: none
-->
# Obsidian Theme Lilas Constitution

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
before merge; a skipped check requires a documented reason and follow-up owner. A fixed
reviewer count, user-study threshold, or independently coordinated human cohort MUST NOT be
invented as a default gate. Human studies are tasks only when the maintainer explicitly asks
for them and identifies who will coordinate them.

### III. Consistent Presentation Experience
The stable configuration surface is `themeConfig.presentation`, with documented per-slide
overrides. All presets MUST accept the same supported configuration keys, layouts, ordinary
Slidev Markdown, and `.obsidian-slidev-*` semantic contract. Defaults MUST produce a complete,
legible deck without preset-specific author work. Shared content MUST preserve hierarchy,
meaning, layout behavior, and interaction across presets even when visual identity differs.
User-visible additions MUST define accessible contrast, readable projection sizing, keyboard
and focus behavior when interactive, overflow behavior, and bilingual typography where
applicable. Before package version 1.0, duplicate, undocumented, or misleading public paths MAY
be removed without a compatibility shim. User-visible removals MUST have a concise migration
note and one documented canonical replacement when one exists.

### IV. Stable Projection Behavior
Theme-owned media, fonts, and async rendering MUST reserve stable geometry and MUST NOT cause
post-visibility layout shift in maintained fixtures. Preset selection MUST reuse the shared
render tree and MUST NOT duplicate rendered content solely because more presets exist. New
individual shipped assets larger than 250 KiB MUST be optimized or explicitly justified.
Build duration, generated output size, bundle size, and navigation timing are not default
requirements or release gates. They MUST be measured only when the user or feature
specification explicitly makes performance an outcome; otherwise plans and tasks MUST omit
performance baselines, raw-sample retention, and benchmark update workflows.

## Architecture and Compatibility Constraints

- The theme owns presentation and rendering; `obsidian-slidev` owns Obsidian Markdown
  conversion.
- `SlideFrame`, shared layouts, semantic class names, and `--presentation-*` tokens define the
  current canonical surface. Pre-1.0 removals follow the migration-note rule in Principle III.
- Presets MUST support standalone Slidev use and optional `obsidian-slidev` integration.
- The supported Node.js version and package API MUST remain declared in `package.json`.
- New runtime dependencies, remote resources, or bundled brand assets MUST include rationale,
  license compatibility, fallback behavior, and size impact.

## Development Workflow and Quality Gates

1. Specifications MUST define independent user scenarios plus measurable UX, compatibility,
   and accessibility outcomes. Performance outcomes are included only when explicitly in scope.
2. Plans MUST complete the Constitution Check before implementation and repeat it after design.
   Any exception MUST name the violated rule, why it is necessary, and the rejected simpler
   alternative.
3. Tasks MUST include implementation, relevant build or fixture checks, visual review, and
   documentation; tests are not optional for behavior changes. Tasks MUST NOT invent external
   reviewer cohorts or performance baselines absent an explicit specification requirement.
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

**Version**: 2.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-26
