# Contract: Public Layouts

## Scope

The theme adds or overrides these Slidev layout names:

```text
end, thanks, image-left, image-right, code
```

Every layout renders through `SlideFrame`, accepts the shared preset/density/accent resolution,
and uses one implementation across `default`, `ucas`, and `ict`.

Standard theme layout inputs remain available:

| Input | Purpose |
| --- | --- |
| `title` / `subtitle` | Slide metadata and optional shared header |
| `chrome` | Explicit `auto`, `on`, or `off` layout override |
| Default slot | Authored Markdown/Vue content in source order |

## `end` and `thanks`

`end` and `thanks` are two names for exactly the same component implementation. Their props,
slots, defaults, DOM, styling, accessibility, and fallback behavior are identical.

### Minimal authoring

```md
---
layout: end
---

# Thank you

Questions and discussion
```

The equivalent alias:

```md
---
layout: thanks
---

# Thank you
```

### Optional metadata

```yaml
layout: end
contact: research@example.org
showAuthors: true
logo: /lab-mark.svg
logoAlt: Example Research Lab
```

| Input | Type | Default | Rules |
| --- | --- | --- | --- |
| `contact` | string | omitted | Trimmed; actionable only when it is a valid email |
| `showAuthors` | boolean | `false` | Uses root author collection when true |
| `logo` | string | omitted | Local or author-controlled source |
| `logoAlt` | string or omitted | `Presentation logo` | Explicit empty string is decorative |

`showAuthors` defaults to false so overriding Slidev's built-in `end` layout does not inject new
content into an existing deck. Authors can opt in through metadata or place `<Authors />` in
their content.

### Structure and behavior

Logical DOM order:

```text
primary default-slot message
→ optional contact
→ optional author collection
→ optional logo
```

- The default slot remains the primary closing message and preserves existing built-in use.
- `chrome: auto` hides closing chrome; explicit `chrome: on` still works.
- Omitted optional regions consume no grid space.
- A valid email contact is a visible-focus `mailto:` link; other text is non-interactive.
- Explicit `logoAlt=""` is decorative. Omitted alt uses `Presentation logo`.
- A failed/missing logo retains meaningful description and does not shift the other regions.
- Long/bilingual message and metadata use contained wrapping at the canonical viewport.

## `image-left` and `image-right`

The two names expose one image-and-text contract. They differ only in the visual grid area
assigned to the figure.

### Authoring

```md
---
layout: image-left
image: /experiment.png
imageAlt: Diagram of the three-stage experiment
caption: Figure 2. Collection, analysis, and validation stages.
backgroundSize: contain
---

# Experimental design

The narrative remains first in document reading order.
```

Mirrored:

```md
---
layout: image-right
image: /experiment.png
imageAlt: Diagram of the three-stage experiment
caption: Figure 2. Collection, analysis, and validation stages.
backgroundSize: contain
---

# Experimental design

The same narrative and figure contract applies.
```

### Inputs

| Input | Type | Default | Rules |
| --- | --- | --- | --- |
| `image` | string | omitted | Existing Slidev built-in key |
| `class` | string/class input | omitted | Existing built-in key remains accepted |
| `backgroundSize` | CSS size/fit string | `cover` | Existing key/default remains accepted |
| `imageAlt` | string or omitted | Caption, then `Figure` | Explicit empty is decorative |
| `caption` | string | omitted | Empty caption creates no `figcaption` |

Compatibility requirements:

- Existing decks using `image`, `class`, and `backgroundSize` retain their authored visual
  result. `cover` and `contain` are the documented primary fit values; any previously accepted
  valid value remains covered by a compatibility fixture.
- New accessibility/caption inputs do not require raw `<figure>` markup.
- The metadata path uses the same semantic figure treatment as the public `Figure` component.

### Structure and orientation

Both layouts use this DOM order:

```text
narrative region → figure region
```

Visual areas:

| Layout | Left visual area | Right visual area |
| --- | --- | --- |
| `image-left` | Figure | Narrative |
| `image-right` | Narrative | Figure |

Rules:

- CSS placement, not DOM order, mirrors the slide.
- Both regions have `min-width: 0` and bounded overflow.
- Missing/empty `image` removes the figure region and expands the narrative without an empty
  landmark.
- A long caption wraps within the figure region.
- Long/bilingual narrative remains readable; when it exceeds the canvas, authors use compact
  density, shorten content, or split the slide as the documented authoring fallback.
- Image decode/failure cannot move the narrative region after the slide is visible.

## `code`

### Authoring

````md
---
layout: code
title: Solver implementation
---

# Solver implementation

```ts
export const solve = (input: Input) => {
  return normalize(input)
}
```
````

The visible Markdown heading is the title region. As with the theme's other normal layouts,
frontmatter `title` remains navigation/TOC/optional-header metadata and does not silently
duplicate the visible heading.

### Structure

```text
optional first visible heading
→ primary full-width code region
→ optional subordinate authored content
```

Rules:

- The first visible `h1` remains visible above the code region.
- With no visible heading, the code region receives the available title space.
- The primary `pre`/`.slidev-code-wrapper` uses the full content width rather than the shared
  prose measure.
- Long unbroken lines scroll horizontally inside the code wrapper.
- Excess code lines use contained vertical overflow; slide frame/chrome never overlap.
- Slidev code highlighting, annotations, line numbers, and copy control remain accepted.
- The layout introduces no separate code renderer or dependency.

## Shared Reading-order and Accessibility Contract

- Layout CSS may place regions but cannot use DOM reordering that changes reading order.
- Every layout has one `main` landmark through `SlideFrame`.
- Meaningful images have text alternatives; decorative images have explicit empty alt.
- Static labels/logos do not become focusable.
- Real contact/email links remain keyboard reachable with a visible focus indicator.
- `end`/`thanks` and both image orientations pass short, long, and bilingual cases in all
  presets and supported modes at 980 × 552.

## Compatibility Contract

- Existing ordinary Slidev Markdown using the built-in `end`, `image-left`, or `image-right`
  names requires no authoring/configuration change.
- Existing theme layout props and shared chrome behavior remain accepted.
- New layout styling uses shared tokens; no preset requires a different slot or metadata key.
