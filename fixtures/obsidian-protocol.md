---
theme: ../
addons:
  - slidev-pane
title: Obsidian Protocol Fixture
author: Obsidian Slidev
themeConfig:
  obsidian:
    preset: scholarly
    density: normal
    chrome: auto
    header: false
    pageNumber: true
---

# Obsidian Protocol Fixture

This deck is the theme-side fixture for markup emitted by `obsidian-slidev`.

It verifies that generated HTML, Slidev built-in components, and semantic `obsidian-slidev-*` classes remain styleable without plugin-owned presentation classes.

---
title: Generated Callouts
subtitle: Semantic HTML
---

# Generated Callouts

The plugin converts Obsidian callouts into stable semantic blocks.

<div class="obsidian-slidev-callout obsidian-slidev-callout--note" data-callout="note">
  <div class="obsidian-slidev-callout__title">Note callout</div>
  <div class="obsidian-slidev-callout__content">
    <p>Default note styling should work in ordinary generated decks.</p>
  </div>
</div>

<div class="obsidian-slidev-callout obsidian-slidev-callout--tip" data-callout="tip">
  <div class="obsidian-slidev-callout__title">Tip callout</div>
  <div class="obsidian-slidev-callout__content">
    <p>Callout variants are driven by class names, not inline styles.</p>
  </div>
</div>

<div class="obsidian-slidev-callout obsidian-slidev-callout--warning" data-callout="warning">
  <div class="obsidian-slidev-callout__title">Warning callout</div>
  <div class="obsidian-slidev-callout__content">
    <p>Warnings need to stay readable in both clean and scholarly presets.</p>
  </div>
</div>

---
layout: two-cols
title: Generated Media
subtitle: Image, video, audio
---

# Image Figure

<figure class="obsidian-slidev-media obsidian-slidev-media--image">
  <img src="../public/obsidian-card.svg" alt="Obsidian card fixture" class="obsidian-slidev-media__image obsidian-slidev-media__asset" />
  <figcaption class="obsidian-slidev-media__caption">Image figure emitted from a vault attachment.</figcaption>
</figure>

::right::

# Video Figure

<figure class="obsidian-slidev-media obsidian-slidev-media--video">
  <SlidevVideo controls class="obsidian-slidev-media__video obsidian-slidev-media__asset" aria-label="Protocol fixture video">
    <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
    <p>Your browser does not support videos. <a class="obsidian-slidev-link" href="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4">Open video</a></p>
  </SlidevVideo>
  <figcaption class="obsidian-slidev-media__caption">Video figure emitted through Slidev's built-in component.</figcaption>
</figure>

---
layout: two-cols
title: Audio And YouTube
subtitle: Built-ins and native tags
---

# Audio Figure

<figure class="obsidian-slidev-media obsidian-slidev-media--audio">
  <audio controls preload="metadata" src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" class="obsidian-slidev-media__audio obsidian-slidev-media__asset" aria-label="Protocol fixture audio"></audio>
  <figcaption class="obsidian-slidev-media__caption">Audio figure emitted from a vault attachment.</figcaption>
</figure>

::right::

# YouTube Figure

<figure class="obsidian-slidev-media obsidian-slidev-media--youtube">
  <Youtube id="dQw4w9WgXcQ" />
  <figcaption class="obsidian-slidev-media__caption">YouTube links render through Slidev's built-in component.</figcaption>
</figure>

---
title: Links And Warnings
subtitle: Runtime diagnostics
---

# Links And Warnings

Open a source note with <a class="obsidian-slidev-link" href="obsidian://open?vault=Vault&file=04%20Journal%2F2026%2F05%2F2026-05-03.md">an Obsidian link</a>.

<div class="obsidian-slidev-warning">
  <strong>Slidev warning:</strong> Missing note, heading, block, or attachment diagnostics should stay visible inside a deck.
</div>

| Generated item | Theme responsibility |
| --- | --- |
| `.obsidian-slidev-link` | Make vault links visually distinct |
| `.obsidian-slidev-warning` | Surface unresolved references |
| `.obsidian-slidev-callout` | Preserve Obsidian callout meaning |
| `.obsidian-slidev-media` | Normalize generated media blocks |

