---
theme: ../
layout: cover
title: Confidence Under Distribution Shift
subtitle: 分布变化下科学模型的置信度校准
footer: Methods Colloquium · Reproducible Machine Learning
authors:
  - name: 王若衡 · Ruoheng Wang
    institution: Computational Science Methods Group
    email: ruoheng.wang@example.edu
themeConfig:
  presentation:
    preset: scholarly
    density: normal
    chrome: auto
    header: false
    footerAuthors: true
    pageNumber: true
---

**Methods Colloquium · 方法学报告**<br>
July 2026 · Beijing

---
title: Research question
subtitle: Separate predictive quality from confidence quality
---

# Prediction is not confidence

When a microscopy classifier leaves its validation distribution, does its confidence remain reliable enough to prioritize samples for manual review?

- **Unit of analysis** — image batch, grouped by site and scanner.
- **Primary endpoint** — expected calibration error (ECE) and 90% coverage.
- **Guardrail** — discrimination must not degrade after recalibration.

The evaluation asks whether a score can support a workflow—not merely rank a benchmark.

---
layout: toc
title: Argument structure
subtitle: 研究问题、证据与边界
sections:
  - title: Method · 方法
    subtitle: Define the estimand before fitting
    slideNo: 4
  - title: Evidence · 证据
    subtitle: Compare shift and recalibration
    slideNo: 5
  - title: Implication · 启示
    subtitle: State the operating boundary
    slideNo: 8
---

# From estimand to operating rule

---
layout: section
---

# 01 · Method / 方法

Separate model quality from confidence quality

---
layout: two-cols
title: Preregistered comparison
subtitle: One hypothesis, three evaluation conditions
---

# Estimand

Temperature scaling fits a single parameter $T$ on validation data:

$$
\hat{p}(y \mid x) = \operatorname{softmax}\!\left(\frac{z(x)}{T}\right).
$$

The primary contrast is the change in ECE under scanner shift, before and after held-out recalibration.

::right::

# Held-out pilot

| Condition | AUROC ↑ | ECE ↓ | 90% coverage |
| --- | ---: | ---: | ---: |
| In-domain | .91 | **.028** | .89 |
| Scanner shift | .88 | .094 | .73 |
| Shift + recalibration | .88 | **.041** | **.86** |

*Illustrative fixture data · 12 batches*

---
title: Analysis contract
subtitle: Make the decision rule inspectable
---

# The analysis contract fits on one screen

```yaml
primary_metric: expected_calibration_error
bootstrap_resamples: 2000
group_by: [site, scanner]
recalibrate_on: validation_only
report: [estimate, ci95, missingness]
```

<div class="obsidian-slidev-callout obsidian-slidev-callout--note" data-callout="note">
  <div class="obsidian-slidev-callout__title">Decision rule · 判定规则</div>
  <div class="obsidian-slidev-callout__content">
    <p>If ECE exceeds .05 or 90% coverage falls below .85, route the batch to review; never tune the threshold on test data.</p>
  </div>
</div>

---
layout: quote
author: George E. P. Box
source: Robustness in the Strategy of Scientific Model Building, 1979
---

> All models are wrong, but some are useful.

---
layout: statement
---

# Calibration is part of the result—not a footnote to accuracy.

置信度校准属于研究结论本身，而不是准确率之后的附注。

---
layout: references
---

# References

1. Guo, C., Pleiss, G., Sun, Y., and Weinberger, K. Q. *On Calibration of Modern Neural Networks.* ICML, 2017.
2. Ovadia, Y. et al. *Can You Trust Your Model's Uncertainty? Evaluating Predictive Uncertainty Under Dataset Shift.* NeurIPS, 2019.
3. Gneiting, T. and Raftery, A. E. *Strictly Proper Scoring Rules, Prediction, and Estimation.* JASA, 2007.

---
layout: center
---

# 谢谢 · Thank you

Questions, assumptions, and replication notes are welcome.
