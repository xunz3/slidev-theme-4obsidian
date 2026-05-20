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

## Theme Config API

The stable public configuration surface is `themeConfig.obsidian`.

```yaml
themeConfig:
  obsidian:
    preset: clean
    accent: "#4f6f64"
    density: normal
    chrome: auto
    pageNumber: true
```

Supported keys:

| Key | Values | Default | Purpose |
| --- | --- | --- | --- |
| `preset` | `clean`, `scholarly` | `clean` | Selects the visual system without changing generated markup |
| `accent` | Any CSS color | theme default | Overrides the primary accent color |
| `density` | `compact`, `normal`, `relaxed` | `normal` | Adjusts slide padding, spacing, and body scale |
| `chrome` | `auto`, `on`, `off` | `auto` | Controls header/footer chrome |
| `pageNumber` | `true`, `false` | `true` | Shows or hides page numbers in theme chrome |

Per-slide overrides:

| Frontmatter key | Values | Purpose |
| --- | --- | --- |
| `obsidianPreset` | `clean`, `scholarly` | Override the preset for one slide |
| `obsidianDensity` | `compact`, `normal`, `relaxed` | Override density for one slide |
| `chrome` | `on`, `off` | Force slide chrome on or off |

Theme chrome reads common Slidev frontmatter directly: `author` is used on the left footer, `title` is used as the default middle footer, and page numbers are controlled by `themeConfig.obsidian.pageNumber`.

## CSS Variables

Advanced users can override theme tokens from custom CSS or a Slidev style entry.

| Variable | Purpose |
| --- | --- |
| `--slidev-theme-primary` | Slidev-compatible primary color |
| `--obsidian-accent` | Theme accent used for links, chrome, callouts, and highlights |
| `--obsidian-bg` | Slide background base color |
| `--obsidian-bg-elevated` | Elevated surface color |
| `--obsidian-bg-muted` | Muted code/table background color |
| `--obsidian-frame-bg` | Optional frame-level background overlay |
| `--obsidian-text` | Main text color |
| `--obsidian-text-muted` | Secondary text, captions, and chrome text |
| `--obsidian-border` | Borders for tables, chrome, callouts, and inline code |
| `--obsidian-border-strong` | Strong table and scholarly divider borders |
| `--obsidian-shadow` | Shared elevation shadow |
| `--obsidian-font-sans` | Body and chrome font stack |
| `--obsidian-font-serif` | Heading font stack |
| `--obsidian-font-mono` | Code font stack |
| `--obsidian-slide-padding` | Frame padding |
| `--obsidian-content-gap` | Vertical rhythm between common markdown blocks |
| `--obsidian-body-size` | Base body font size |
| `--obsidian-body-line-height` | Base body line height |
| `--obsidian-heading-scale` | Multiplier for heading size |
| `--obsidian-heading-weight` | Heading font weight |
| `--obsidian-heading-letter-spacing` | Heading tracking |
| `--obsidian-heading-line-height` | Heading line height |
| `--obsidian-list-spacing` | Vertical space between list items |
| `--obsidian-table-header-bg` | Table header background |
| `--obsidian-table-row-alt-bg` | Alternating table row background |
| `--obsidian-code-bg` | Code block background |
| `--obsidian-code-border` | Code block and inline code border |
| `--obsidian-inline-code-bg` | Inline code background |
| `--obsidian-blockquote-bg` | Blockquote background |
| `--obsidian-blockquote-border` | Blockquote left border |
| `--obsidian-blockquote-font-style` | Blockquote font style |
| `--obsidian-callout-bg` | Default generated callout background |
| `--obsidian-callout-border` | Default generated callout border color |
| `--obsidian-callout-radius` | Generated callout border radius |
| `--obsidian-callout-shadow` | Generated callout shadow |
| `--obsidian-warning-bg` | Generated warning background |
| `--obsidian-warning-border` | Generated warning border color |
| `--obsidian-warning-text` | Generated warning text color |
| `--obsidian-caption-font-style` | Generated media caption font style |
| `--obsidian-caption-letter-spacing` | Generated media caption tracking |
| `--obsidian-media-max-height` | Maximum generated image/video height |

## Presets

Use `themeConfig.obsidian.preset` to switch visual systems without changing the generated markup.

| Preset | Use case |
| --- | --- |
| `clean` | Default note-like presentation style |
| `scholarly` | Formal report styling inspired by academic Slidev themes |

`clean` is intentionally warmer and more card-like for everyday vault notes. `scholarly` borrows academic conventions such as serif headings, stronger chrome, booktabs-like tables, flatter code blocks, and italic figure captions.

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
| `statement` | Large centered claim or takeaway |
| `quote` | Pull quote with optional `cite` frontmatter |
| `figure` | Centered media-first slide |
| `references` | Smaller reference/bibliography slide |

## Protocol Fixture

The repository includes `fixtures/obsidian-protocol.md`, a dedicated deck for validating the generated markup contract with `obsidian-slidev`.

It covers:

- Obsidian callout classes
- Generated image, video, audio, and YouTube media figures
- Obsidian links and warning blocks
- Long lists, tables, and code blocks
- Clean and scholarly presets on the same generated protocol
- Clean/scholarly contrast slides with identical content structure
- Preset-specific statement, quote, figure, and references layouts

Run it with:

```bash
pnpm run dev:fixture
pnpm run build:fixture
```

## Development

- `pnpm install`
- `pnpm run dev` to start theme preview of `example.md`
- `pnpm run dev:fixture` to start the protocol fixture preview
- `pnpm run build` to verify the example can be built
- `pnpm run build:fixture` to verify the plugin/theme protocol fixture can be built
