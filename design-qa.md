# UCAS Preset Design QA

- Source visual truth: `example/theme-example.png`
- Browser-rendered implementation: `dist-ucas/ucas-preset/1.png` through `8.png`
- Research refinement comparison: `qa/ucas-research-comparison.png`
- All-slide contact sheet: `qa/ucas-contact-sheet.png`
- Export / Playwright Quote comparison: `qa/ucas-research-quote-comparison.png`
- Playwright Quote evidence: `qa/ucas-playwright-quote.png`
- Viewport: 1960 × 1104 pixels, 16:9 Slidev export
- State: light theme; cover, default, section, two-column, quote, statement, references, and center layouts

**Visual direction**

UCAS is the more humanistic of the two research presets. Source Serif 4 / Noto Serif SC carries titles and quotations, while Source Sans 3 / Noto Sans SC keeps body copy and presentation chrome compact. The palette uses a cold-white canvas, desaturated institutional blue, and pale blue-gray rules. The cover retains the accepted gradient rail and vertical identity; ordinary research slides deliberately reduce branding so content, evidence, and argument remain primary.

**Research refinement**

- Reduced title weight and scale while increasing body line height for a calmer academic rhythm.
- Replaced saturated boxed tables with booktabs-like top and bottom rules plus a pale header field.
- Reduced the top-right wordmark and removed ordinary-slide watermarks. Watermarks now appear only on cover, section, statement, and center layouts.
- Muted the section gradient, watermark, divider, and display weight without weakening white-on-blue contrast.
- Narrowed Quote measure and reduced its visual rule to a single `2px solid rgb(49, 95, 134)` border.
- Softened footer size, weight, tracking, and border contrast.

**Findings**

No actionable P0, P1, or P2 findings remain.

- All eight slides report zero content-area overflow at 1960 × 1104.
- Playwright reported zero broken images and confirmed `data-presentation-preset="ucas"` on every slide.
- The Quote wrapper has one 2px left border; its Markdown child blockquote has no top or left border.
- The section identity remains visible and preserves the supplied SVG geometry and transparent negative space.
- Keyboard `ArrowRight` advanced from slide 5 to slide 6.
- No application errors occurred; the only development-server warning was the expected headless Wake Lock permission denial.

**Regression checks**

- `pnpm run build:ucas` and `pnpm run screenshot:ucas` completed successfully.
- `git diff --check` completed without whitespace errors.

final result: passed
