# Obsidian Slidev Presentation Profile 1.0.0

Coordinate: `obsidian-slidev/presentation@1.0.0`

This optional Profile defines a portable authoring surface. It does not select a package,
brand, preset, typography, color system, or visual baseline. A theme may conform to core
without implementing this Profile.

## Selection

Authored root frontmatter opts in explicitly:

```yaml
obsidian-slidev-profile:
  id: obsidian-slidev/presentation
  version: "1.0.0"
```

`theme` remains an independent authored Slidev field. Producers structurally validate and
preserve the Profile object but never infer it from package identity, components, layouts,
configuration, path, or availability. Absence is core-only. A well-formed other Profile is
opaque and cannot claim this Profile's conformance.

## Core requirement

Implementations support `obsidian-slidev/core` in `[1.0.0,1.1.0)`. Profile compatibility
requires compatible core and exact Profile selection.

## Common presentation configuration

Under `themeConfig.presentation`:

| Key | Values/default |
| --- | --- |
| `density` | `compact|normal|relaxed`; default `normal` |
| `chrome` | `auto|on|off`; default `auto` |
| `header` | boolean; default `false` |
| `footerAuthors` | boolean; default `true` |
| `pageNumber` | boolean; default `true` |
| `accent` | CSS color or implementation default |
| `preset` | optional implementation-defined string, preserved but not standardized |

Slide metadata may override `presentationDensity`, `presentationChrome`/`chrome`,
`presentationHeader`/`header`, `footerAuthors`, `pageNumber`, `footer`, `accent`, and
implementation-defined `presentationPreset`.

## Authors

Root `authors` and legacy singular `author` are preserved. Profile author objects use
`name`, `institution`, and `email`; strings remain valid. Unknown authored fields are
preserved but are not required to render.

## Components

The public names are `Callout`, `Figure`, `Authors`, `Steps`, `Timeline`, `Tag`, `Badge`, and
`Kbd`.

- `Callout`: canonical core `type`, optional non-empty `title`, formatted default slot.
- `Figure`: `src`, tri-state `alt`, optional `caption`, `fit="contain|cover"`.
- `Authors`: root author records and optional documented `variant`.
- `Steps`: ordered-list default slot.
- `Timeline`: ordered-list default slot with optional native `<time>`.
- `Tag`: visible default-slot category text.
- `Badge`: semantic `tone`, optional boolean `marker`, visible status text.
- `Kbd`: ordered string-array `keys`, or one visible key in the default slot.

Generation preserves names/casing, tag form, properties/bindings/quotes/values, slot
boundaries, nesting, adjacency, ordinary content, and source order. Supported Obsidian syntax
is transformed only in ordinary slot prose. Complete tags/properties, YAML, inline/fenced code,
and comments are protected. Unknown components remain author-controlled.

`Callout` and `Figure` preserve the same semantic/accessibility outcomes as core-generated
counterparts, though their internal DOM and visuals may differ.

## Layouts

- `end`: closing content plus `contact`, `showAuthors`, `logo`, `logoAlt`, `chrome`, `title`,
  and `subtitle`.
- `figure`: authored media/component content plus frame `chrome`, `title`, and `subtitle`.
- `image-left` and `image-right`: `image`, `imageAlt`, `caption`, `backgroundSize`, `class`,
  and frame metadata.
- `code`: one primary code/content region plus frame metadata.

Quote attribution in an implementation-provided ordinary quote layout uses `author`; optional
`source` is preserved.

## Editor context

Marked-deck active-slide context may expose at most the existing bounded chip/mark surface for
the documented layout and presentation fields. Root Profile/authors are deck context, not
repeated slide chips. Unmarked notes and inactive metadata remain quiet. No package lookup,
filesystem/process work, full-vault scan, or new decoration kind is required.

## Safety and conformance

Source bytes/mtime and independently authored theme/addon/custom-component data remain
unchanged. A missing consumer support declaration is visibly unverified. Explicit unsupported
Profile support is incompatible and cannot downgrade to core-only while the selection remains.
Conformance requires this exact Profile fixture/hash in addition to compatible declarations.
