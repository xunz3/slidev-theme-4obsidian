# Preset Design QA

Date: 2026-07-19

This pass treats the three presets as one research-presentation system with three distinct voices. `default` is selected when no override is provided:

- `default`: paper-inspired, serif display, booktabs, ink-blue section fields.
- `ucas`: humanist institutional, serif display, official UCAS identity assets.
- `ict`: technical systems, sans display, mono labels, navy/cyan signature surfaces.

## Visual evidence

- Light, normal-density contact sheets: `default-contact-sheet.png`, `ucas-contact-sheet.png`, and `ict-contact-sheet.png`.
- Source decks: `fixtures/default-preset.md`, `fixtures/ucas-preset.md`, and `fixtures/ict-preset.md`.
- Export viewport: 1960 × 1104, 16:9.

The light sheets cover cover, default, TOC where available, section, two-column evidence, code/callout, quote, statement, references, and center layouts.

## Checks completed

- `pnpm run build:default`
- `pnpm run build:ucas`
- `pnpm run build:ict`
- Light PNG exports for all three preset fixtures.
- Font requests contain only Source Sans 3, Source Serif 4, and JetBrains Mono, with real roman and italic faces at 400/500/600/700.
- CSS font weights are limited to the loaded 400/500/600/700 set.
- Dark section surfaces use dedicated `section` / `on-section` colors instead of a bright accent as a background.
- UCAS and ICT dark title, subtitle, TOC, quote, and statement colors use high-contrast semantic brand tokens.
- Repeated non-cover brand marks are decorative for assistive technology.
- Static TOC rows are no longer focusable buttons, and long TOC labels can wrap to two lines.
- `git diff --check` passes.

## Known limits

- The five configured web families require network access unless they are preloaded or self-hosted for offline venues.
- Compact and relaxed densities build from the same token system but are not included in the contact sheets.
- The screenshots support visual review; they do not claim full accessibility conformance or replace a projector test in the target room.

final result: passed
