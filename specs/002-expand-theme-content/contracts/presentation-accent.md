# Contract: Slide-level Presentation Accent

## Public Surface

Deck default remains under the stable theme configuration object:

```yaml
themeConfig:
  presentation:
    accent: "#345f8f"
```

A slide may override it with the frontmatter key `accent`:

```yaml
---
accent: "oklch(62% 0.18 28)"
---
```

No new alias is introduced. `accent` is the only existing presentation option whose documented
scope changes from deck-only to deck-and-slide.

## Accepted Values

A valid value:

- is a string;
- is non-empty after trimming; and
- is accepted by the shared CSS color validator (`CSS.supports('color', value)` in the browser,
  with the existing conservative SSR fallback).

Examples of intended valid forms include named colors, hex, `rgb()`, `hsl()`, `oklch()`,
`color()`, `color-mix()`, and CSS custom-property references accepted by the validator.

Empty strings, non-string values, and unsupported CSS color text are invalid and skipped.

## Resolution

Accent resolution uses first valid precedence:

| Priority | Source |
| ---: | --- |
| 1 | Current rendered slide's `frontmatter.accent` |
| 2 | Deck `themeConfig.presentation.accent` |
| 3 | Active preset/mode `--presentation-accent` token |

Examples:

| Local | Deck | Result |
| --- | --- | --- |
| valid blue | valid green | local blue |
| omitted | valid green | deck green |
| empty | valid green | deck green |
| invalid | valid green | deck green |
| invalid | invalid/omitted | preset/mode token |
| valid blue | omitted | local blue |

An invalid higher-priority value never clears a valid lower-priority value.

## Scope and CSS Variables

The resolved local value is bound on that slide's `.slidev-layout`/`SlideFrame` root:

```text
--presentation-accent
--slidev-theme-primary
```

Rules:

- `setup/main.ts` may continue to apply only the deck accent to `document.documentElement`.
- Slide navigation never writes a local accent to the document root.
- Each mounted slide computes its own value from its own `$frontmatter`.
- Removing/changing a local value updates only that slide's bound style.
- Presenter preview, overview, export, and other multi-slide views may show different accents
  simultaneously without interference.

## Affected Roles

A local accent affects the same documented roles as the deck accent:

- links and visible focus treatment;
- list markers and common emphasis;
- header/footer accent-aware chrome;
- tables, code, inline code, and highlight accents;
- informational callouts and generic component accents;
- sequence/status decoration intended to follow the presentation accent.

## Protected Roles

A local/deck accent must not recolor:

- raster or SVG pixels in official UCAS/ICT logo assets;
- locked institutional signature/brand tokens;
- semantic danger, warning, success, or question colors whose meaning is intentionally separate
  from the general accent;
- author-supplied image/logo pixels.

Protected-role checks compare DOM/style/pixel evidence before and after a local override.

## Navigation State Contract

For this slide sequence:

```text
A: valid local accent
B: no local accent
C: empty local accent
D: invalid local accent
E: another valid local accent
```

Expected sources are:

```text
A → local
B → deck or preset
C → deck or preset
D → deck or preset
E → E's local value
```

No value from A or E may appear as a computed accent on B–D unless it independently equals the
valid deck/preset fallback.

## Compatibility

- Existing decks with only deck-level accent behave unchanged.
- Existing decks with no accent use the same preset/mode defaults.
- Existing configuration keys, aliases, normalizers, and precedence rules are unchanged.
- The option definition remains the single source of accepted values/default/scope metadata.

## Verification Matrix

Automated checks cover:

- local valid/empty/invalid/equal-to-deck values;
- local → unaccented → invalid navigation sequences;
- all three presets and both modes;
- same-slide component/chrome roles;
- protected UCAS/ICT identity roles;
- multiple slides mounted concurrently;
- server build plus hydrated browser resolution;
- no unexpected horizontal/vertical overflow caused by accent styling.
