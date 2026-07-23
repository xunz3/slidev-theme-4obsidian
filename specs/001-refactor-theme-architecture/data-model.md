# Data Model: Refactor Theme Architecture

This feature has no persisted database model. The model describes versioned configuration,
rendering, asset, scenario, and evidence records used by the theme and its quality gates.

## 1. Presentation Option Definition

The canonical rule for one supported presentation setting.

| Field | Type | Rules |
| --- | --- | --- |
| `key` | enum | `preset`, `density`, `chrome`, `header`, `footerAuthors`, `pageNumber`, or `accent` |
| `deckKey` | string | Key under `themeConfig.presentation` |
| `slideKeys` | string[] | Ordered canonical and compatibility frontmatter keys; empty for deck-only accent |
| `acceptedValues` | readonly values or predicate | Exact allowed enum tokens, boolean tokens, or CSS-color predicate |
| `defaultValue` | normalized value | Complete for every option |
| `normalize` | pure function | Returns a normalized value or `undefined`; never silently applies a default |
| `scope` | enum | `deck-and-slide` or `deck-only` |

Relationships:

- One definition normalizes zero or more raw deck/slide values.
- All definitions are owned by `setup/presentation-config.ts`.
- Layouts and components import derived types; they do not redeclare accepted values.

Validation:

- Definitions are immutable.
- Enum defaults must belong to their accepted values.
- Slide keys must be unique across options except documented compatibility aliases.
- `accent` has no slide key.

## 2. Raw Deck Presentation Configuration

Untrusted user input from `themeConfig.presentation`.

| Field | Input type |
| --- | --- |
| `preset` | unknown |
| `density` | unknown |
| `chrome` | unknown |
| `header` | unknown |
| `footerAuthors` | unknown |
| `pageNumber` | unknown |
| `accent` | unknown |
| unknown keys | ignored |

Validation:

- Invalid fields are treated as absent independently; one invalid option cannot invalidate the
  whole object.
- Absent or non-object `themeConfig.presentation` behaves like an empty object.
- The obsolete `package.json > slidev.themeConfig.presentation` block is not an input source.

## 3. Raw Slide Presentation Overrides

Untrusted per-slide frontmatter and explicit layout/frame props.

| Option | Candidate keys, highest priority first |
| --- | --- |
| preset | `presentationPreset` |
| density | `presentationDensity` |
| chrome | explicit `chrome` prop, `presentationChrome`, `chrome` |
| header | `presentationHeader`, `header` |
| footer authors | `footerAuthors` |
| page number | `pageNumber` |
| accent | none |

Validation:

- A candidate participates only if its normalizer returns a value.
- An invalid high-priority candidate does not suppress the next valid candidate.
- Unknown or unsupported frontmatter values do not become DOM attributes or styles.

## 4. Resolved Presentation State

The complete, valid state used to render one slide.

| Field | Type | Default/fallback |
| --- | --- | --- |
| `preset` | `default \| ucas \| ict` | `default` |
| `density` | `compact \| normal \| relaxed` | `normal` |
| `chrome` | `auto \| on \| off` | `auto` |
| `header` | boolean | `false` |
| `footerAuthors` | boolean | `true` |
| `pageNumber` | boolean | `true` |
| `accent` | CSS color or `null` | `null` (preset token) |
| `variant` | one of 11 frame/layout variants | required from layout |
| `showChrome` | boolean | derived from `chrome` and `variant` |
| `showHeader` | boolean | `showChrome && header` |

Derived rules:

- `chrome=on` → `showChrome=true`.
- `chrome=off` → `showChrome=false`.
- `chrome=auto` → false for `cover` and `section`, true for every other current variant.
- `showHeader=false` when chrome is hidden, regardless of the normalized header value.
- Page number and footer authors render only inside visible chrome.
- Footer content resolves independently:
  slide `footer` → deck `footer` → deck `title` → deck `info` → empty.
- Header title/subtitle use slide metadata only; they never repeat the deck title.

Invariant:

> Given equal resolved state, mode, variant, content, and viewport, visible output must be
> independent of the raw deck preset.

## 5. Frame Variant

The layout identity passed to the shared frame.

Accepted values:

`default`, `cover`, `intro`, `section`, `toc`, `center`, `two-cols`, `statement`, `quote`,
`figure`, `references`.

Fields:

- `name`
- optional canvas style (currently cover/intro background)
- default chrome behavior
- semantic body slot content

Validation:

- Every variant renders through the same `SlideFrame`.
- No variant has a preset-specific implementation.
- Existing layout props, slots, class names, and visible behavior remain compatible.

## 6. Resolved Slide Canvas

The existing two-level DOM surface emitted by `SlideFrame`.

Fields:

- Outer `.slidev-layout.<variant>`
- Inner `.slide-frame.slide-frame--<variant>`
- Identical `data-presentation-preset` on outer and inner
- Identical `data-presentation-density` on outer and inner
- Optional resolved accent custom properties on the outer canvas
- Derived chrome/header classes on the inner frame

