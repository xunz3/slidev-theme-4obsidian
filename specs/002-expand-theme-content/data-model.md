# Data Model: Expand Theme Content

The feature has no persisted storage model. Its entities are normalized authoring inputs,
rendered semantic structures, resolved presentation state, and retained quality evidence.

## Shared Normalization Rules

- String inputs are trimmed before validation.
- An omitted value is distinct from an explicitly empty value only where the contract says so
  (`alt` and `logoAlt` use this distinction for decoration).
- Invalid high-precedence configuration never suppresses a valid lower-precedence value.
- Collections preserve declaration/source order and intentional duplicates.
- Empty optional fields do not create empty labels, cards, captions, or wrappers.
- Component and layout state belongs to its rendered slide instance; it is never copied to a
  global current-slide singleton.

## 1. Callout

One static semantic notice.

| Field | Type | Rules |
| --- | --- | --- |
| `rawType` | unknown | Public `type` input before normalization |
| `type` | `CalloutType` or `null` | Canonical supported value; `null` is neutral fallback |
| `title` | string | Trimmed authored title, type default, or neutral `Callout` |
| `body` | rendered slot content | May contain paragraphs, lists, links, code, and other Markdown |
| `titleId` | per-instance string | Unique within the rendered document |
| `semanticFamily` | info, positive, caution, danger, question, quotation, or neutral | Visual grouping only; does not replace visible type/title text |

`CalloutType` is the closed set:

```text
note, info, todo, abstract, summary,
tip, success, check,
warning, caution, attention,
danger, error, failure,
question, help, faq,
quote, cite
```

Default titles are `Note`, `Info`, `To do`, `Abstract`, `Summary`, `Tip`, `Success`, `Check`,
`Warning`, `Caution`, `Attention`, `Danger`, `Error`, `Failure`, `Question`, `Help`, `FAQ`,
`Quote`, and `Citation`.

Validation:

- Supported type matching is case-insensitive after trimming.
- Empty, non-string, or unsupported types resolve to `type = null`.
- A non-empty authored title is retained even when the type is neutral.
- The neutral state emits no supported-type modifier and uses `data-callout="neutral"`.
- The title always exists and labels the `role="note"` container.

## 2. Figure

One image presentation unit.

| Field | Type | Rules |
| --- | --- | --- |
| `src` | string | Trimmed local or remote image source; empty means missing source |
| `altInput` | omitted, empty string, or non-empty string | Tri-state accessibility input |
| `caption` | string or absent | Trimmed; empty captions are omitted |
| `resolvedAlt` | string | See precedence below |
| `decorative` | boolean | True only for explicit `alt=""` |
| `fit` | string | Shared media-fit value; layout default is `cover` |
| `loadState` | missing, pending, ready, or failed | Render state |
| `failureText` | string or absent | Resolved descriptive text retained when media is unavailable |

Accessible-text precedence:

```text
explicit alt=""       → decorative image, resolvedAlt=""
non-empty alt         → resolvedAlt=alt
alt omitted + caption → resolvedAlt=caption
alt omitted + no caption → resolvedAlt="Figure"
```

State transitions:

```text
empty src → missing → descriptive fallback, no broken img
valid-looking src → pending → ready
valid-looking src → pending → failed → descriptive fallback, no broken img
```

Validation:

- The media shell reserves bounded geometry in every state.
- Decorative images have `alt=""` and are excluded from the accessibility tree.
- A failed/missing meaningful image retains `resolvedAlt` as visible or programmatic text.
- `figcaption` exists only for a non-empty caption.

## 3. Author Record and Author Collection

`RawAuthor` is either a string or an object with optional `name`, `institution`, and `email`.

| Normalized field | Type | Rules |
| --- | --- | --- |
| `name` | string | Trimmed name, or first non-empty email/institution fallback |
| `institution` | string or absent | Trimmed; omitted when empty |
| `email` | string or absent | Trimmed; omitted when empty |
| `emailHref` | `mailto:` URL or absent | Present only for a syntactically actionable address |
| `sourceIndex` | non-negative integer | Original declaration position |

