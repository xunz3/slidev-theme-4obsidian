---
theme: ../
layout: cover
title: Geometric Learning and Scientific Discovery
subtitle: From mathematical structure to reliable models
footer: University of Chinese Academy of Sciences
authors:
  - name: Xun Zhang
    institution: UCAS · School of Computer Science
    email: xun.zhang@ucas.ac.cn
themeConfig:
  presentation:
    preset: ucas
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
---

**Summer Geometry Initiative**<br>
July 2026 · Beijing

---
title: Research motivation
subtitle: A calm, rigorous visual system for scientific arguments
---

# Geometry gives models structure

Scientific presentations need to make the chain of reasoning visible before they make it impressive.

- **Structure** — encode invariance and symmetry explicitly.
- **Evidence** — distinguish observation, assumption, and conclusion.
- **Communication** — let diagrams, equations, and results share one hierarchy.

> **Research note.** The UCAS preset keeps the institutional identity present without competing with the scientific content.

---
layout: section
---

# 01 · Foundations

From geometric priors to testable hypotheses

---
layout: two-cols
title: Model design
subtitle: Two complementary views
---

# Mathematical view

Let $G$ act on the input space $X$. A representation $f$ is equivariant when

$$
f(g \cdot x) = \rho(g) f(x).
$$

This constraint reduces the hypothesis space while preserving relevant structure.

::right::

# Experimental view

| Criterion | Baseline | UCAS model |
| --- | ---: | ---: |
| Data efficiency | 0.71 | **0.84** |
| Stability | 0.78 | **0.91** |
| Interpretability | 0.62 | **0.86** |

The gain should remain visible across seeds, scales, and ablations.

---
layout: quote
author: Shiing-Shen Chern
source: Geometric insight as a research practice
---

> The most useful abstraction is the one that makes the next experiment clearer.

---
layout: statement
---

# Structure first. Evidence always.

A UCAS presentation should feel composed, exact, and ready for scrutiny.

---
layout: references
---

# References

1. Bronstein, M. M. et al. *Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges.* 2021.
2. Cohen, T. and Welling, M. *Group Equivariant Convolutional Networks.* ICML, 2016.
3. University of Chinese Academy of Sciences. *Visual Identity Assets.*

---
layout: center
---

# 谢谢 · Thank you

Questions and discussion
