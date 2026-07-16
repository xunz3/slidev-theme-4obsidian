---
theme: ../
layout: cover
title: Reading the City at Walking Speed
subtitle: 街道微气候的轻量观察与共享证据
footer: Urban Systems Lab · Open Research Briefing
authors:
  - name: 陈霁 · Ji Chen
    institution: Urban Systems Lab
    email: ji.chen@example.edu
themeConfig:
  presentation:
    preset: clean
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
---

**Open Research Briefing · 开放研究分享**<br>
July 2026 · Shanghai

---
title: Research question
subtitle: One decision, three kinds of evidence
---

# The useful unit is a decision

Can a lightweight sensor kit tell us **where a shaded rest point matters most**?

- **Measure** — air temperature, surface temperature, and humidity.
- **Observe** — shade coverage, pedestrian flow, and dwell time.
- **Interpret** — keep place, time, and uncertainty attached to every value.

The aim is not a perfect city model. It is a clear next action for one street.

---
layout: toc
title: Fieldwork map
subtitle: 从观察到可复用结论
sections:
  - title: Observe · 观察
    subtitle: A small protocol with strong context
    slideNo: 4
  - title: Compare · 比较
    subtitle: Read measurements beside behavior
    slideNo: 5
  - title: Share · 共享
    subtitle: Turn a finding into a decision
    slideNo: 8
---

# Three moves, one afternoon

---
layout: section
---

# 01 · Observe / 观察

Start with a question small enough to answer well

---
layout: two-cols
title: A 20-minute street protocol
subtitle: Context on the left, comparable evidence on the right
---

# What we record

At each site, take four readings at five-minute intervals and note the same environmental cues.

$$
\Delta T_s = T_{\text{surface}} - T_{\text{air}}
$$

The temperature gap helps distinguish radiant heat from the ambient condition people feel.

::right::

# Pilot snapshot

| Site | Shade | $\Delta T_s$ | Median dwell |
| --- | ---: | ---: | ---: |
| Tree canopy | 72% | **+2.1 °C** | **6.4 min** |
| Fabric awning | 48% | +4.7 °C | 3.8 min |
| Open paving | 6% | +10.9 °C | 0.9 min |

*Illustrative field data · 14:00–15:30*

---
title: Reusable evidence
subtitle: A compact record that survives handoff
---

# An evidence card, not a data dump

```yaml
site: tree-canopy-03
window: 2026-07-12T14:20+08:00
air_c: 32.4
surface_c: 34.5
shade_pct: 72
dwell_median_min: 6.4
note: "school exit period / 放学时段"
```

<div class="obsidian-slidev-callout obsidian-slidev-callout--tip" data-callout="tip">
  <div class="obsidian-slidev-callout__title">Why this travels well · 为什么有效</div>
  <div class="obsidian-slidev-callout__content">
    <p>A number, its setting, and a plain-language note can be reviewed without reopening the whole notebook.</p>
  </div>
</div>

---
layout: quote
author: John W. Tukey
source: Exploratory Data Analysis, 1977
---

> The greatest value of a picture is when it forces us to notice what we never expected to see.

---
layout: statement
---

# Small measurements become useful when their context stays attached.

微小的测量，连同语境一起保留，才会成为可行动的证据。

---
layout: references
---

# References

1. Oke, T. R., Mills, G., Christen, A., and Voogt, J. A. *Urban Climates.* Cambridge University Press, 2017.
2. World Health Organization Regional Office for Europe. *Urban Green Spaces and Health: A Review of Evidence.* 2016.
3. World Meteorological Organization. *Guide to Instruments and Methods of Observation.* WMO-No. 8, 2021 update.

---
layout: center
---

# 谢谢 · Thank you

Keep the question open—and the evidence legible.
