# Phase 0 Research: Refactor Theme Architecture

All technical-context unknowns are resolved. No implementation clarification remains.

## Decision 1: Make the resolved local canvas the preset styling authority

**Decision**: `SlideFrame` will emit and own the existing outer `.slidev-layout` canvas and
inner `.slide-frame`. It will bind the same resolved preset and density to both elements, with
the outer canvas serving as the preset CSS scope because it owns background and inherited
typography. Preset selectors may be prefixed by `html.dark`, but must otherwise anchor to:

```text
.slidev-layout[data-presentation-preset="<resolved-preset>"]
```

The existing deck-level attributes on `document.documentElement` may remain as normalized
compatibility/diagnostic state, but no theme rule may use them as an ancestor selector for a
slide.

**Rationale**: The current DOM puts the global preset on `html`, the visible canvas on
`.slidev-layout`, and the resolved local preset only on the descendant `.slide-frame`.
`styles/base.css` computes canvas background, color, font, size, and line height on the outer
layout; a descendant cannot change those already-computed ancestor properties. In addition,
the default selectors in `styles/presets.css` lines 120–305 begin at the root and have greater
specificity than local UCAS/ICT frame selectors. A globally default deck therefore applies
default heading, table, code, callout, and layout rules inside local branded slides. Giving the
existing canvas wrapper to `SlideFrame` centralizes the resolved state without changing the
rendered class hierarchy or duplicating resolution logic in eleven layouts.

**Alternatives considered**:

- Increase local selector specificity or use `!important`: rejected because it patches current
  collisions but leaves ancestor background and typography globally resolved.
- Select the outer layout with `:has(> .slide-frame[data-presentation-preset])`: technically
  viable, but leaves canonical state on a descendant and obscures ownership.
- Move every token-consuming canvas property to the inner frame: rejected because custom
  cover/intro backgrounds and future outer layout styling would remain fragile.
- Bind local state independently in every layout: rejected because it creates eleven drift
  points.

## Decision 2: Give every preset a complete, mutually exclusive CSS scope

**Decision**: Split `styles/presets.css` behind its stable aggregate import into
`styles/presets/default.css`, `ucas.css`, and `ict.css`. Each preset must define a complete
light token set, dark token set, compact/normal/relaxed density behavior, and its narrowly
scoped visual rules under the resolved local canvas. `styles/base.css`,
`styles/layouts.css`, and `styles/obsidian.css` retain shared behavior. A static check will
reject preset selector preludes that combine `:root` or a root preset attribute with a
descendant preset scope.

**Rationale**: The current default token block includes a bare `:root`; UCAS and ICT are
effectively deltas over inherited default/root values. Complete local token sets make the
rendered result a function of only `(resolved preset, resolved density, mode, accent)`.
Mutually exclusive local selectors prevent source order and selector specificity from
combining visual identities.

**Alternatives considered**:

- Keep one 1,665-line preset file: behavior can be corrected there, but independent preset
  maintenance and structural checking remain harder.
- Use CSS cascade layers only: layers help order but do not change the incorrect global scope.
- Fork shared base/layout/Obsidian rules per preset: rejected as direct architectural
  duplication.

## Decision 3: Centralize option definitions and use first-valid resolution

**Decision**: Add `setup/presentation-config.ts` as the sole executable authority for accepted
values, defaults, aliases, normalization, and deck/slide resolution. Derive types from
`as const` option definitions. Normalizers return `undefined` for absent or invalid input;
resolvers choose the first valid candidate, then apply a default.

Resolution order:

| Option | First-valid order |
| --- | --- |
| `preset` | slide `presentationPreset` → deck `preset` → `default` |
| `density` | slide `presentationDensity` → deck `density` → `normal` |
| `chrome` | layout/frame prop → slide `presentationChrome` → `chrome` alias → deck `chrome` → `auto` |
| `header` | slide `presentationHeader` → `header` alias → deck `header` → `false` |
| `footerAuthors` | slide `footerAuthors` → deck `footerAuthors` → `true` |
| `pageNumber` | slide `pageNumber` → deck `pageNumber` → `true` |
| `accent` | valid deck `accent` → preset token |

Boolean options accept native booleans and trimmed lowercase textual values:
`true`/`on` and `false`/`off`. Chrome additionally accepts `auto`, mapping boolean-like input
to `on`/`off`. Numbers, `yes`/`no`, objects, and arbitrary strings are invalid. Accent remains
deck-only and is applied only when the trimmed string is a supported CSS color.

