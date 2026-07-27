---
obsidian-slidev: true
obsidian-slidev-profile:
  id: obsidian-slidev/presentation
  version: "1.0.0"
title: Portable presentation fixture
subtitle: Theme-independent authoring
footer: Shared Profile fixture
authors:
  - name: Ada Example
    institution: Example Institute
    email: ada@example.invalid
  - 李示例
themeConfig:
  presentation:
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
    accent: "#345f8f"
---

# Components

<Tag>portable</Tag>

<Badge tone="success" :marker="true">Ready</Badge>

Press <Kbd :keys="['Ctrl', 'K']" /> or <Kbd>Esc</Kbd>.

<Callout type="note" title="Component callout">
Default slot with ==highlighted prose== and [[Portable link|a link]].

<template #details>
Named slot remains ordered.
</template>
</Callout>

<Figure
  src="./reference-figure.svg"
  alt="Geometric protocol figure"
  caption="Deterministic local figure"
  fit="contain"
/>

<Authors variant="compact" />

<Steps>

1. First step
2. Second step with ==emphasis==

</Steps>

<Timeline>

1. <time datetime="2026-07-27">Protocol publication</time>
2. Consumer adoption

</Timeline>

<CustomPortable data-value="==protected property==">
Unknown components stay authored; slot ==prose transforms==.
</CustomPortable>

`<Badge tone="danger">literal inline example</Badge>`

```vue
<Callout type="danger">literal fenced example</Callout>
```

---
layout: end
title: Closing layout
subtitle: Portable closing content
contact: profile@example.invalid
showAuthors: true
logo: ./reference-figure.svg
logoAlt: Geometric protocol logo
chrome: off
accent: "#8a4f7d"
---

# End

Closing content.

---
layout: figure
title: Figure layout
subtitle: One authored figure
chrome: on
---

<Figure
  src="./reference-figure.svg"
  alt="Figure layout illustration"
  caption="Figure layout caption"
  fit="cover"
/>

---
layout: image-left
title: Image left
subtitle: Text beside an image
image: ./reference-figure.svg
imageAlt: Left-side geometric figure
caption: Left image caption
backgroundSize: contain
class: image-left-fixture
chrome: auto
presentationDensity: compact
---

# Left text

- [ ] unchecked task
- [x] checked task

---
layout: image-right
title: Image right
subtitle: Mirrored image and text
image: ./reference-figure.svg
imageAlt: Right-side geometric figure
caption: Right image caption
backgroundSize: cover
class: image-right-fixture
chrome: on
presentationHeader: true
footerAuthors: false
pageNumber: false
---

# Right text

Slide-local ==accent-safe highlight==.

---
layout: code
title: Code layout
subtitle: Protected code and prose
chrome: off
presentationDensity: relaxed
---

# Code

```ts
const literal = "==not highlighted==";
```

Visible ==highlight after code==.
