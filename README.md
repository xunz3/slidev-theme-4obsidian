# slidev-theme-obsidian

[![NPM version](https://img.shields.io/npm/v/slidev-theme-obsidian?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-obsidian)

A Slidev theme shell for Obsidian-driven presentations.

The theme is designed to work with `obsidian-slidev`: the plugin converts Obsidian notes into Slidev-native markup, and this theme renders the resulting Obsidian semantics with stable layouts, media styles, and visual presets.

## Install

Add the following frontmatter to your `slides.md`. Start Slidev then it will prompt you to install the theme automatically.

<pre><code>---
theme: <b>obsidian</b>
title: My Deck
subtitle: Optional deck subtitle
authors:
  - name: xunz
    institution: UCAS
    email: xun.zhang0506@gmail.com
  - name: jane
    institution: UCAS
    email: jane@example.com
themeConfig:
  obsidian:
    preset: clean
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
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
title: My Deck
subtitle: Optional deck subtitle
footer: Custom center footer
authors:
  - name: xunz
    institution: UCAS
    email: xun.zhang0506@gmail.com
  - name: jane
    institution: UCAS
    email: jane@example.com
themeConfig:
  obsidian:
    preset: clean
    accent: "#345f8f"
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
```

Supported keys:

| Key | Values | Default | Purpose |
| --- | --- | --- | --- |
| `preset` | `clean`, `scholarly` | `clean` | Selects the visual system without changing generated markup |
| `accent` | Any CSS color | theme default | Overrides the primary accent color |
| `density` | `compact`, `normal`, `relaxed` | `normal` | Adjusts slide padding, spacing, and body scale |
| `chrome` | `auto`, `on`, `off` | `auto` | Controls footer metadata chrome |
| `header` | `true`, `false` | `false` | Shows the optional per-slide title/subtitle header |
| `footerAuthors` | `true`, `false` | `true` | Shows or hides author names in the left footer |
| `pageNumber` | `true`, `false` | `true` | Shows or hides the right footer page number |

Per-slide overrides:

| Frontmatter key | Values | Purpose |
| --- | --- | --- |
| `obsidianPreset` | `clean`, `scholarly` | Override the preset for one slide |
| `obsidianDensity` | `compact`, `normal`, `relaxed` | Override density for one slide |
| `chrome` | `on`, `off` | Force slide chrome on or off |
| `obsidianHeader` | `true`, `false` | Force the optional header on or off for one slide |
| `footerAuthors` | `true`, `false` | Override left footer author visibility for one slide |
| `footer` | Text | Override the centered footer content for one slide |

`themeConfig` is Slidev's standard theme/addon configuration object. This theme keeps its own options under `themeConfig.obsidian` so they do not collide with Slidev core fields or other addons. `density` selects the spacing scale: `compact` uses tighter padding and lists for information-dense slides, `normal` is the default, and `relaxed` gives content more breathing room.

Deck metadata such as `title`, `subtitle`, `footer`, and `authors` stays at the Slidev frontmatter root because it describes content, not theme behavior. The cover layout renders explicit `subtitle` metadata under the title; it does not infer a subtitle from the first paragraph. `authors` can be a list of strings or objects with `name`, `institution`, and `email`; the cover layout renders each author's full details side by side under the title, and the footer uses only author names on the left when `themeConfig.obsidian.footerAuthors` is enabled. The centered footer uses per-slide `footer` first, then top-level `footer`, then top-level `title`.

Theme chrome means the non-content frame around each slide. By default it is footer-only: author names are used on the left footer, deck metadata is used in the centered footer, and `themeConfig.obsidian.pageNumber` only controls the right footer page number. The header is intentionally opt-in because per-slide `title` and `subtitle` usually duplicate the visible Markdown heading.

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
| `--obsidian-font-quote` | Quote layout italic font stack |
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
| `--obsidian-code-border` | Code block border |
| `--obsidian-inline-code-bg` | Inline code background |
| `--obsidian-inline-code-border` | Inline code glass border |
| `--obsidian-inline-code-shadow` | Inline code glass shadow |
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
| `--obsidian-quote-size` | Quote layout text size |
| `--obsidian-quote-line-height` | Quote layout line height |

## Presets

Use `themeConfig.obsidian.preset` to switch visual systems without changing the generated markup.

| Preset | Use case |
| --- | --- |
| `clean` | Default note-like presentation style |
| `scholarly` | Formal report styling inspired by academic Slidev themes |

`clean` is intentionally neutral, airy, and card-like for everyday vault notes. `scholarly` borrows academic conventions such as serif headings, stronger chrome, booktabs-like tables, flatter code blocks, tighter spacing, and italic figure captions.

## Layouts

This theme provides the following layouts:

| Layout | Purpose |
| --- | --- |
| `default` | Main content slides with optional footer chrome |
| `cover` | Opening slide, chrome hidden by default |
| `intro` | Introductory slide with normal chrome behavior |
| `section` | Section divider, chrome hidden by default |
| `toc` | Table of contents generated from `section` slides |
| `center` | Centered single-message slide |
| `two-cols` | Two-column content layout using `::right::` |
| `statement` | Large centered claim or takeaway |
| `quote` | Pull quote with optional `author`, `source`, or `cite` frontmatter |
| `figure` | Centered media-first slide |
| `references` | Smaller reference/bibliography slide |

## Protocol Fixture

The repository includes `fixtures/obsidian-protocol.md`, a dedicated deck for validating the generated markup contract with `obsidian-slidev`.

It covers:

- Obsidian callout classes
- Generated image, video, audio, and YouTube media figures
- Obsidian links and warning blocks
- Long lists, tables, inline code, code blocks, and footnotes
- Clean and scholarly presets on the same generated protocol
- Clean/scholarly contrast slides with identical content structure
- Section-driven deck structure with TOC
- Preset-specific statement, quote, figure, references, and center layouts

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
