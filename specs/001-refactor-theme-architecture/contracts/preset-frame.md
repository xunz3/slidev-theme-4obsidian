# Contract: Resolved Preset Canvas and Shared Frame

## Purpose

This contract makes per-slide preset selection visually isolated while preserving the existing
layout, class, semantic-markup, and interaction surfaces.

## Ownership

`SlideFrame` is the single owner of:

- Reading deck and slide inputs through the shared resolver
- The existing outer `.slidev-layout.<variant>` canvas
- The existing inner `.slide-frame.slide-frame--<variant>` structure
- Header, content, and footer regions
- Author and metadata display
- Chrome/header/page-number decisions
- Resolved preset, density, and accent bindings
- Attachment points for visual-only branding

Each of the eleven layout components supplies semantic body content, layout-specific props, and
optional canvas style. A layout must not resolve presentation configuration or emit a
preset-specific frame.

## Required DOM State

For every rendered slide:

```text
.slidev-layout.<variant>
  [data-presentation-preset="<resolved preset>"]
  [data-presentation-density="<resolved density>"]
  .slide-frame.slide-frame--<variant>
    [data-presentation-preset="<same resolved preset>"]
    [data-presentation-density="<same resolved density>"]
```

The actual rendered hierarchy and public class names remain the same as before the refactor.
Only component ownership and data binding move.

The outer canvas is authoritative for preset and density CSS because it owns background, color,
font, size, line height, and inherited custom properties. Mirrored inner attributes are retained
for compatibility and compact component-level selectors; both values must come from the same
resolved state.

The resolved accent custom properties are applied on the outer canvas so every descendant sees
the same value.

## Root State

`setup/main.ts` may continue writing normalized deck-level preset, density, and chrome data to
`document.documentElement` for compatibility and diagnostics.

Root state is not a slide styling authority:

- No preset selector may start at a root deck-preset attribute and select into a layout/frame.
- No root preset token may override a locally resolved canvas token.
- Changing the deck preset must not affect a slide whose complete resolved state is unchanged.

## CSS Scope

Every preset-specific token or visual rule must be anchored to one of:

```text
.slidev-layout[data-presentation-preset="default"]
.slidev-layout[data-presentation-preset="ucas"]
.slidev-layout[data-presentation-preset="ict"]
```

Dark mode may prefix these selectors with `html.dark`. Layout variants may qualify the same
local canvas. No preset rule may depend on root preset state, stylesheet order between presets,
or `!important` to maintain isolation.

Each preset supplies a complete set of:

- Light tokens
- Dark tokens
- Compact, normal, and relaxed density values
- Canvas background and inherited typography
- Heading, list, table, code, quote, callout, warning, caption, and chrome refinements
- Variant-specific brand visual rules

Shared content behavior stays in:

- `styles/base.css`
- `styles/layouts.css`
- `styles/obsidian.css`
- preset-neutral schema/fallbacks in `styles/tokens.css`

Preset identity lives in:

- `styles/presets/default.css`
- `styles/presets/ucas.css`
- `styles/presets/ict.css`

`styles/presets.css` remains the stable aggregate import.

## Branding Boundary

`PresetBranding.vue` accepts only:

| Prop | Values |
| --- | --- |
| `preset` | resolved `default`, `ucas`, or `ict` |
| `variant` | one of the current frame variants |
| `attachment` | `frame` or `header` |

It may:

- Import approved UCAS/ICT artwork
- Select a light/dark asset
- Emit cover lockups, marks, watermarks, and header marks
- Apply existing brand classes and accessibility attributes

It must not:

- Read `$slidev`, `$frontmatter`, or global configuration
- Render or alter user content
- Resolve authors, title, subtitle, footer, or page number
- Decide whether chrome is visible
- Own navigation or interaction
- Fork the shared frame or layout

Brand validation:

- Default output contains no UCAS or ICT element.
- UCAS output contains no ICT element.
- ICT output contains no UCAS element.
- Decorative images have `alt=""` and `aria-hidden="true"`.
- Meaningful cover lockups preserve an accessible name.
- Every image has stable intrinsic/CSS dimensions before decode.
- No theme-owned image introduces a layout shift.

## Layout Compatibility

The following variants remain supported and share the same frame:

`default`, `cover`, `intro`, `section`, `toc`, `center`, `two-cols`, `statement`, `quote`,
`figure`, and `references`.

Special handling:

- `cover` and `intro` pass their optional background canvas style into `SlideFrame`.
- `cover` and `section` retain chrome-off behavior when chrome is `auto`.
- Existing slots and props remain unchanged.
- Existing `.slide-layout-*` body classes remain unchanged.
- Existing TOC button semantics and navigation remain unchanged.

## Semantic Compatibility

The refactor must not rename, reinterpret, or generate different `.obsidian-slidev-*` markup.
Preset files may style those elements only beneath their local canvas. Obsidian Markdown
conversion remains outside this theme.

## Isolation Invariant

For any target preset `T`, density `D`, mode `M`, variant `V`, accent `A`, content `C`, and
viewport `W`:

```text
render(global=G1, local=T, D, M, V, A, C, W)
=
render(global=G2, local=T, D, M, V, A, C, W)
=
render(global=T, local=absent, D, M, V, A, C, W)
```

for every supported global preset `G1` and `G2`.

Equality covers:

- Canvas background, typography, spacing, and overflow
- Headings, tables, code, quotes, callouts, warnings, captions, and chrome
- Brand element presence, source, visibility, placement, and dimensions
- Computed style fingerprints
- Same-run screenshots after fonts and images settle

## Structural Enforcement

The static CSS check fails when:

- A preset selector uses `:root[data-presentation-preset]` or
  `html[data-presentation-preset]` as an ancestor.
- A preset stylesheet lacks its required local canvas anchor.
- A preset omits a required token for a supported mode/density.
- A preset-specific frame/layout component is introduced.