---
title: Long Content
subtitle: Lists, tables, code
---

# Long Content

- The clean preset should handle ordinary note-like bullet density.
- The theme owns spacing, typography, and slide chrome.
- The plugin only emits markdown, semantic HTML, and Slidev-native components.
- Long lists need readable rhythm without requiring utility classes.
- Tables and code should stay legible at normal presentation scale.

```ts
export function isObsidianSlidevDeck(frontmatter: Record<string, unknown>) {
  return frontmatter["obsidian-slidev"] === true
}
```

---
title: Scholarly Mode
obsidianPreset: scholarly
obsidianDensity: compact
---

# Scholarly Mode Uses The Same Protocol

The scholarly preset changes visual tokens and layout mood, but keeps the generated markup contract identical.

<div class="obsidian-slidev-callout obsidian-slidev-callout--quote" data-callout="quote">
  <div class="obsidian-slidev-callout__title">Protocol rule</div>
  <div class="obsidian-slidev-callout__content">
    <p>Style decisions belong in the theme; Obsidian parsing belongs in the plugin.</p>
  </div>
</div>

---
title: Clean Preset Contrast
obsidianPreset: clean
---

# Clean Preset Contrast

Clean is the default note-to-presentation mode. It should feel light, readable, and close to a polished Obsidian note.

<div class="obsidian-slidev-callout obsidian-slidev-callout--note" data-callout="note">
  <div class="obsidian-slidev-callout__title">Working note</div>
  <div class="obsidian-slidev-callout__content">
    <p>Use this mode for project updates, planning decks, and ordinary vault notes that become slides.</p>
  </div>
</div>

| Area | Clean expectation |
| --- | --- |
| Headings | Cool-neutral, expressive, not overly formal |
| Tables | Soft structure with subtle row guidance |
| Code | Card-like block with gentle elevation |
| Callouts | Note-like surfaces with rounded edges |

---
title: Scholarly Preset Contrast
obsidianPreset: scholarly
---

# Scholarly Preset Contrast

Scholarly uses the same generated markup, but shifts toward formal reporting: firmer heading rules, booktabs-like tables, quieter callouts, and italic captions.

<div class="obsidian-slidev-callout obsidian-slidev-callout--note" data-callout="note">
  <div class="obsidian-slidev-callout__title">Research note</div>
  <div class="obsidian-slidev-callout__content">
    <p>Use this mode for lab meetings, paper reading, formal progress reports, and thesis-style decks.</p>
  </div>
</div>

| Area | Scholarly expectation |
| --- | --- |
| Headings | Serif, restrained, report-like |
| Tables | Three-line academic table style |
| Code | Flat, low-shadow technical block |
| Callouts | More formal annotation blocks |

---
title: Optional Header
subtitle: Explicit opt-in
obsidianHeader: true
---

# Optional Header

The default chrome is footer-only. A slide can opt into the header when per-slide metadata is intentionally useful.

---
layout: statement
title: Statement Layout
obsidianPreset: clean
---

# Theme Owns Presentation

The plugin should emit stable semantics; the theme should turn those semantics into presentation-native slides.

---
layout: quote
title: Quote Layout
cite: Obsidian Slidev protocol
obsidianPreset: scholarly
---

Generated Obsidian semantics should remain simple enough to inspect, but expressive enough for a theme to elevate.

---
layout: figure
title: Figure Layout
obsidianPreset: clean
---

<figure class="obsidian-slidev-media obsidian-slidev-media--image">
  <img src="../public/obsidian-card.svg" alt="Figure layout fixture" class="obsidian-slidev-media__image obsidian-slidev-media__asset" />
  <figcaption class="obsidian-slidev-media__caption">A media-first slide should not need plugin-owned layout classes.</figcaption>
</figure>

---
layout: references
title: References Layout
obsidianPreset: scholarly
---

# References

1. Obsidian vault notes and generated semantic HTML.
2. Slidev built-in components for media and presentation runtime.
3. Theme-owned visual presets for clean and scholarly decks.

---
layout: center
title: Fixture Complete
---

# Fixture Complete

If this deck builds and previews, the current plugin/theme protocol is still coherent.
