# Contract: Quality Gates and Evidence

## Command Surface

The maintainer-facing commands are:

| Command | Purpose | Mutates approved baselines |
| --- | --- | --- |
| `pnpm run assets:optimize` | Apply exact allowlisted metadata cleanup to UCAS SVGs | No |
| `pnpm run assets:check` | Validate asset structure, bytes, transparency, and rendered equivalence | No |
| `pnpm run quality` | Run the complete blocking release gate | No |
| `pnpm run quality:update-baselines` | Explicitly regenerate reviewed output/visual baselines | Yes |

The existing focused build and screenshot commands remain available. Normal implementation and
CI use `pnpm run quality`; baseline update is never called from that command.

Exit behavior:

- `0`: every required gate passed.
- `1`: one or more product/contract checks failed.
- `2`: the harness could not execute correctly, a required gate was skipped without an
  approved record, or the five-minute limit was reached.

## Reproducible Environment

Prerequisites:

- Node.js satisfying `>=20.19.0`
- Frozen `pnpm-lock.yaml`
- Chromium installed for the pinned `playwright-chromium`
- The pinned development-only `axe-core`
- Canonical logical viewport 980 × 552 at device scale factor 2

The quality report records commit, date, OS, Node/pnpm/Chromium versions, lockfile hash, total
duration, and each phase duration.

## Build Gate

Required production builds:

| Source | Existing command/role |
| --- | --- |
| `example.md` | example deck |
| `fixtures/default-preset.md` | default showcase |
| `fixtures/ucas-preset.md` | UCAS showcase |
| `fixtures/ict-preset.md` | ICT showcase |
| `fixtures/obsidian-protocol.md` | generated-markup protocol |
| generated preset-matrix decks | global default, UCAS, and ICT public-API cases |

Rules:

- Build into empty absolute directories under `.artifacts/quality/build/`.
- Run no more than two builds concurrently.
- A warning does not fail by itself, but unexpected page/console/build errors do.
- A failed build identifies the source deck, command, exit status, and retained log.

## Configuration Gate

Checks:

- Every supported option has one definition, default, normalizer, and precedence rule.
- Layouts import shared types rather than redeclaring accepted values.
- Obsolete presentation defaults are absent from `package.json > slidev.themeConfig`.
- Missing config produces all documented defaults.
- Native and textual booleans normalize per contract.
- Invalid local values inherit valid deck values.
- Local `true` can override deck `false` for footer authors/page number.
- Chrome auto behavior is correct for every variant.
- Accent accepts valid CSS colors and rejects invalid/empty inputs.
- README tables match the public contract, including slide-level `pageNumber`.

## Preset Isolation Gate

Input:

- One canonical matrix fixture
- Three generated decks with global default/UCAS/ICT
- An unoverridden target-baseline slide and explicit local default/UCAS/ICT slides

Matrix:

- Nine global→local preset pairs
- Light and dark modes
- Eighteen required equivalence comparisons

Per-case checks:

- Resolved preset/density attributes on local canvas and frame
- Computed canvas/text/heading/table/code/callout/chrome style fingerprint
- Allowed brand DOM only
- No broken image
- No unexpected horizontal/vertical overflow
- No theme-owned layout shift
- Screenshot equivalence against the target preset's same-run unoverridden baseline

Failure output includes:

`deck`, `globalPreset`, `localPreset`, `mode`, `slide`, `title`, `selector`, `property`,
`expected`, `actual`, and retained artifact path.

## Visual and Layout Gate

Coverage:

- All eleven layouts
- All three presets
- Light and dark modes where supported
- Long headings, wide tables, code, generated callouts/warnings, media, and bilingual text
- Cover lockups, normal-slide marks, section/statement decoration, header/footer chrome

Assertions:

- No clipping outside explicitly scrollable content
- No unintended content/frame overflow
- No new typography or spacing regression
- Expected preset brand presence and placement
- Stable image dimensions after decode
- Approved representative visual baselines remain within the declared pixel tolerance

Same-run preset-pair comparisons should be exact after fonts/images settle. Committed historical
goldens may use a reviewed minimal tolerance to account for documented rendering-environment
variation; the threshold must be fixed in the baseline metadata and may not auto-expand.

## Accessibility and Interaction Gate

Automated accessibility:

- Inject `axe-core` into representative built pages.
- Run WCAG A and AA tags.
- Treat serious/critical violations as failures; any intentionally waived lower-impact rule
  requires a documented rationale and owner.
- Check meaningful image names, decorative-image exclusion, landmarks, heading semantics,
  control names, color contrast, and focusable elements.

Interaction:

- ArrowRight advances the slide.
- TOC items are reachable by Tab.
- Enter and click activate linked TOC items.
- Focused links/buttons have a visible non-zero outline.
- Existing navigation behavior is unchanged.

## Asset Gate

All shipped brand assets:

- No file exceeds 256,000 bytes.
- Preserve dimensions/view box, transparency, and approved role.
- No unexpected embedded raster or non-rendering metadata.
- Browser Canvas render matches the approved RGBA reference at declared display sizes.

UCAS-specific:

- Reject `data:application/vnd.iccprofile`.
- Reject `<color-profile>`.
- Reject geometry/path/ID/transform changes from the recorded source manifest.
- Required pair total must be no more than 424,883 bytes.
- Expected metadata-only pair total is 249,795 bytes.

## Production Output Gate

Metric: sum of regular-file bytes in a clean output tree.

| Deck | Baseline | Maximum |
| --- | ---: | ---: |
| Example | 3,232,547 B | 3,394,174 B |
| Default-only | 4,318,670 B | 4,534,603 B |
| Protocol | 3,282,934 B | 3,447,080 B |

Evidence records:

- Sorted file path and byte count
- Total
- Baseline and computed ceiling
- Commit
- Node/pnpm versions
- Lockfile hash

The gate fails when `actual > floor(baseline × 1.05)`. A smaller output passes without changing
the baseline.

## Timing Gate

`pnpm run quality` must finish in less than 300 seconds on the maintained environment.

The orchestrator:

- Tracks wall-clock and phase time.
- Stops launching new phases when the limit cannot be met.
- Terminates child servers/builds on completion or failure.
- Reports the slowest phases.
- Exits `2` at or above the time limit.

## Evidence and Skips

Runtime evidence:

```text
.artifacts/quality/
├── summary.json
├── logs/
├── screenshots/
├── diffs/
└── axe/
```

Approved baselines:

```text
tests/quality/baselines/
├── output-sizes.json
└── visual/
```

Review record:

```text
qa/refactor-theme-architecture/
├── performance-after.json
└── visual-review.md
```

A required gate that cannot run must be recorded as `skipped` with the reason, owner, and
follow-up. It does not silently pass and blocks release until the review process explicitly
accepts the time-bounded exception.
