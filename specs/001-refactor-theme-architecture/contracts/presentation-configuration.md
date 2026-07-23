# Contract: Presentation Configuration

## Purpose

This contract preserves the published `themeConfig.presentation` and per-slide frontmatter
surface while defining one deterministic normalization and resolution policy.

`setup/presentation-config.ts` is the executable authority. `setup/main.ts`,
`components/SlideFrame.vue`, layouts, tests, package metadata, and README examples must not
define competing accepted-value or default rules.

## Deck Configuration

Location:

```yaml
themeConfig:
  presentation:
    <key>: <value>
```

| Key | Accepted input | Normalized value | Default |
| --- | --- | --- | --- |
| `preset` | `default`, `ucas`, `ict` | same enum | `default` |
| `density` | `compact`, `normal`, `relaxed` | same enum | `normal` |
| `chrome` | `auto`, `on`, `off`; native/text booleans | `auto`, `on`, `off` | `auto` |
| `header` | native/text boolean | boolean | `false` |
| `footerAuthors` | native/text boolean | boolean | `true` |
| `pageNumber` | native/text boolean | boolean | `true` |
| `accent` | non-empty supported CSS color string | trimmed CSS color | preset token |

Unknown keys are ignored. An absent or non-object presentation block behaves like an empty
block.

## Per-Slide Inputs

| Option | Canonical slide key | Compatibility alias/prop |
| --- | --- | --- |
| preset | `presentationPreset` | none |
| density | `presentationDensity` | none |
| chrome | `presentationChrome` | `chrome`; explicit layout/frame `chrome` prop |
| header | `presentationHeader` | `header` |
| footer authors | `footerAuthors` | none |
| page number | `pageNumber` | none |
| accent | none | none |

The existing `footer` frontmatter key controls centered footer content; it is metadata, not a
presentation option. This refactor does not introduce a `presentationAccent` slide key.

## Normalization

### Enum values

Enum strings are trimmed and compared as exact lowercase tokens. Unsupported values normalize
to `undefined`, not to the option default.

### Boolean values

| Input | Normalized |
| --- | --- |
| native `true` | `true` |
| native `false` | `false` |
| `"true"` or `"on"` after trimming | `true` |
| `"false"` or `"off"` after trimming | `false` |
| everything else | `undefined` |

`1`, `0`, `yes`, `no`, empty strings, objects, and arrays are not boolean inputs.

Chrome maps normalized true/false to `on`/`off` and additionally accepts `auto`.

### Accent

Accent is accepted only when:

1. The input is a string.
2. The trimmed value is non-empty.
3. The client platform reports it as a supported CSS color.

Invalid accent input yields no inline override, allowing the selected preset token to remain in
effect.

## First-Valid Resolution

For each option, inspect candidates in order and choose the first candidate whose normalizer
returns a value. Only after all candidates are exhausted is the default applied.

| Option | Candidate order |
| --- | --- |
| preset | slide `presentationPreset` → deck `preset` → `default` |
| density | slide `presentationDensity` → deck `density` → `normal` |
| chrome | explicit prop → slide `presentationChrome` → slide `chrome` → deck `chrome` → `auto` |
| header | slide `presentationHeader` → slide `header` → deck `header` → `false` |
| footer authors | slide `footerAuthors` → deck `footerAuthors` → `true` |
| page number | slide `pageNumber` → deck `pageNumber` → `true` |
| accent | deck `accent` → no override |

Consequences:

- Invalid local input inherits the next valid deck/default value.
- Invalid deck input falls back to the documented default.
- Local `footerAuthors: true` and `pageNumber: true` can override a deck-level false.
- An explicit valid layout prop remains the highest-priority chrome input.

## Derived Chrome Behavior

| Normalized chrome | Result |
| --- | --- |
| `on` | show chrome |
| `off` | hide chrome |
| `auto` on `cover` or `section` | hide chrome |
| `auto` on any other current layout | show chrome |

The optional header is visible only when both resolved header and derived chrome visibility are
true. Page number and footer-author content render only inside visible chrome.

## Metadata Resolution

The presentation resolver does not redefine content metadata.

- Header title: slide `title`, then explicit frame title.
- Header subtitle: slide `subtitle`, then explicit frame subtitle.
- The optional header never falls back to deck title/subtitle.
- Footer left: normalized `authors`, falling back to `author`, unless footer authors are hidden.
- Footer center: slide `footer` → deck `footer` → deck `title` → deck `info` → empty.
- Footer right: current page/total when page number is enabled.

## Package Defaults

Remove the obsolete `package.json > slidev.themeConfig.presentation` block. Slidev does not
consume it as theme defaults, and placing a partial nested presentation object under
`slidev.defaults.themeConfig` would be shallow-merged. The central resolver therefore remains
the only authority for presentation defaults.

Slidev-owned defaults such as aspect ratio and fonts stay under `package.json > slidev.defaults`.

## Compatibility Guarantees

The following remain valid without migration:

- Every documented deck key and accepted value
- Every documented per-slide key
- Existing `chrome` and `header` aliases
- Every current layout and layout prop
- Ordinary Slidev Markdown
- Generated `.obsidian-slidev-*` markup
- Existing deck metadata and author formats
- Valid custom accent strings

Behavior for unsupported values is explicitly defined by this contract and is not a breaking
change to the supported surface.

## Acceptance Examples

| Deck input | Slide input | Result |
| --- | --- | --- |
| `preset: ucas` | absent | `ucas` |
| `preset: ucas` | `presentationPreset: default` | `default` |
| `preset: ucas` | `presentationPreset: unsupported` | `ucas` |
| `footerAuthors: false` | `footerAuthors: "on"` | `true` |
| `pageNumber: true` | `pageNumber: "off"` | `false` |
| `chrome: auto`, default layout | absent | visible chrome |
| `chrome: auto`, cover layout | absent | hidden chrome |
| `header: true`, `chrome: off` | absent | hidden header |
| `accent: "  #345f8f  "` | none | `#345f8f` |
| `accent: "not-a-color"` | none | preset accent token |