Relationships:

- Contains exactly one shared content region and optional shared header/footer.
- Contains zero or more visual-only brand elements supplied by `PresetBranding`.
- Contains semantic content from the selected shared layout.

Validation:

- The outer local canvas is the preset CSS selector boundary.
- Root deck attributes must never select into the canvas.
- Rendered class hierarchy remains compatible with existing CSS and deck customizations.
- Preset and density attributes must come from the same `Resolved Presentation State`.

## 7. Preset Brand Definition

The visual-only mapping from preset and placement to brand artwork.

| Field | Type |
| --- | --- |
| `preset` | `default \| ucas \| ict` |
| `role` | `cover-lockup`, `slide-mark`, `watermark`, or `header-mark` |
| `lightSource` | asset path or none |
| `darkSource` | asset path or none |
| `allowedVariants` | frame variant set |
| `intrinsicWidth` / `intrinsicHeight` | positive number |
| `accessibility` | decorative or meaningful |

Validation:

- Default preset renders no UCAS or ICT element.
- UCAS never renders ICT elements; ICT never renders UCAS elements.
- Decorative images use empty alt text and `aria-hidden=true`.
- Meaningful lockups retain approved accessible names.
- Dimensions/aspect ratios are explicit before image decode.
- The branding component owns no content, metadata, navigation, or configuration lookup.

## 8. Brand Asset

A shipped identity file.

| Field | Type | Rules |
| --- | --- | --- |
| `path` | repository-relative path | Under `assets/UCAS` or `assets/ICT` |
| `format` | SVG or PNG | Existing format retained |
| `displayRoles` | role set | At least one documented role or package-only source |
| `rawBytes` | integer | No more than 256,000 after optimization |
| `viewBox` / dimensions | immutable baseline | Must remain unchanged |
| `hasAlpha` | boolean | Must remain unchanged |
| `rgbaHashByReferenceSize` | hash map | Must match approved pre-optimization render |
| `licenseContext` | text/reference | Must remain unchanged |

Special aggregate:

- Baseline required pair: 2,124,415 bytes.
- Passing maximum: 424,883 bytes.
- Expected metadata-only result: 249,795 bytes.

State transition:

```text
source-with-unused-ICC
  → exact metadata strip
  → structural validation
  → browser raster equivalence
  → size-budget validation
  → approved shipped asset
```

Any failed validation returns the asset to the source state; geometry-altering output is not
accepted.

## 9. Regression Scenario

A reproducible public-API case.

| Field | Type |
| --- | --- |
| `id` | stable string |
| `globalPreset` | preset |
| `localPreset` | preset or absent for target baseline |
| `mode` | light or dark |
| `variant` | frame variant |
| `density` | density |
| `chromeState` | normalized/derived chrome fields |
| `contentProfile` | representative content identifier |
| `expectedTargetPreset` | preset |

Required matrix:

- 3 global presets × 3 explicit local presets × 2 modes = 18 equivalence cases.
- For each target preset, an unoverridden slide under that same global preset is the same-run
  canonical comparison.
- Additional cases cover invalid input, missing config, textual booleans, density/chrome
  overrides, all eleven layouts, standalone markup, and generated protocol markup.

## 10. Performance Measurement

| Field | Type |
| --- | --- |
| `deckId` | `example`, `default-only`, or `protocol` |
| `phase` | `before` or `after` |
| `commit` | Git identifier |
| `measuredAt` | ISO timestamp |
| `nodeVersion` / `pnpmVersion` | strings |
| `lockfileSha256` | hash |
| `files` | sorted `{ path, bytes }[]` |
| `totalBytes` | sum of regular-file bytes |
| `baselineBytes` | immutable baseline |
| `maximumBytes` | `floor(baselineBytes × 1.05)` |
| `status` | pass or fail |

Validation:

- Measure clean output directories only.
- Directory inode sizes, logs, screenshots, and previous artifacts are excluded.
- `totalBytes` must equal the sum of recorded file bytes.
- Normal quality runs never update `baselineBytes`.

## 11. Quality Gate Result

| Field | Type |
| --- | --- |
| `gate` | build, config, isolation, visual, accessibility, interaction, asset, output, or timing |
| `caseId` | scenario/asset/deck identifier |
| `status` | pass, fail, or skipped |
| `durationMs` | non-negative integer |
| `expected` / `actual` | structured values |
| `artifactPaths` | repository-relative runtime evidence paths |
| `reason` | required for fail/skip |
| `owner` / `followUp` | required for skip |

Validation:

- Any failure exits the aggregate command non-zero.
- A skipped required gate is not silently converted to pass.
- Total aggregate duration must be less than 300,000 ms.
- Failure messages identify enough context to reproduce the case.
