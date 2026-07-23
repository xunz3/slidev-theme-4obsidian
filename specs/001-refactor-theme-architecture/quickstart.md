# Quickstart: Validate the Theme Architecture Refactor

## Purpose

Use this guide after implementation to prove the feature works end to end. It validates the
public configuration contract, resolved preset canvas, all required builds, browser behavior,
brand assets, accessibility, interaction, layout stability, output budgets, and suite timing.

Normative details:

- [Presentation configuration contract](contracts/presentation-configuration.md)
- [Preset/frame contract](contracts/preset-frame.md)
- [Quality-gate contract](contracts/quality-gates.md)
- [Data model](data-model.md)

## Prerequisites

- Repository checkout containing the feature implementation
- Node.js `>=20.19.0`
- pnpm compatible with the checked-in lockfile
- Chromium installed for the pinned `playwright-chromium`
- Access to the fonts needed by the canonical visual environment
- A working directory where ignored `.artifacts/quality/` outputs may be created

From the repository root:

```bash
pnpm install --frozen-lockfile
```

Expected:

- Installation completes without changing `pnpm-lock.yaml`.
- No new runtime dependency is added.
- `axe-core` is present only under development dependencies.

## 1. Run the Complete Release Gate

```bash
pnpm run quality
```

Expected:

- Exit status `0`.
- The example, default, UCAS, ICT, protocol, and generated matrix decks build.
- All 18 light/dark global→local preset comparisons pass.
- All eleven layouts pass overflow, clipping, broken-image, and console checks.
- Axe, keyboard navigation, TOC activation, and focus checks pass.
- Brand render and byte budgets pass.
- Example/default-only/protocol output budgets pass.
- No theme-owned layout shift is reported.
- Total duration is less than 300 seconds.

If the command fails, start with `.artifacts/quality/summary.json`. Each failure must identify
the deck/case, expected and observed values, and any retained log, screenshot, diff, or Axe
artifact.

## 2. Verify the Public Configuration Contract

The aggregate gate includes these cases; review its configuration results to confirm:

1. A deck with no `themeConfig.presentation` resolves to:
   default preset, normal density, auto chrome, header off, footer authors on, and page number
   on.
2. Each documented slide key overrides a valid deck value.
3. Invalid slide input is ignored and inherits the valid deck value.
4. Invalid deck input uses the documented default.
5. Native booleans and textual `true`/`false`/`on`/`off` normalize consistently.
6. Local `footerAuthors: true` and `pageNumber: true` can override deck false.
7. Chrome auto hides cover/section chrome and shows it on every other current layout.
8. Valid accent CSS colors apply to the local canvas; invalid colors leave preset tokens
   intact.
9. The existing footer/title/author metadata chains remain unchanged.

Expected evidence:

```text
.artifacts/quality/configuration.json
```

## 3. Verify Preset Isolation

The harness generates global-default, global-UCAS, and global-ICT decks from
`fixtures/preset-isolation.md`.

For each global deck it compares explicit local default/UCAS/ICT slides with the unoverridden
canonical target deck in light and dark mode.

Expected:

- 3 global presets × 3 local presets × 2 modes = 18 passing comparisons.
- Matching preset/density attributes on the local `.slidev-layout` and `.slide-frame`.
- Computed canvas, heading, table, code, callout, and chrome styles match the target preset.
- Default slides contain no UCAS/ICT branding.
- UCAS slides contain no ICT branding.
- ICT slides contain no UCAS branding.
- Same-run target screenshots match after fonts and images settle.
- No root preset selector is reported by the static CSS check.

Focused command, when diagnosing this gate:

```bash
node --test tests/quality/preset-isolation.spec.mjs
```

## 4. Verify Supported Builds and Protocol Compatibility

The aggregate command runs these builds. They can also be rerun individually:

```bash
pnpm run build
pnpm run build:default
pnpm run build:ucas
pnpm run build:ict
pnpm run build:fixture
```

Expected:

