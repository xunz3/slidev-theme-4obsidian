---
theme: ../
layout: cover
title: Expanded Theme Content
subtitle: Standalone semantic authoring · 独立语义内容创作
footer: Expanded content quality fixture
authors:
  - Ada Lovelace
  - name: Grace Hopper
    institution: US Navy
    email: grace@example.org
  - institution: Institute for Reproducible Research
  - email: contributor@example.org
  - name: Intentional Duplicate
  - name: Intentional Duplicate
  - ""
author:
  name: Legacy Author
  institution: Compatibility Institute
themeConfig:
  presentation:
    preset: default # __EXPANDED_PRESET__
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
    accent: "color-mix(in srgb, currentColor 72%, #5b4fc4)"
---

<div data-quality-case="expanded-control-start">

# Expanded theme content

Standalone components, academic layouts, local accents, technical aids, and Obsidian reading
cues share one production-built fixture.

</div>

---
title: Stable navigation control
---

<div data-quality-case="expanded-control-target">

# Stable navigation control

This unchanged text-only slide gives the navigation gate a deterministic control transition
before any feature-specific media or component content.

</div>

<!-- EXPANDED-US1-START -->
---
title: Informational callouts
presentationDensity: compact
---

<div data-quality-case="us1-callouts-info" class="presentation-callout-gallery">

<Callout type="note">Canonical note body.</Callout>
<Callout type="info">Canonical info body.</Callout>
<Callout type="todo">Canonical to-do body.</Callout>
<Callout type="abstract">Canonical abstract body.</Callout>
<Callout type="summary">Canonical summary body.</Callout>

</div>

---
title: Positive callouts
presentationDensity: compact
---

<div data-quality-case="us1-callouts-positive" class="presentation-callout-gallery">

<Callout type="tip">Canonical tip body.</Callout>
<Callout type="success">Canonical success body.</Callout>
<Callout type="check">Canonical check body.</Callout>

</div>

---
title: Caution callouts
presentationDensity: compact
---

<div data-quality-case="us1-callouts-caution" class="presentation-callout-gallery">

<Callout type="warning">Canonical warning body.</Callout>
<Callout type="caution">Canonical caution body.</Callout>
<Callout type="attention">Canonical attention body.</Callout>

</div>

---
title: Danger callouts
presentationDensity: compact
---

<div data-quality-case="us1-callouts-danger" class="presentation-callout-gallery">

<Callout type="danger">Canonical danger body.</Callout>
<Callout type="error">Canonical error body.</Callout>
<Callout type="failure">Canonical failure body.</Callout>

</div>

---
title: Question callouts
presentationDensity: compact
---

<div data-quality-case="us1-callouts-question" class="presentation-callout-gallery">

<Callout type="question">Canonical question body.</Callout>
<Callout type="help">Canonical help body.</Callout>
<Callout type="faq">Canonical FAQ body.</Callout>

</div>

---
title: Quotation callouts
presentationDensity: compact
---

<div data-quality-case="us1-callouts-quotation" class="presentation-callout-gallery">

<Callout type="quote">Canonical quotation body.</Callout>
<Callout type="cite">Canonical citation body.</Callout>

</div>

---
title: Callout normalization and rich content
presentationDensity: compact
---

<div data-quality-case="us1-callout-fallbacks">

<Callout>Omitted type remains neutral.</Callout>
<Callout type="" title="Authored neutral">Empty type retains its authored title.</Callout>
<Callout type="unsupported">Unsupported type remains neutral.</Callout>
<Callout
  type=" WARNING "
  title="Reproducibility protocol · 可复现性协议与双语长标题"
>

