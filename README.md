# slidev-theme-obsidian

[![NPM version](https://img.shields.io/npm/v/slidev-theme-obsidian?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-obsidian)

A Slidev theme shell for Obsidian-driven presentations.

The theme is designed to work with `obsidian-slidev`: the plugin converts Obsidian notes into Slidev-native markup, and this theme renders the resulting Obsidian semantics with stable layouts, media styles, and visual presets.

## Install

Add the following frontmatter to your `slides.md`. Start Slidev then it will prompt you to install the theme automatically.

<pre><code>---
theme: <b>obsidian</b>
themeConfig:
  obsidian:
    preset: clean
    density: normal
    chrome: auto
    pageNumber: true
---</code></pre>

Learn more about [how to use a theme](https://sli.dev/guide/theme-addon#use-theme).

## Obsidian Integration

`obsidian-slidev` can emit the following frontend-native structures, and this theme styles them directly:

| Source idea | Generated target |
| --- | --- |
| Obsidian callouts | `.obsidian-slidev-callout` blocks |
| Vault images, videos, and audio | `.obsidian-slidev-media` figures |
| YouTube links | Slidev's built-in `<Youtube>` component |
| Video embeds | Slidev's built-in `<SlidevVideo>` component |
| Obsidian note links | `.obsidian-slidev-link` anchors |
| Missing references | `.obsidian-slidev-warning` blocks |

The theme does not parse Obsidian Markdown by itself. Keep conversion logic in `obsidian-slidev`; keep rendering and presentation in this theme.

## Presets

Use `themeConfig.obsidian.preset` to switch visual systems without changing the generated markup.

| Preset | Use case |
| --- | --- |
| `clean` | Default note-like presentation style |
| `scholarly` | Formal report styling inspired by academic Slidev themes |

Supported options:

```yaml
themeConfig:
  obsidian:
    preset: clean # clean | scholarly
    accent: "#4f6f64"
    density: normal # compact | normal | relaxed
    chrome: auto # auto | on | off
    pageNumber: true
```

## Layouts

This theme provides the following layouts:

| Layout | Purpose |
| --- | --- |
| `default` | Main content slides with optional header/footer chrome |
| `cover` | Opening slide, chrome hidden by default |
| `intro` | Introductory slide with normal chrome behavior |
| `section` | Section divider, chrome hidden by default |
| `center` | Centered single-message slide |
| `two-cols` | Two-column content layout using `::right::` |

Per-slide `chrome: on` or `chrome: off` overrides the theme-level chrome setting.

Per-slide `obsidianPreset: scholarly` and `obsidianDensity: compact` can override the global preset and density for one slide.

## Development

- `pnpm install`
- `npm run dev` to start theme preview of `example.md`
- `npm run build` to verify the example can be built
