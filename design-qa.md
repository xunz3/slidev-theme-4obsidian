# UCAS Preset Design QA

- Source visual truth: `/home/xunz/projects/slidev-theme-4obsidian/example/theme-example.png`
- Secondary design reference: `/home/xunz/projects/slides/slides/JGaussian-example/qa/all-slides-contact.png`
- Browser-rendered implementation: `/home/xunz/projects/slidev-theme-4obsidian/dist-ucas/ucas-preset/1.png` through `8.png`
- Full-view cover comparison: `/home/xunz/projects/slidev-theme-4obsidian/qa/ucas-cover-comparison.png`
- All-slide contact sheet: `/home/xunz/projects/slidev-theme-4obsidian/qa/ucas-contact-sheet.png`
- Focused Quote comparison: `/home/xunz/projects/slidev-theme-4obsidian/qa/ucas-quote-comparison.png`
- Playwright Quote evidence: `/home/xunz/projects/slidev-theme-4obsidian/qa/ucas-playwright-quote.png`
- Viewport: 1960 × 1104 pixels, 16:9 Slidev export
- State: light theme; cover, default, section, two-column, quote, statement, references, and center layouts

**Full-view comparison evidence**

The cover comparison places the original academic reference and current UCAS cover at the same viewport. The implementation intentionally keeps the accepted left-aligned title composition rather than cloning the centered source, while preserving the reference's white academic canvas, blue-to-white cover rail, and strong vertical identity. The eight-slide contact sheet shows no clipping, overflow, rail remnants after the cover, or collisions between content, institutional marks, watermarks, and footer chrome.

**Focused region comparison evidence**

The Quote comparison places the browser-rendered fifth slide before and after the structural fix. The earlier render showed two parallel UCAS-blue rules because the Quote layout wrapped a Markdown-generated `<blockquote>` in another `<blockquote>`. The revised layout uses a neutral content wrapper, retains the Markdown blockquote for semantics, and applies the visual rule only to the wrapper. Playwright confirms one `4px solid rgb(12, 73, 148)` content border and a `0px none` inner blockquote border.

**Findings**

No actionable P0, P1, or P2 findings remain.

- **Fonts and typography:** Source Serif 4 / Noto Serif SC provides the calm academic display hierarchy; Source Sans 3 / Noto Sans SC keeps body copy and chrome compact. The exported title wrapping, quote measure, weights, line heights, and metadata hierarchy are readable and unclipped.
- **Spacing and layout rhythm:** The brand rail is cover-only. Later slides use symmetric padding and consistent top-right identity, bottom chrome, and watermark placement. The Quote text, attribution rule, author, and source form one aligned left edge after the fix.
- **Colors and visual tokens:** UCAS blue, cold-white canvas, pale blue dividers, subtle watermarks, and the measured cover gradient remain consistent across all eight exports. Section contrast is sufficient and the white identity mark is legible.
- **Image quality and asset fidelity:** The cover uses the supplied UCAS vertical lockup; section pages use transparent white derivatives of the supplied horizontal lockup and emblem. The section emblem negative space remains visible, with no white-disc collapse, transparency halo, stretching, or synthetic replacement.
- **Copy and content:** All showcase titles, authorship, institutional footer, section numbering, quotation attribution, references, and page numbering are present.

**Comparison history**

1. **Initial pass — blocked:** Chromium could not launch because the host lacked `libnspr4` / `libnss3`; source-level checks were recorded without claiming visual completion.
2. **Browser pass — blocked:** After the runtime libraries were installed, the full deck exported successfully. The fifth slide exposed two visible quote rules caused by nested blockquotes.
3. **Fix pass — passed:** Replaced the layout-owned blockquote with `.slide-layout-quote__content`, reset the Markdown child blockquote, and applied the UCAS rule to the wrapper. The post-fix export shows exactly one rule, and the full contact sheet has no remaining P0/P1/P2 issues.

**Interaction and console checks**

- Loaded slide 5 in headless Chromium at 1960 × 1104.
- Pressed `ArrowRight`; the route advanced from `/5` to `/6`.
- Confirmed there is no UCAS rail on slide 5 and only one styled quote border.
- No application console or page errors occurred. Chromium reported only the expected headless-environment warning that Wake Lock permission was denied.

**Implementation Checklist**

- Quote content accepts Markdown blockquote syntax without duplicating layout chrome.
- UCAS showcase, standalone theme example, and Obsidian protocol fixture build successfully.
- Cover, section, Quote, representative content layouts, and footer safe areas were inspected from browser-rendered evidence.

**Follow-up Polish**

- P3: Revisit only if real presentation content produces unusually long quotations that need a narrower measure or smaller type scale.

final result: passed