- Every command exits `0`.
- `fixtures/obsidian-protocol.md` retains callouts, warnings, links, media, long lists, tables,
  code, footnotes, TOC, and preset overrides.
- Ordinary Slidev Markdown and all existing layouts require no author changes.

## 5. Verify Visual, Accessibility, and Interaction Behavior

Review the aggregate report and any generated contact sheets for:

- Canonical 980 × 552 logical canvas at DPR 2 (1960 × 1104 output)
- Default, UCAS, and ICT in light and dark modes
- Long/bilingual headings, wide tables, code, generated markup, media, chrome, and branding
- Cover, default, intro, section, TOC, center, two-cols, statement, quote, figure, and references

Expected:

- No new clipping or unintended overflow.
- No serious/critical WCAG A/AA Axe violation.
- Required contrast and accessible names pass.
- Decorative brand images are hidden from assistive technology.
- ArrowRight advances.
- TOC controls support Tab, Enter, and click.
- Focused interactive elements retain a visible outline.
- Theme-owned branding produces no layout-shift source or post-decode geometry change.

Human visual sign-off is recorded in:

```text
qa/refactor-theme-architecture/visual-review.md
```

The record includes reviewer, date, presets/modes/layouts reviewed, result, and any skipped gate
with reason, owner, and follow-up.

## 6. Verify Brand Asset Budgets and Fidelity

```bash
pnpm run assets:check
```

Expected:

- No shipped brand asset exceeds 256,000 bytes.
- `assets/UCAS/emblem.svg` is 70,710 bytes.
- `assets/UCAS/emblem-name-bilingual-hz.svg` is 179,085 bytes.
- The required pair totals 249,795 bytes, below the 424,883-byte maximum.
- No UCAS SVG contains `data:application/vnd.iccprofile` or `<color-profile>`.
- All six UCAS SVGs preserve recorded view boxes, dimensions, paths, IDs, transforms, alpha,
  and browser-rendered RGBA references.
- The published `assets/UCAS` directory is approximately 952,924 bytes after the approved
  metadata-only cleanup.

`pnpm run assets:optimize` is the deterministic source-maintenance command. It is not required
for a normal validation run because committed assets should already be optimized. If it is run,
the second run must produce no diff.

## 7. Verify Production Output Budgets

The aggregate gate measures clean build directories and compares them with the checked-in
regular-file-byte manifest.

| Deck | Baseline | Blocking maximum |
| --- | ---: | ---: |
| Example | 3,232,547 B | 3,394,174 B |
| Default-only | 4,318,670 B | 4,534,603 B |
| Protocol | 3,282,934 B | 3,447,080 B |

Expected evidence:

```text
tests/quality/baselines/output-sizes.json
qa/refactor-theme-architecture/performance-after.json
```

The after record contains sorted per-file bytes, totals, commit, tool versions, and lockfile
hash. A smaller output does not automatically lower or rewrite the approved baseline.

## 8. Baseline Update Procedure

Do not update baselines to make an unexplained failure pass.

When an intentional approved visual or output change requires a baseline update:

```bash
pnpm run quality:update-baselines
git diff -- tests/quality/baselines qa/refactor-theme-architecture
pnpm run quality
```

Expected:

- The baseline update is an explicit diff.
- The rationale and reviewer are recorded with the change.
- The normal quality command passes without mutating baselines.

## Completion Checklist

- [ ] Configuration defaults, aliases, normalization, and precedence match the contract.
- [ ] All 18 preset-isolation mode/pair cases pass.
- [ ] All five maintained source decks and generated matrix decks build.
- [ ] All eleven layouts pass visual/overflow checks.
- [ ] Protocol markup and ordinary Markdown remain compatible.
- [ ] Accessibility and interaction checks pass.
- [ ] Required asset pair is at least 80% smaller and every brand asset is within 250 KiB.
- [ ] Example, default-only, and protocol outputs stay within their 5% ceilings.
- [ ] No theme-owned layout shift is observed.
- [ ] The aggregate suite completes in under five minutes.
- [ ] Visual and performance evidence is reviewed and recorded.
