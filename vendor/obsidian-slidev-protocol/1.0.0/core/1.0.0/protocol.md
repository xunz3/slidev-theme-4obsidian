# Obsidian Slidev Core Protocol 1.0.0

Coordinate: `obsidian-slidev/core@1.0.0`

## Roles

A producer converts authored Obsidian content into deterministic frontend-native Slidev
Markdown/HTML. A consumer renders those semantics accessibly. Both roles are checked against
this publication; neither role owns the contract.

## Generated declaration

Every disposable generated entry root contains exactly one producer-owned field:

```yaml
obsidian-slidev-protocol:
  id: obsidian-slidev/core
  version: "1.0.0"
  publication:
    version: "1.0.0"
    manifestSha256: "<raw publication SHA-256>"
```

Only the entry root receives it. Embedded-note frontmatter does not. The source-reserved field
is rejected if authored. A separate valid `obsidian-slidev-profile` source selection is
preserved exactly; its absence is valid core-only behavior.

## Compatibility notice

Generated output contains one frontend-native `.obsidian-slidev-compatibility` status notice,
initially marked `data-obsidian-slidev-status="unverified"`, with readable non-color text. A
declaring compatible consumer may resolve the notice. An explicit incompatibility leaves an
actionable error visible and blocks preview acceptance.

## Theme support

Themes declare support in `package.json#/obsidianSlidev/support`. The declaration pins the
publication hash, one core coordinate/range list, and zero or more Profile coordinate/range
lists. Package identity is provenance only and is never an evaluator input.

Ranges are stable-SemVer, sorted, non-empty, non-overlapping half-open intervals. Core/Profile
exact lower bounds are included and upper bounds are excluded.

## Runtime message

A declaring consumer may post `obsidian-slidev/protocol-support` to an embedding parent. The
parent accepts only the current iframe source, exact origin, opaque session token, and matching
deck coordinates, then parses support and recomputes compatibility independently. A theme's
assessment is advisory. Silence remains unverified; no timeout or polling loop changes that
state. Listeners and tokens are released with their view/session.

## Callouts

Canonical types and default titles:

| Family | Types and titles |
| --- | --- |
| info | `note` Note, `info` Info, `todo` To do, `abstract` Abstract, `summary` Summary |
| positive | `tip` Tip, `success` Success, `check` Check |
| caution | `warning` Warning, `caution` Caution, `attention` Attention |
| danger | `danger` Danger, `error` Error, `failure` Failure |
| question | `question` Question, `help` Help, `faq` FAQ |
| quotation | `quote` Quote, `cite` Citation |

Types are trimmed and case-insensitive. An authored non-empty title wins. Empty/unknown types
use neutral `data-callout="neutral"` and title `Callout`; they do not receive a canonical type
modifier. Authored `+`/`-` fold intent is retained as `data-callout-fold`.

Markup uses an `<aside role="note">` with base
`obsidian-slidev-callout`, an optional canonical type modifier, `data-callout`, a deterministic
preparation-scoped `aria-labelledby`, a matching title `id`, and
`obsidian-slidev-callout__title`/`__content` children. IDs are unique across the entry and all
expanded notes. Consumers preserve visible title/body and a non-color semantic cue. Producers
do not emit an optional Profile component for core syntax.

## Media

Images use native `<figure>`, `<img>`, and optional `<figcaption>` with stable
`obsidian-slidev-media`, `--image`, `__image`, `__asset`, and `__caption` classes. Authored
labels or the documented filename fallback provide meaningful alt text; explicitly decorative
empty alt remains empty. Empty captions are omitted. Existing native video/audio, Slidev
YouTube, copied-path, link, and recoverable warning behavior remains deterministic and
theme-neutral.

## Tasks and highlights

Task list order, nesting, labels, wrapping, and checked state pass through unchanged; the
producer adds no interaction.

Balanced, non-empty, unescaped `==highlight==` in transformable prose becomes:

```html
<mark class="obsidian-slidev-highlight">highlight</mark>
```

Empty, escaped, unmatched, YAML, inline/fenced code, HTML comment, and complete tag/property
tokens remain literal.

## Protected contexts and transform order

One shared bounded segmentation protects root/slide YAML, fenced code, inline code, HTML
comments, and complete opening/closing/self-closing HTML/Vue tag tokens. Slot prose between
component tokens remains transformable. Unmatched syntax-bearing delimiters are protected
conservatively.

Expansion and conversion are deterministic: embedded content, protected segmentation,
callouts/highlights, media/links/warnings, and task pass-through cannot duplicate or reorder
semantics on retry.

## Failures and safety

Missing notes/assets and other recoverable content failures remain readable and actionable.
Malformed explicit Profile selection, reserved declaration collision, unsafe paths, and
explicit protocol incompatibility stop the affected action. Success and failure leave source
bytes/mtime unchanged and never install or mutate packages, themes, addons, manifests, locks,
or `node_modules`.

## Conformance

Core producer conformance requires the canonical source/generated fixture facts and exact
hashes. Core consumer conformance requires the generated fixture, declaration compatibility,
readable/accessibly associated meaning, and implementation provenance. Unverified runtime
output cannot satisfy conformance.