Formatted body with **strong meaning**, `inline code`, a [link](https://example.org), and:

1. a first observation;
2. a second observation.

</Callout>

</div>

---
title: Generated callout equivalence
presentationDensity: compact
---

<div data-quality-case="us1-callout-equivalence" class="presentation-callout-gallery">

<Callout type="warning" title="Equivalent warning">
  Component-authored warning content.
</Callout>

<aside
  class="obsidian-slidev-callout obsidian-slidev-callout--warning"
  data-callout="warning"
  data-generated-equivalent="warning"
  role="note"
  aria-labelledby="generated-warning-title"
>
  <div id="generated-warning-title" class="obsidian-slidev-callout__title">Equivalent warning</div>
  <div class="obsidian-slidev-callout__content"><p>Component-authored warning content.</p></div>
</aside>

</div>

---
title: Figure alternatives and failure states
presentationDensity: compact
---

<div data-quality-case="us1-figures-alternatives" class="presentation-figure-gallery">

<Figure
  src="/theme/public/obsidian-card.svg"
  alt="Obsidian card connected to a presentation"
  caption="Meaningful authored alternative text."
/>
<Figure
  src="/theme/public/obsidian-card.svg"
  caption="Caption supplies the omitted alternative."
/>
<Figure
  src="/theme/public/obsidian-card.svg"
  alt=""
  caption="Decorative image with a visible caption."
/>
<Figure src="" alt="Missing source description" caption="Missing source fallback." />
<Figure
  src="data:image/svg+xml,not-an-image"
  alt="Failed source description"
  caption="Failed source fallback."
/>

</div>

---
title: Figure geometry
presentationDensity: compact
---

<div data-quality-case="us1-figures-geometry" class="presentation-figure-gallery">

<Figure
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='480' viewBox='0 0 120 480'%3E%3Crect width='120' height='480' fill='%2377b5aa'/%3E%3C/svg%3E"
  alt="Tall teal rectangle"
  fit="contain"
/>
<Figure
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='120' viewBox='0 0 800 120'%3E%3Crect width='800' height='120' fill='%23b8793f'/%3E%3C/svg%3E"
  alt="Wide amber rectangle"
  fit="cover"
/>
<Figure
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Ccircle cx='160' cy='90' r='64' fill='%236f63a6' fill-opacity='.55'/%3E%3C/svg%3E"
  alt="Translucent violet circle"
/>

</div>

---
title: Root author normalization
presentationDensity: compact
---

<div data-quality-case="us1-authors-mixed">

# Contributors

<Authors />

<p data-author-case="string-mixed-partial-duplicate-empty">
  Root metadata includes a string, structured and partial records, an intentional duplicate,
  and an empty entry that must not create a card.
</p>

</div>
<!-- EXPANDED-US1-END -->

<!-- EXPANDED-US2-START -->
---
layout: end
title: Minimal closing
---

<div data-quality-case="us2-end-minimal">

# Thank you · 谢谢

Questions and discussion are welcome.

</div>

---
layout: thanks
title: Minimal closing alias
---

<div data-quality-case="us2-thanks-minimal">

# Thank you · 谢谢

Questions and discussion are welcome.

</div>

---
layout: end
title: Closing with metadata
presentationDensity: compact
contact: research@example.org
showAuthors: true
logo: /theme/public/obsidian-card.svg
logoAlt: Obsidian presentation research mark
---

<div data-quality-case="us2-closing-metadata">

# Reproducible research continues

Thank you for reviewing the evidence and its operating boundaries.

</div>

---
layout: thanks
title: Decorative closing logo
logo: /theme/public/obsidian-card.svg
logoAlt: ""
---

<div data-quality-case="us2-closing-decorative-logo">

# Questions?

The decorative mark has an explicit empty alternative.

</div>

---
layout: end
title: Failed closing logo
contact: Not an actionable address
logo: "data:image/svg+xml,not-an-image"
logoAlt: Research group logo unavailable
---

<div data-quality-case="us2-closing-failed-logo">

# Keep the description

Failed media must not destabilize the closing message.

</div>

---
layout: end
title: Omitted closing regions
---

<div data-quality-case="us2-closing-omitted">

# A complete minimal ending

No contact, author collection, or logo region is emitted.

</div>

---
layout: image-left
title: Image left
image: /theme/public/obsidian-card.svg
imageAlt: Obsidian card connected to a presentation canvas
caption: Figure 2. The narrative remains first in source order.
backgroundSize: contain
---

<div data-quality-case="us2-image-left">

# Experimental design

The narrative comes first in the document. The figure is placed on the left only through CSS.

</div>

---
layout: image-right
title: Image right
image: /theme/public/obsidian-card.svg
imageAlt: Obsidian card connected to a presentation canvas
caption: Figure 2. The narrative remains first in source order.
backgroundSize: contain
---

<div data-quality-case="us2-image-right">

# Experimental design

The narrative comes first in the document. The figure is placed on the right only through CSS.

</div>

---
layout: image-left
title: Legacy image inputs
image: /theme/public/obsidian-card.svg
caption: Caption fallback supplies the omitted image alternative.
backgroundSize: cover
class: legacy-image-layout
---

<div data-quality-case="us2-image-legacy">

# Existing Slidev metadata remains accepted

The `image`, `class`, and `backgroundSize` keys retain their established authoring surface.

</div>

---
layout: image-right
title: Missing image
image: ""
imageAlt: Missing experimental figure
---

<div data-quality-case="us2-image-missing">

# Narrative-only fallback

An empty image value collapses the media region without leaving an empty landmark.

</div>

---
layout: image-left
title: Failed image
image: "data:image/svg+xml,not-an-image"
imageAlt: Failed experimental figure
caption: The description and caption remain after failure.
---

<div data-quality-case="us2-image-failed">

# Stable failure geometry

The narrative position remains unchanged when the image fails.

</div>

---
layout: image-right
title: Long bilingual image narrative
image: /theme/public/obsidian-card.svg
imageAlt: Diagram showing a bilingual research workflow
caption: Figure 3. Collection, normalization, validation, publication · 采集、规范化、验证与发布。
backgroundSize: contain
presentationDensity: compact
---

<div data-quality-case="us2-image-bilingual">

# Evidence workflow · 证据工作流

The same logical order supports a longer bilingual explanation. 数据采集以后，研究团队保留原始观察、
环境信息与不确定性，再进行规范化、验证和发布，确保投影画布中的叙述与图像都保持清晰。

</div>
<!-- EXPANDED-US2-END -->

<!-- EXPANDED-US3-START -->
---
title: Valid local accent
presentationDensity: compact
presentationHeader: true
accent: "color-mix(in srgb, currentColor 68%, #c2410c)"
---

<div data-quality-case="us3-accent-local-a" class="presentation-accent-probe">

# Local accent A

[Accent-aware link](https://example.com/accent) · `inline accent` · **common emphasis**

1. Accent-aware list marker

| Consumer | State |
| --- | --- |
| Table | Local |

<div class="presentation-callout-gallery">

<Callout type="info">General accent follows the slide.</Callout>
<Callout type="success">Success remains semantic.</Callout>
<Callout type="warning">Warning remains semantic.</Callout>
<Callout type="danger">Danger remains semantic.</Callout>
<Callout type="question">Question remains semantic.</Callout>

</div>

</div>

---
title: Unaccented fallback
presentationDensity: compact
presentationHeader: true
---

<div data-quality-case="us3-accent-unaccented" class="presentation-accent-probe">

# Deck fallback

[Accent-aware link](https://example.com/fallback) and `inline accent` use the deck value.

1. Accent-aware list marker

| Consumer | State |
| --- | --- |
| Table | Deck |

<div class="presentation-callout-gallery">

<Callout type="info">General accent follows the deck.</Callout>
<Callout type="success">Success remains semantic.</Callout>
<Callout type="warning">Warning remains semantic.</Callout>
<Callout type="danger">Danger remains semantic.</Callout>
<Callout type="question">Question remains semantic.</Callout>

</div>

</div>

---
title: Empty local accent
presentationDensity: compact
presentationHeader: true
accent: ""
---

<div data-quality-case="us3-accent-empty" class="presentation-accent-probe">

# Empty values inherit

[Accent-aware link](https://example.com/empty) and informational content use the deck value.

<Callout type="info">An empty higher-priority value never clears a valid fallback.</Callout>

</div>

---
title: Invalid local accent
presentationDensity: compact
presentationHeader: true
accent: definitely-not-a-css-color
---

<div data-quality-case="us3-accent-invalid" class="presentation-accent-probe">

# Invalid values inherit

[Accent-aware link](https://example.com/invalid) and informational content use the deck value.

<Callout type="info">An invalid higher-priority value never clears a valid fallback.</Callout>

</div>

---
title: Valid local accent B
presentationDensity: compact
presentationHeader: true
accent: "color-mix(in srgb, currentColor 68%, #047857)"
---

<div data-quality-case="us3-accent-local-b" class="presentation-accent-probe">

# Local accent B

[Accent-aware link](https://example.com/accent-b) · `inline accent` · **common emphasis**

<div class="presentation-callout-gallery">

<Callout type="info">The second local value is isolated.</Callout>
<Callout type="success">Success remains semantic.</Callout>
<Callout type="warning">Warning remains semantic.</Callout>
<Callout type="danger">Danger remains semantic.</Callout>
<Callout type="question">Question remains semantic.</Callout>

</div>

</div>

---
title: Local accent equal to deck
presentationDensity: compact
presentationHeader: true
accent: "color-mix(in srgb, currentColor 72%, #5b4fc4)"
---

<div data-quality-case="us3-accent-equal-deck" class="presentation-accent-probe">

# Equal values remain local-valid

[Accent-aware link](https://example.com/equal) and informational content resolve deterministically.

<Callout type="info">The authored value equals the deck value.</Callout>

</div>
<!-- EXPANDED-US3-END -->

<!-- EXPANDED-US4-START -->
---
layout: code
title: Solver implementation
---

<div data-quality-case="us4-code-titled">

# Solver implementation

```ts {2,6-8|10-14}
export type Observation = {
  id: string
  value: number
}

export const normalizeObservations = (
  observations: readonly Observation[],
  environment: Readonly<Record<string, string>>,
) => {
  const auditLabel = "collection→normalization→validation→publication::采集→规范化→验证→发布::this-is-an-intentionally-long-unbroken-technical-token-for-contained-horizontal-overflow"
  const valid = observations.filter(observation => Number.isFinite(observation.value))
  const total = valid.reduce((sum, observation) => sum + observation.value, 0)
  const mean = valid.length === 0 ? 0 : total / valid.length
  const centered = valid.map(observation => ({
    ...observation,
    value: observation.value - mean,
  }))
  return {
    auditLabel,
    centered,
    environment,
    mean,
  }
}
```

<p class="presentation-code-note">Highlighted and annotated code remains owned by Slidev.</p>

</div>

---
layout: code
title: Code without a visible heading
---

<div data-quality-case="us4-code-titleless">

```text
line-01: prepare reproducible environment
line-02: collect observations
line-03: preserve raw inputs
line-04: normalize measurements
line-05: validate assumptions
line-06: calculate uncertainty
line-07: compare baselines
line-08: inspect residuals
line-09: document exclusions
line-10: publish intermediate evidence
line-11: request peer review
line-12: incorporate corrections
line-13: rerun the workflow
line-14: archive the environment
line-15: freeze the dataset
line-16: release the report
line-17: 这是一条用于验证纵向滚动 containment 的双语技术记录
line-18: finish
line-19: retain source metadata
line-20: verify checksums
line-21: record package versions
line-22: compare deterministic output
line-23: inspect accessibility evidence
line-24: inspect visual evidence
line-25: inspect performance evidence
line-26: reconcile review notes
line-27: publish reproducibility notes
line-28: archive generated artifacts
line-29: close the review loop
line-30: done
```

</div>

---
title: Steps with zero items
---

<div data-quality-case="us4-steps-zero">

# Empty process

<Steps>

No ordered list was authored, so this readable note receives no sequence decoration.

</Steps>

</div>

---
title: Steps with one item
---

<div data-quality-case="us4-steps-one">

# One-step process

<Steps>

1. **Freeze** the reviewed dataset.

</Steps>

</div>

---
title: Steps with many items
presentationDensity: compact
---

<div data-quality-case="us4-steps-many">

# Reproducible workflow · 可复现流程

<Steps>

1. **Collect · 采集** raw observations and environment details.
2. **Normalize · 规范化** measurements without discarding provenance.
3. **Validate · 验证** assumptions, uncertainty, and exclusions.
4. **Publish · 发布** evidence with a rerunnable audit trail.

</Steps>

</div>

---
title: Timeline with zero events
---

<div data-quality-case="us4-timeline-zero">

# Empty chronology

<Timeline>

No ordered event list was authored, so no orphan rail or marker is displayed.

</Timeline>

</div>

---
title: Timeline with one undated event
---

<div data-quality-case="us4-timeline-one">

# One milestone

<Timeline>

1. **Today** — Results released without an artificial date.

</Timeline>

</div>

---
title: Timeline with dated and undated events
presentationDensity: compact
---

<div data-quality-case="us4-timeline-many">

# Research chronology · 研究时间线

<Timeline>

1. <time datetime="2024-09">Sep 2024</time> — Dataset frozen.
2. <time datetime="2025-02">Feb 2025</time> — Evaluation completed.
3. **Today · 今天** — Results and uncertainty released.
4. **Next** — Independent replication and bilingual documentation.

</Timeline>

</div>

---
title: Category and status labels
presentationDensity: compact
---

<div data-quality-case="us4-status-labels">

# Compact labels · 紧凑标签

<p class="presentation-label-gallery">
  <Tag>Method</Tag>
  <Tag>Δ sensitivity-analysis / 灵敏度分析</Tag>
  <Badge>Complete</Badge>
  <Badge>✓ Peer-reviewed · 已同行评审</Badge>
</p>

The category outline and status fill/icon remain distinct without relying on hue.

</div>

---
title: Keyboard input
presentationDensity: compact
---

<div data-quality-case="us4-keyboard">

# Keyboard sequences · 键盘序列

Press <Kbd>Esc</Kbd> to leave the overview.

Open the command menu with <Kbd :keys="['Ctrl', 'Shift', 'P']" />.

Use <Kbd :keys="['⌘', '', ' K ', '语言']" /> for a filtered symbolic bilingual chord.

<Kbd :keys="['', '  ']">Fallback key</Kbd>

</div>
<!-- EXPANDED-US4-END -->

<!-- EXPANDED-US5-START -->
---
title: Native task-list cues
presentationDensity: compact
---

<div data-quality-case="us5-tasks-native">

# Presentation tasks · 演示任务

- [ ] Preserve the raw observations and environment metadata.
- [x] Freeze the reviewed dataset.
- [ ] Wrap a deliberately long bilingual task label across the available reading width while
      keeping its empty box aligned with the first line · 长任务文本换行后仍与首行复选框对齐。
  - [x] Record the checksum and package versions.
  - [ ] Request independent replication.
- [x] Publish the uncertainty statement.

</div>

---
title: Generated task compatibility
presentationDensity: compact
---

<div data-quality-case="us5-tasks-generated">

# Generated task markup

<ul class="obsidian-slidev-task-list contains-task-list">
  <li class="obsidian-slidev-task-list-item task-list-item" data-task="">
    <input type="checkbox" />
    Generated unchecked task.
  </li>
  <li class="obsidian-slidev-task-list-item task-list-item is-checked" data-task="x">
    <input type="checkbox" checked />
    Generated checked task with a wrapped bilingual explanation · 已完成的生成任务保留状态。
    <ul class="obsidian-slidev-task-list contains-task-list">
      <li class="obsidian-slidev-task-list-item task-list-item" data-task="">
        <input type="checkbox" />
        Nested generated follow-up.
      </li>
    </ul>
  </li>
</ul>

</div>

---
title: Native and generated highlights
presentationDensity: compact
---

<div data-quality-case="us5-highlights">

# Highlighted evidence · 高亮证据

Native <mark data-highlight-case="native">reviewed evidence · 已审核证据</mark> and generated
<span class="obsidian-slidev-highlight" data-highlight-case="generated">reviewed evidence · 已审核证据</span>
share one treatment.

The cue remains distinct beside [a link](https://example.com/evidence), *emphasis*, and
`inline ==not a highlight== code`.

```text
==literal highlight-like characters stay code==
<mark>literal markup text stays code text</mark>
```

<pre data-highlight-code-scope><code><mark>authored mark inside code</mark> <span class="obsidian-slidev-highlight">generated highlight class inside code</span></code></pre>

</div>
<!-- EXPANDED-US5-END -->
