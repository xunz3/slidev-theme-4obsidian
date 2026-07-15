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