An actionable email has exactly one `@`, non-empty non-whitespace text on both sides, and no
whitespace. Invalid non-empty email text may remain visible metadata but never becomes a link.

Collection rules:

- Resolve root `authors` first; use singular root `author` only when `authors` yields no valid
  records.
- A string becomes `{ name: string }`.
- An object with no non-empty supported field is invalid and removed.
- Preserve order and duplicates; do not sort or deduplicate.
- Render no collection wrapper when no valid record remains.
- Render one card/list item per normalized record and no empty field label.

Relationships:

- `SlideFrame` consumes the collection's names for optional footer text.
- `cover` consumes full records.
- `Authors` consumes full records and actionable email state.
- A closing layout may opt into the same collection; it does not own a second author model.

## 4. Closing Slide

One shared closing experience exposed by two equivalent names.

| Field | Type | Rules |
| --- | --- | --- |
| `layoutName` | `end` or `thanks` | Both instantiate the same implementation |
| `message` | title string and/or default slot | Primary closing content; existing default-slot use remains valid |
| `contact` | string or absent | Optional trimmed contact text |
| `showAuthors` | boolean | Default `false` for built-in compatibility |
| `authors` | Author Collection | Included only when `showAuthors` is true and records exist |
| `logo` | string or absent | Author-controlled image source |
| `logoAltInput` | omitted, empty, or non-empty string | Same decoration distinction as Figure |

Validation:

- `end` and `thanks` have identical props, slots, DOM, defaults, and behavior.
- Omitted contact/authors/logo leaves no empty region.
- Explicit `logoAlt=""` marks a decorative logo; a meaningful logo needs non-empty text.
- A missing/failed logo retains any meaningful description and does not move other content.
- DOM order is message, contact, authors, logo; CSS may arrange these regions visually.

## 5. Image-and-Text Slide

One narrative plus one primary figure.

| Field | Type | Rules |
| --- | --- | --- |
| `layoutName` | `image-left` or `image-right` | Public Slidev layout name |
| `orientation` | left or right | Visual figure placement only |
| `image` | string or absent | Existing Slidev-compatible image input |
| `imageAlt` | omitted, empty, or non-empty string | Passed through Figure accessibility precedence |
| `caption` | string or absent | Optional figure caption |
| `backgroundSize` | string | Existing key retained; default `cover` |
| `class` | string or supported class input | Existing key retained |
| `narrative` | rendered default slot | Heading and body content |
| `figure` | Figure | Derived from image metadata when `image` is present |

Validation:

- DOM order is narrative then figure for both orientations.
- CSS grid areas place the figure left or right without changing DOM order.
- Both names expose the same image/description/caption/body capability.
- Missing image collapses to a readable narrative layout without an empty media landmark.
- Long caption/prose remains inside the content region; documented density/content fallback
  applies when content exceeds the canonical canvas.

## 6. Code Slide

| Field | Type | Rules |
| --- | --- | --- |
| `title` | string or absent | Visible title when provided |
| `codeRegion` | rendered default slot | One primary code sample is the intended use |
| `chrome` | resolved presentation chrome | Must not overlap title or code |

Validation:

- A provided title remains visible and is represented in heading structure.
- Missing title gives its space to the code region.
- The primary code wrapper uses available content width.
- Long lines scroll horizontally inside the code region.
- Excess lines use contained vertical overflow and never expand the slide canvas.

## 7. Ordered Sequence

The same source structure supports `Steps` and `Timeline`.

| Field | Type | Rules |
| --- | --- | --- |
| `kind` | steps or timeline | Selects shared visual vocabulary |
| `list` | one rendered `<ol>` | Supplied through the default Markdown slot |
| `items` | ordered `<li>` collection | Source order is canonical |
| `label` | visible item content | A timeline may contain `<time datetime>` |
| `count` | non-negative integer | Derived from direct list items |

Validation:

- Zero items show no orphan marker/rail.
- One item shows one marker and no trailing relationship line.
- Many items preserve source order.
- Decoration is ignored by assistive technology; list semantics remain.
- Non-list slot content remains readable but does not receive sequence decoration.