**Rationale**: `setup/main.ts` and `components/SlideFrame.vue` currently carry different type
guards, coercions, and fallback behavior, while every layout repeats the chrome type. Invalid
local preset/density values currently discard valid deck values, invalid chrome falls through,
invalid header input becomes false, and strict-false checks make boolean text inconsistent.
The duplicate presentation-default block at `package.json > slidev.themeConfig` is ineffective:
Slidev 52.15.2 reads theme defaults from `slidev.defaults`. Moving the nested block there would
still be shallow-merged at `themeConfig`, so the central resolver remains necessary. Remove the
obsolete package block and let the resolver own defaults.

**Alternatives considered**:

- Make `package.json` authoritative: it cannot express normalization, aliases, or slide
  precedence and its nested defaults are shallow-merged.
- Retain helpers inside `SlideFrame`: does not prevent setup/layout drift.
- Add a runtime schema library: unnecessary for seven small options and prohibited without
  stronger justification.

## Decision 4: Separate visual branding from the shared frame

**Decision**: Add `components/PresetBranding.vue`, receiving only typed `preset`, `variant`,
and attachment role (`frame` or `header`). It owns brand asset imports and decorative/identity
markup. It must not read Slidev context or own configuration resolution, content, authors,
metadata, navigation, page numbering, or chrome decisions. `SlideFrame.vue` remains the one
owner of the canvas, header, content, and footer, and every existing layout continues through
that frame.

**Rationale**: The current shared frame combines public presentation behavior with seven brand
imports and many preset-specific branches. A visual-only boundary lets preset artwork evolve
without creating parallel frames or layouts. Explicit image dimensions/aspect ratios and
stable in-flow/absolute placement also prevent theme-owned layout shift.

**Alternatives considered**:

- Create default/UCAS/ICT frames or layout trees: violates the constitution and multiplies
  behavior.
- Keep all branding branches in `SlideFrame`: retains unnecessary coupling.
- Lazy-load preset branding: written production output would still contain dynamic chunks,
  and visible arrival risks navigation shift.

## Decision 5: Remove only verified non-rendering UCAS SVG metadata

**Decision**: Add a strict repository-owned Node script that processes all six UCAS SVGs. It
removes only the shared `<color-profile>` element, the now-unused `xmlns:xlink` and
`xmlns:svg` declarations, and the Inkscape generator comment. It does not rewrite paths,
coordinates, IDs, fills, transforms, view boxes, intrinsic dimensions, or transparency.

Expected result:

| Asset scope | Before | Expected after |
| --- | ---: | ---: |
| `assets/UCAS/emblem.svg` | 1,008,020 B | 70,710 B |
| `assets/UCAS/emblem-name-bilingual-hz.svg` | 1,116,395 B | 179,085 B |
| Required pair combined | 2,124,415 B | 249,795 B |
| Entire `assets/UCAS` directory | 6,576,784 B | 952,924 B |

**Rationale**: Every UCAS SVG contains the same unused 937,158-byte `Japan Color 2001 Coated`
ICC profile. No `icc-color`, `color-profile`, or other `xlink:` reference consumes it.
Research renders of the required emblem and wordmark produced identical before/after RGBA
hashes at presentation scale. The expected pair reduction is 88.24%, exceeding the 80%
requirement while preserving source geometry.

**Alternatives considered**:

- Default SVGO optimization: rejected because path rewriting and floating-point cleanup add
  visual risk and a dependency unrelated to the known payload.
- Raster replacement: rejected because it loses resolution independence.
- Clean only the two currently imported SVGs: rejected because all six ship in the published
  `assets/UCAS` directory and contain the same avoidable profile.

## Decision 6: Use same-run pairwise browser equivalence for preset isolation

**Decision**: Add one canonical `fixtures/preset-isolation.md` source and have the test harness
generate three temporary decks whose global presets are default, UCAS, and ICT. Each deck
contains an unoverridden baseline and explicit local-default/local-UCAS/local-ICT cases with
identical bilingual content, heading levels, list markers, tables, inline and block code,
blockquote, generated callout/warning/caption, header/footer chrome, and stable hidden case
identifiers. Page numbers are disabled in screenshot-comparison slides.

