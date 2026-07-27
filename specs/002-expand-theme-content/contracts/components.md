# Contract: Public Content Components

## Scope

Selecting `slidev-theme-lilas` makes these PascalCase components available in ordinary Slidev
Markdown without an addon or `obsidian-slidev`:

```text
Callout, Figure, Authors, Steps, Timeline, Tag, Badge, Kbd
```

These eight names are the complete new public component surface. SFCs under `internals/` are
implementation details and are not auto-registered.

All components:

- render the same content structure in `default`, `ucas`, and `ict`;
- support light and dark modes through shared tokens;
- forward normal HTML `class` and `style` attributes to their root;
- create no interactive/focusable behavior unless the authored content contains a real link;
- require no conversion plugin.

## `Callout`

### Authoring

```md
<Callout type="warning" title="Reproducibility">

Keep the **raw observations** and link to the [protocol](https://example.com).

1. Record the environment.
2. Preserve the input.

</Callout>
```

Props:

| Prop | Type | Default |
| --- | --- | --- |
| `type` | string | neutral |
| `title` | string | Type-specific title or `Callout` |

The default slot accepts formatted Markdown/Vue content.

### Type and title resolution

| Type group | Canonical values | Default titles |
| --- | --- | --- |
| Informational | `note`, `info`, `todo`, `abstract`, `summary` | Note, Info, To do, Abstract, Summary |
| Positive | `tip`, `success`, `check` | Tip, Success, Check |
| Caution | `warning`, `caution`, `attention` | Warning, Caution, Attention |
| Danger | `danger`, `error`, `failure` | Danger, Error, Failure |
| Question | `question`, `help`, `faq` | Question, Help, FAQ |
| Quotation | `quote`, `cite` | Quote, Citation |

Type input is trimmed and matched case-insensitively. Empty/unsupported input stays neutral,
uses the base class without a supported-type modifier, and defaults to `Callout`. A non-empty
authored title always wins.

### Render contract

```html
<aside
  class="obsidian-slidev-callout [obsidian-slidev-callout--TYPE]"
  data-callout="TYPE-OR-neutral"
  role="note"
  aria-labelledby="UNIQUE_TITLE_ID"
>
  <div id="UNIQUE_TITLE_ID" class="obsidian-slidev-callout__title">...</div>
  <div class="obsidian-slidev-callout__content">...</div>
</aside>
```

- The modifier appears only for a canonical type.
- Type meaning has a visible text/shape cue and never relies on color alone.
- The title remains readable when long or bilingual.
- No alert/live-region role is added.

## `Figure`

### Authoring

```md
<Figure
  src="/results.png"
  alt="Accuracy increases across three evaluation rounds"
  caption="Figure 1. Evaluation accuracy by round."
/>
```

Caption fallback:

```md
<Figure
  src="/architecture.svg"
  caption="The parser feeds a shared render tree."
/>
```

Explicitly decorative:

```md
<Figure src="/divider.svg" alt="" />
```

Props:

| Prop | Type | Default |
| --- | --- | --- |
| `src` | string | empty/missing state |
| `alt` | string or omitted | Caption, then `Figure` fallback |
| `caption` | string | omitted |
| `fit` | `contain` or `cover` | `contain` |

### Render contract

The ready state uses:

```html
<figure class="obsidian-slidev-media obsidian-slidev-media--image">
  <div class="obsidian-slidev-media__viewport">
    <img
      class="obsidian-slidev-media__image obsidian-slidev-media__asset"
      src="..."
      alt="..."
    >
  </div>
  <figcaption class="obsidian-slidev-media__caption">...</figcaption>
</figure>
```

Rules:

- Explicit `alt=""` is decorative and is not replaced by the caption.
- Omitted `alt` uses a non-empty caption; if both are omitted, it uses `Figure`.
- Empty captions create no `figcaption`.
- The media viewport reserves bounded space before image decode.
- Missing/failed media removes the broken image visual and retains meaningful description text.
- Component-authored structure and computed treatment match an equivalent generated
  `.obsidian-slidev-media--image` figure.

