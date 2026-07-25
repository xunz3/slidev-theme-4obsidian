---
theme: ../
layout: cover
title: Systems That Learn at Scale
subtitle: Efficient architectures for reliable intelligent computing
footer: Institute of Computing Technology, Chinese Academy of Sciences
authors:
  - name: Xun Zhang
    institution: Institute of Computing Technology, CAS
    email: xun.zhang@ict.ac.cn
themeConfig:
  presentation:
    preset: ict
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
---

**Intelligent Systems Research Seminar**<br>
July 2026 · Beijing

---
title: Research context
subtitle: From computation to dependable intelligence
---

# Computing is a systems problem

Useful intelligence emerges when algorithms, architecture, and infrastructure are designed together.

- **Model** — represent the task with the right inductive structure.
- **System** — move data and computation without wasting either.
- **Evidence** — evaluate quality, efficiency, and robustness as one result.

> **Design principle.** Optimize the whole path from an idea to a reproducible system.

---
layout: toc
title: Research program
subtitle: A concise map of the argument
sections:
  - title: Co-design
    subtitle: Models, architectures, and execution policies
    slideNo: 4
  - title: Reproducible execution
    subtitle: Experiments that remain inspectable
    slideNo: 6
  - title: Evidence
    subtitle: Quality, efficiency, and robustness together
    slideNo: 8
---

# Roadmap

---
layout: section
---

# 01 · Co-design

Aligning algorithms with the machines that execute them

---
layout: two-cols
title: Architecture study
subtitle: A model view and a systems view
---

# Learning objective

For model parameters $\theta$ and system policy $\pi$, optimize a shared objective

$$
\min_{\theta,\pi}\; \mathcal{L}(\theta) + \lambda C(\theta,\pi).
$$

The cost term makes latency, memory, and energy visible during design—not after deployment.

::right::

# System evidence

| Metric | Baseline | Co-designed |
| --- | ---: | ---: |
| Accuracy | 87.4% | **89.1%** |
| Latency | 24.8 ms | **13.6 ms** |
| Energy / query | 1.00× | **0.58×** |

One result should explain both capability and computational cost.

---
title: Reproducible execution
subtitle: Keep the experimental contract close to the code
---

# Make every run inspectable

```ts
const run = await experiment({
  model: 'sparse-transformer',
  precision: 'bf16',
  seed: 2026,
  report: ['quality', 'latency', 'energy'],
})
```

Record the configuration, environment, and evaluation protocol with every checkpoint.

---
layout: quote
author: C. Gordon Bell
source: Computer architecture as a research discipline
---

> The most durable computing ideas connect an abstraction to the machine that makes it real.

---
layout: statement
---

# Better intelligence begins with better systems.

Measure the model and the machine as one research object.

---
layout: references
---

# References

1. Hennessy, J. L. and Patterson, D. A. *A New Golden Age for Computer Architecture.* Communications of the ACM, 2019.
2. Sze, V. et al. *Efficient Processing of Deep Neural Networks: A Tutorial and Survey.* Proceedings of the IEEE, 2017.
3. Institute of Computing Technology, Chinese Academy of Sciences. *Visual Identity Assets.*

---
layout: center
---

# 谢谢 · Thank you

Questions, critique, and collaboration

---
layout: section
---

# Fixture appendix

Complete public authoring examples · 完整创作示例

---
title: Public components
presentationDensity: compact
accent: "#b45b2a"
---

# Callouts, labels, and keyboard input

<Callout type="success" title="System evidence captured">

Record model quality, latency, memory, energy, and the exact execution environment together.

</Callout>

<div class="presentation-label-gallery">
  <Tag>Systems</Tag>
  <Tag>Co-design</Tag>
  <Badge>Benchmarked</Badge>
  <Badge>环境已归档</Badge>
</div>

Press <Kbd>Esc</Kbd> to leave overview, or use
<Kbd :keys="['Ctrl', 'Shift', 'P']" /> to open commands.

---
layout: two-cols
title: Figure and author metadata
presentationDensity: compact
---

# Accessible figure

<Figure
  src="/obsidian-card.svg"
  alt="A compact card recording one model and system benchmark"
  caption="Figure A. A bounded benchmark record with an authored alternative."
/>

::right::

# Root authors

<Authors />

The standalone component exposes the same ordered metadata used by the cover and closing slide.

---
layout: two-cols
title: Ordered research processes
presentationDensity: compact
---

# Steps

<Steps>

1. **Profile** the workload.
2. **Co-design** model and runtime.
3. **Audit** quality and cost.

</Steps>

::right::

# Timeline

<Timeline>

1. <time datetime="2026-03">March</time> — Baseline frozen.
2. <time datetime="2026-06">June</time> — Hardware audit completed.
3. **July** — Artifacts released.

</Timeline>

---
title: Tasks and highlights
presentationDensity: compact
---

# Presentation-only review checklist

- [x] Record compiler, driver, and accelerator versions.
- [ ] Reproduce the energy measurement on a second host.
- [x] Publish quality and latency from the same run.

The <mark>co-designed execution path</mark> is highlighted as prose, while
`==literal code syntax==` remains code.

---
layout: code
title: Full-width code example
presentationDensity: compact
---

# Reproducible benchmark

```ts
const result = await benchmark({
  model: 'sparse-transformer',
  precision: 'bf16',
  warmups: 20,
  samples: 100,
  report: ['quality', 'latency', 'energy'],
})

await result.writeArtifact()
```

---
layout: image-left
title: Image-left example
image: /obsidian-card.svg
imageAlt: Systems benchmark card placed to the left of the narrative
caption: Figure B. The figure moves visually, not structurally.
backgroundSize: contain
---

# Inspectable execution

The left-hand presentation keeps the narrative first for assistive technology and export while
placing the benchmark record beside it.

---
layout: image-right
title: Image-right example
image: /obsidian-card.svg
imageAlt: Systems benchmark card placed to the right of the narrative
caption: Figure C. The mirrored layout preserves the same authoring contract.
backgroundSize: contain
---

# One contract, two orientations

Use the right orientation when the system diagram should follow the explanation. Caption,
alternative text, containment, and failure behavior remain unchanged.

---
layout: end
contact: xun.zhang@ict.ac.cn
showAuthors: true
logo: /obsidian-card.svg
logoAlt: Intelligent systems benchmark mark
---

# Fixture complete

Every public component and expanded layout has a maintained ICT-preset example.