Using Node's built-in test/assertion support and existing `playwright-chromium`, run all nine
global→local pairs in light and dark mode. Compare each case to the unoverridden globally
selected target in the same run:

- Resolved attributes and computed styles on the canvas and representative descendants
- Allowed preset brand DOM only, with no broken image
- Frame/content overflow and clipping
- Focus outline, ArrowRight navigation, and TOC Tab/Enter/click behavior
- Theme-owned layout-shift sources and geometry after fonts/images settle
- Same-run canvas screenshots, retaining actual/diff evidence on failure

**Rationale**: The current protocol fixture covers only global-default to local UCAS/ICT, while
the three showcase decks use different content. Same-run target comparison directly tests the
public deck and slide APIs, is more actionable than standalone goldens, and avoids most
host-dependent screenshot drift.

**Alternatives considered**:

- Mutate the root data attribute: bypasses configuration resolution and would miss the public
  API bug.
- Extend only the protocol fixture: cannot exercise UCAS/ICT as actual global presets.
- Use golden screenshots alone: useful for design sign-off, but less diagnostic and more
  environment-sensitive than pairwise same-run comparisons.

## Decision 7: Define one bounded quality command and immutable baselines

**Decision**: `pnpm run quality` is the blocking release gate. It builds the example, default,
UCAS, ICT, protocol, and generated matrix decks with at most two builds in parallel; serves
the results locally; runs configuration, preset, visual, accessibility, interaction,
overflow, asset, and performance checks; and fails at 300 seconds with slow-phase reporting.
Failures identify deck, global/local preset, slide/title, mode, selector, expected, actual, and
artifact path.

Add only a pinned development dependency on `axe-core`, injected into existing Playwright
pages for WCAG A/AA checks. Browser Canvas performs RGBA comparison, so no image-diff library
is required. Runtime failure artifacts live under ignored `.artifacts/quality/`; approved
visual and output baselines live under `tests/quality/baselines/` and change only via an
explicit reviewed `pnpm run quality:update-baselines`.

**Rationale**: The existing scripts build and manually export decks but do not assert behavior
or maintain clean-clone baselines. Current ignored screenshots cannot be release evidence, and
the README references QA files that are absent. One orchestrator keeps the full suite
reproducible, bounded, and actionable. Axe supplies well-maintained semantic/contrast coverage
without entering the published runtime.

**Alternatives considered**:

- Hand-written accessibility checks only: insufficient coverage of WCAG semantics and
  contrast.
- Add Playwright Test, Sharp, Pixelmatch, or ImageMagick dependencies: unnecessary because the
  existing browser plus Canvas can perform the required work.
- Refresh baselines automatically: would mask regressions.

## Decision 8: Measure raw production output against exact frozen baselines

**Decision**: Measure the sum of regular-file bytes in clean output directories, with a sorted
per-file manifest, commit, date, Node/pnpm versions, and lockfile hash. The checked-in baseline
and blocking ceilings are:

| Deck | Baseline | Maximum (`floor(baseline × 1.05)`) |
| --- | ---: | ---: |
| Example, `dist/` | 3,232,547 B | 3,394,174 B |
| Default-only, `fixtures/dist-default/` | 4,318,670 B | 4,534,603 B |
| Protocol, `fixtures/dist-fixture/` | 3,282,934 B | 3,447,080 B |

The asset gate also enforces no shipped brand asset above 256,000 bytes and a required-pair
combined size no greater than 424,883 bytes.

**Rationale**: These fresh builds were produced on 2026-07-23 from the locked dependency tree.
All three currently ship both oversized imported UCAS SVGs, even the default-only deck.
Summing regular files gives a deterministic distribution metric and directly captures the
metadata cleanup. Per-file manifests make growth actionable.

**Alternatives considered**:

- Compare `du` disk blocks: filesystem allocation varies.
- Compare only gzip output: distribution also carries raw assets and the specification sets
  raw asset limits.
- Use existing ignored directories as the baseline: they are not reproducible from a clean
  clone and may contain stale files.

## Primary References

- [Slidev: Writing Themes](https://sli.dev/guide/write-theme)
- [Slidev: Global Context](https://sli.dev/guide/global-context)
- [MDN: Using CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties)
- [Playwright: Visual Comparisons](https://playwright.dev/docs/test-snapshots)
