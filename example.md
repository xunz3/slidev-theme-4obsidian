---
theme: ./
addons:
  - slidev-pane
title: Obsidian Slidev Theme
author: Obsidian Slidev
themeConfig:
  obsidian:
    preset: clean
    density: normal
    chrome: auto
    pageNumber: true
---

# Slidev Theme Obsidian

A theme shell for turning Obsidian notes into Slidev presentations.

It focuses on Obsidian-slidev semantics, generated media, callouts, and clean presentation defaults.

`slidev-pane` is enabled in this test deck. Press `p` or use the Pane control to open the pane presenter.

---
title: Notes as Slides
subtitle: Default layout
---

# Notes as Slides

The theme expects `obsidian-slidev` to convert Obsidian-specific syntax into frontend-native Slidev markup.

- Source notes stay in the vault.
- Generated runtime files live under the Slidev workspace.
- The theme styles the generated `obsidian-slidev-*` classes.

<div class="obsidian-slidev-callout obsidian-slidev-callout--note" data-callout="note">
  <div class="obsidian-slidev-callout__title">Obsidian callout</div>
  <div class="obsidian-slidev-callout__content">
    The plugin turns callouts into semantic HTML, and the theme owns the visual treatment.
  </div>
</div>

Open a source note with <a class="obsidian-slidev-link" href="obsidian://open?vault=Vault&file=Notes%2FDeck.md">an Obsidian link</a>.

---
layout: two-cols
title: Media
subtitle: Generated assets
---

# Images

<figure class="obsidian-slidev-media obsidian-slidev-media--image">
  <img class="obsidian-slidev-media__image obsidian-slidev-media__asset" src="./public/obsidian-card.svg" alt="Theme sample card" />
  <figcaption class="obsidian-slidev-media__caption">Generated media keeps a predictable class structure.</figcaption>
</figure>

::right::

# Video and YouTube

<figure class="obsidian-slidev-media obsidian-slidev-media--youtube">
  <Youtube id="dQw4w9WgXcQ" />
  <figcaption class="obsidian-slidev-media__caption">YouTube links can render through Slidev's built-in component.</figcaption>
</figure>

---
layout: section
---

# Presets

The same markup can switch visual systems through `themeConfig.obsidian.preset`.

---
title: Scholarly preset
obsidianPreset: scholarly
---

# Scholarly Is a Preset

It is not the whole theme. It only changes the chrome and typography tokens while keeping the same Obsidian integration contract.

<div class="obsidian-slidev-warning">
  <strong>Slidev warning:</strong> unresolved links and missing assets stay visible instead of silently disappearing.
</div>

| Layer | Responsibility |
| --- | --- |
| `obsidian-slidev` | Convert vault notes into Slidev-native markup |
| `slidev-theme-obsidian` | Render Obsidian semantics and style presets |

---
layout: center
---

# Next

Use `preset: clean` for note-like decks and `preset: scholarly` for formal reports.
