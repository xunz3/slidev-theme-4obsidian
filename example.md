---
theme: ./
addons:
  - slidev-pane
title: Slidev Presentation Theme
subtitle: Reusable presets with optional Obsidian integration
authors:
  - name: Theme Demo
    institution: Slidev presentations
    email: deck@example.com
  - name: Slidev Theme
    institution: Frontend-native rendering
    email: theme@example.com
themeConfig:
  presentation:
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
---

# Slidev Presentation Theme

---
title: Notes as Slides
subtitle: Standalone components
---

# Notes as Slides

The theme works with ordinary Slidev Markdown and also styles markup emitted by `obsidian-slidev`.

<Callout type="note" title="One rendering vocabulary">

Write semantic content directly with theme components, or let the conversion plugin emit its compatible frontend structure.

</Callout>

Open a source note with <a class="obsidian-slidev-link" href="obsidian://open?vault=Vault&file=Notes%2FDeck.md">an Obsidian link</a>.

---
layout: two-cols
title: Figure and authors
---

# Accessible Figure

<Figure
  src="./public/obsidian-card.svg"
  alt="A note card connected to a presentation canvas"
  caption="Figure 1. Media reserves space before it loads."
/>

::right::

# Deck Authors

<Authors />

---
layout: section
---

# Presets

The same authoring surface switches visual systems without changing its content structure.

---
title: UCAS preset
presentationPreset: ucas
---

# UCAS Is an Override

UCAS can be selected for institutional decks without changing the standalone or generated-markup contracts.

<Callout type="warning" title="Visible failure">

Unresolved links and missing assets stay visible instead of silently disappearing.

</Callout>

| Layer | Responsibility |
| --- | --- |
| `obsidian-slidev` | Convert vault notes into Slidev-native markup |
| `slidev-theme-lilac` | Render layouts, presets, components, and optional Obsidian semantics |

---
title: Local accent
accent: "#9a3412"
---

# Accent Belongs to This Slide

The local accent affects [links](https://example.com), focus, general callouts, and reading cues without changing semantic or institutional colors.

<Callout type="info">This informational surface follows the local accent.</Callout>
<Callout type="success">Success keeps its own semantic treatment.</Callout>

---
layout: image-left
title: Image and text
image: ./public/obsidian-card.svg
imageAlt: A note card connected to a presentation canvas
caption: Figure 2. Narrative stays first in document order.
backgroundSize: contain
---

# Image-and-Text Layout

The image is visually left, but this narrative remains first for reading order.

- Existing `image`, `class`, and `backgroundSize` inputs remain accepted.
- `imageAlt` and `caption` add accessible figure semantics.

---
layout: code
title: Code layout
---

# Full-Width Code

```ts
export const resolveAccent = (
  local: string | undefined,
  deck: string | undefined,
) => firstValidCssColor(local, deck)
```

Long lines scroll inside the code region while the slide frame and chrome remain fixed.

---
layout: two-cols
title: Process components
---

# Steps

<Steps>

1. **Collect** observations.
2. **Normalize** measurements.
3. **Report** uncertainty.

</Steps>

::right::

# Timeline

<Timeline>

1. <time datetime="2026-06">June</time> — Dataset frozen.
2. <time datetime="2026-07">July</time> — Results released.

</Timeline>

---
title: Status and keyboard
---

# Compact Reading Cues

<Tag>Method</Tag>
<Tag>双语标签</Tag>

<Badge>Complete</Badge>
<Badge>✓ Reviewed</Badge>

Press <Kbd>Esc</Kbd> to leave the overview.

Open the command menu with <Kbd :keys="['Ctrl', 'Shift', 'P']" />.

---
title: Tasks and highlights
---

# Presentation-Only Tasks

- [x] Reproduce the result
- [ ] Archive the environment
  - [x] Preserve raw observations
  - [ ] Record a wrapped bilingual follow-up with enough text to demonstrate stable alignment · 记录换行后的双语任务

Compare the <mark>validated cohort</mark> with a [linked cohort](https://example.com), *emphasis*, and `inline code`.

```md
Literal ==highlight-like syntax== stays code.
```

---
title: Generated compatibility
---

# Existing Generated Markup Still Works

<div class="obsidian-slidev-warning">
  <strong>Compatibility:</strong> existing <code>.obsidian-slidev-*</code> structures need no migration.
</div>

<ul class="obsidian-slidev-task-list">
  <li class="task-list-item"><input type="checkbox" checked> Generated checked task</li>
  <li class="task-list-item"><input type="checkbox"> Generated open task</li>
</ul>

Generated <span class="obsidian-slidev-highlight">highlight markup</span> receives the same prose treatment without adding a parser.

---
layout: end
title: Closing
contact: deck@example.com
showAuthors: true
logo: ./public/obsidian-card.svg
logoAlt: Slidev theme sample card
---

# Thank You

Use ordinary Markdown, opt into the public components, or keep compatible generated markup.