## 8. Status Label

| Field | Type | Rules |
| --- | --- | --- |
| `kind` | tag or badge | Category versus status presentation |
| `text` | rendered inline content | Must contain visible wording |
| `cue` | shape/border/icon pattern | Differs by kind independently of color |
| `interactive` | false | No tabindex, button role, or live-region role |

Long, symbolic, and bilingual text wraps or truncates only through the documented containment
rule; it is never converted into an unlabeled color swatch.

## 9. Keyboard Sequence

| Field | Type | Rules |
| --- | --- | --- |
| `keys` | string array | One or more non-empty trimmed labels |
| `accessibleText` | string | Labels joined by a readable ` plus ` separator |
| `interactive` | false | Native `<kbd>` semantics, no focus/click behavior |

A default slot creates one key label. The structured `keys` form creates an outer `<kbd>` with
one inner `<kbd>` per key and visible `+` separators.

## 10. Accent Override

| Field | Type | Rules |
| --- | --- | --- |
| `rawLocal` | unknown | Slide `accent` frontmatter |
| `localAccent` | valid CSS color or absent | Normalized with the shared color validator |
| `deckAccent` | valid CSS color or absent | Deck `themeConfig.presentation.accent` |
| `presetAccent` | CSS token | Active preset/mode default |
| `resolvedAccent` | CSS color/token result | First valid local, deck, then preset |
| `source` | local, deck, or preset | Diagnostic precedence source |
| `scope` | rendered SlideFrame instance | Never document root for a local value |

State sequence across navigation:

```text
valid local slide → local
next slide with no local value → deck or preset
invalid/empty local slide → deck or preset
another valid local slide → that slide's local value
```

No state is copied from one slide instance to another. Protected brand artwork and locked
institutional colors are not consumers of the resolved accent.

## 11. Presentation Task Item

| Field | Type | Rules |
| --- | --- | --- |
| `checked` | boolean | Preserved from emitted Markdown input |
| `disabled` | true | Applied idempotently by theme rendering setup |
| `tabIndex` | `-1` / not focusable | Must not enter keyboard order |
| `label` | rendered list-item content | May wrap and contain nested lists |
| `depth` | non-negative integer | Derived from list nesting |

Render transition:

```text
Slidev-emitted checkbox → normalize presentation state → disabled/non-focusable checked state
```

No user-triggered state transition exists and no task state is persisted.

## 12. Highlight

| Field | Type | Rules |
| --- | --- | --- |
| `content` | inline prose | Native `<mark>` or accepted generated highlight class |
| `surface` | prose only | Code blocks and inline code are excluded |
| `cue` | background plus boundary/text treatment | Distinct from links, selection, and code |

Literal highlight-like characters in code remain code text and do not create a Highlight entity.

## 13. Performance Evidence

### Output Measurement

| Field | Type |
| --- | --- |
| `deckId` | example/standalone or protocol |
| `phase` | before or after |
| `commit`, tool versions, lockfile hash | reproducibility metadata |
| `files` | sorted path/byte records |
| `logicalBundles` | main CSS, main JS, SlideFrame, and any new chunk |
| `totalBytes`, `baselineBytes`, `maximumBytes` | integers |
| `status` | pass or fail |

### Navigation Measurement

| Field | Type |
| --- | --- |
| `scenario`, `preset`, `mode` | stable identifiers |
| `samplesMs` | at least 20 post-warm-up values |
| `medianMs`, `p95Ms`, `maximumMs` | derived numbers |
| `visibilityMs`, `stabilityMs` | per-sample timing components |
| `layoutShiftEntries` | target-attributed evidence |
| `absoluteMaximumMs` | 100 |
| `relativeMaximumMs` | unchanged-control baseline × 1.10 |
| `environment` | commit, OS, Node, pnpm, Chromium, lockfile hash, viewport |
| `status` | pass or fail |

Nearest-rank p95 uses the sorted value at `ceil(0.95 × N) - 1`.