## `Authors`

### Authoring

Root deck metadata:

```yaml
authors:
  - Ada Lovelace
  - name: Grace Hopper
    institution: US Navy
    email: grace@example.org
```

Slide content:

```md
<Authors />
```

The first delivery has no per-instance author-data prop. It reads root `authors`, then uses
legacy root `author` only if no valid plural entry exists.

### Render contract

- A valid collection renders one `<ul class="presentation-authors">`.
- Each normalized entry renders one `<li class="presentation-author">`.
- Name, institution, and email fields appear only when non-empty.
- Order and intentional duplicates are preserved.
- An email matching `^[^\s@]+@[^\s@]+$` becomes a keyboard-reachable `mailto:` link with visible
  focus; other email text is non-actionable.
- No valid entries means no list or empty placeholder.

## `Steps`

### Authoring

```md
<Steps>

1. **Collect** the observations.
2. **Normalize** the measurements.
3. **Report** uncertainty.

</Steps>
```

The default slot should contain one Markdown ordered list. Formatted item content is allowed.

### Render contract

- The compiled `<ol>` and `<li>` elements remain the semantic structure.
- Source order is unchanged.
- Visible sequence markers remain distinguishable without color.
- Zero/one/many items produce no orphan connector or broken decoration.
- Non-list slot content remains readable but receives no sequence decoration.

## `Timeline`

### Authoring

```md
<Timeline>

1. <time datetime="2024-09">Sep 2024</time> — Dataset frozen.
2. <time datetime="2025-02">Feb 2025</time> — Evaluation completed.
3. **Today** — Results released.

</Timeline>
```

The default slot and list rules match `Steps`. A native `time` element is optional; when used,
its `datetime` value is author-controlled.

### Render contract

- Chronology is the source `<ol>` order.
- Labels and relationships remain meaningful without the decorative rail/dots.
- Decorative connectors are excluded from the accessibility tree.
- Long/bilingual labels wrap within the component.

## `Tag`

```md
<Tag>Method</Tag>
```

- Renders one non-focusable `.presentation-tag` inline text container.
- Uses a category-like outline/shape cue plus visible text.
- Adds no button, link, status, or live-region role.

## `Badge`

```md
<Badge>Complete</Badge>
```

- Renders one non-focusable `.presentation-badge` inline text container.
- Uses a status-like fill/border/icon cue plus visible status wording.
- Remains visually distinct from `Tag` without depending on hue.
- Adds no implicit or explicit live-region role.

## `Kbd`

Single key:

```md
Press <Kbd>Esc</Kbd> to leave the overview.
```

Chord:

```md
Open the command menu with <Kbd :keys="['Ctrl', 'Shift', 'P']" />.
```

Props:

| Prop | Type | Default |
| --- | --- | --- |
| `keys` | string array | Uses the default slot as one key |

Rules:

- Empty array entries are removed.
- A non-empty `keys` array takes precedence over the default slot.
- A chord uses an outer `<kbd class="presentation-kbd-sequence">`, inner `<kbd>` per key, and
  visible `+` separators.
- Accessible text reads the keys in order with a `plus` separator.
- Keycaps are never buttons and never enter the tab order.

## Shared Overflow and Accessibility Rules

- Inline labels/keycaps may wrap but cannot create slide-level horizontal overflow.
- Steps/timelines and author cards use contained layout overflow rather than clipping content.
- Long callout/figure content uses the existing scrollable frame as the last-resort containment
  fallback.
- All text/background/border combinations are reviewed in every preset and supported mode.
- Email is the only interactive element created by these components; it retains the theme's
  focus-visible treatment.

## Generated-markup Equivalence

For the same type/text/media input:

- `Callout` and generated `.obsidian-slidev-callout` expose the same core class/data/title/body
  hierarchy and computed preset treatment.
- `Figure` and generated `.obsidian-slidev-media--image` expose the same figure/image/caption
  hierarchy and computed preset treatment.
- The theme continues to accept existing generated markup without requiring component use.
