# Contract: Expand Theme Content Quality Gates

## Command Surface

Existing commands remain:

| Command | Purpose | Approved baseline mutation |
| --- | --- | --- |
| `pnpm run quality` | Complete blocking release gate | Never |
| `pnpm run build` | Standalone example production build | No |
| `pnpm run build:fixture` | Generated Obsidian protocol build | No |
| `pnpm run build:default` | Default preset build | No |
| `pnpm run build:ucas` | UCAS preset build | No |
| `pnpm run build:ict` | ICT preset build | No |
| `pnpm run assets:check` | Brand plus generic shipped-asset checks | No |

Implementation adds reviewed, explicit maintenance paths that separate visual approval from
performance baselines:

| Command | Purpose |
| --- | --- |
| `pnpm run quality:update-visual-baselines -- --reviewer "…" --rationale "…"` | Intentional visual-only approval |
| `pnpm run quality:update-performance-baselines -- --reviewer "…" --rationale "…"` | Pre-feature output/navigation baseline capture |

The existing combined `quality:update-baselines` command may remain for compatibility, but the
feature workflow must not run it after implementation because that would erase the pre-feature
performance comparison.

Exit behavior remains:

- `0`: all required gates passed.
- `1`: one or more product/contract gates failed.
- `2`: harness error, unapproved required skip, or aggregate timeout.

## Reproducible Environment

- Node.js satisfying `>=20.19.0`
- Frozen `pnpm-lock.yaml`
- Pinned Playwright Chromium and Axe
- Loopback static production server
- 980 × 552 logical viewport, DPR 2
- Fonts used by the canonical visual environment
- Aggregate deadline below 300,000 ms

Evidence records commit, dirty state, OS, Node/pnpm/Chromium versions, lockfile hash, viewport,
start/end time, and phase durations.

## Baseline Order Gate

Before component/layout/style implementation:

1. Add only the measurement infrastructure needed to capture output and navigation controls.
2. Capture fresh reviewed output and unchanged-control navigation baselines from the current
   pre-feature render behavior.
3. Retain the immutable record under `tests/quality/baselines/` and durable copy under
   `qa/expand-theme-content/performance-before.json`.
4. Only then implement feature rendering.

The old output totals recorded before the spec-001 asset reduction are not an acceptable feature
baseline. Normal quality runs snapshot the baseline tree before/after and fail on any byte
change.

## Build Gate

Required production sources:

- `example.md`
- `fixtures/default-preset.md`
- `fixtures/ucas-preset.md`
- `fixtures/ict-preset.md`
- `fixtures/obsidian-protocol.md`
- `fixtures/expanded-content.md` under global default, UCAS, and ICT
- existing generated preset-isolation matrix

Rules:

- Build clean absolute output directories under `.artifacts/quality/build/`.
- Reuse each built deck across contract, Axe, visual, and performance gates.
- Keep existing maximum build concurrency and retained per-deck logs.
- A build/runtime error identifies the source, exit status, and retained artifact.
- The standalone expanded deck uses no Obsidian conversion plugin.

## Content Contract Gate

`tests/quality/content-contracts.spec.mjs` runs against production-built pages.

### Exhaustive callout matrix

Required result:

```text
19 canonical types × 3 presets × 2 modes = 114 passing cases
```

Each case verifies:

- canonical class and `data-callout`;
- visible/default title;
- labelled `role="note"` and formatted content hierarchy;
- visible type cue not dependent on color;
- non-empty computed border/background/text treatment;
- equivalence with raw generated markup for that type family;
- no unintended overflow.

Separate cases cover omitted, empty, unsupported, case-normalized types, omitted/long titles,
and rich body content.

### Other component/layout cases

| Surface | Required cases |
| --- | --- |
| Figure | Authored alt, caption fallback, explicit decorative alt, no description/caption, missing source, failed source, tall/wide/transparent media |
| Authors | String, mixed/partial records, invalid/valid email, order, intentional duplicate, no valid authors |
| Closing | `end` and `thanks` structural equivalence; default-slot compatibility; optional contact/authors/logo; omitted/failed logo |
| Image/text | Both orientations, identical DOM order, mirrored geometry, existing `image`/`class`/`backgroundSize`, missing media, long/bilingual content |
| Code | Visible/missing heading, full-width primary code, long-line and long-file containment |
| Steps/Timeline | Zero, one, many; list source order; dates; long/bilingual labels |
| Tag/Badge/Kbd | Correct static semantics, no focus target, non-color cue, long text, single key and chord |
| Tasks/highlight | Checked/unchecked/nested/wrapped, disabled/non-focusable inputs, prose mark distinction, no code restyling |

Explicit assertions compare component-authored callout/figure DOM and computed style
fingerprints with equivalent `.obsidian-slidev-*` markup.

## Accent Gate

For every preset and mode:

1. Navigate to a valid local accent slide and verify all documented consumer roles.
2. Advance to a slide without a local value and verify deck/preset fallback.
3. Test empty and invalid local values.
4. Test a local value equal to the deck value.
5. Mount or inspect multiple slides simultaneously and verify independent computed values.
6. Compare official UCAS/ICT brand pixels/styles before and after the override.

No local accent may appear on `document.documentElement`.

## Accessibility and Interaction Gate

Extend the current Axe/Playwright gate with representative feature slides in all three presets
and both modes.

Required:

- zero critical or serious Axe findings;
- one main landmark per slide;
- meaningful image alternatives and decorative exclusion;
- no unnamed focusable control;
- visible keyboard focus on contact/email links;
- tags, badges, keycaps, decorative sequence marks, and task boxes excluded from tab order;
- disabled task checkboxes cannot toggle;
- logical heading and DOM reading order;
- no status/category distinction dependent on color alone;
- no unintended canvas/frame/content overflow;
- no local console/page/request failure.

Axe does not replace explicit source-order, task-state, non-color-cue, or equivalence assertions.

## Visual Gate

- Preserve all existing exact DPR-2 visual references and zero-tolerance metadata.
- Add representative grouped feature scenarios rather than one golden per exhaustive case.
- Cover all six callout semantic families, neutral fallback, figures/authors, closing aliases,
  both image orientations, code, process/status/keyboard, task/highlight, and accent fallback.
- Generate contact sheets for every preset and mode.
- A reviewed baseline update requires named reviewer and rationale and uses the visual-only path.

Human review records:

- short, long, and bilingual content;
- hierarchy, typography, contrast, focus, non-color cues;
- clipping, overlap, contained overflow;
- mirrored placement and logical order;
- image/logo failure and post-decode stability;
- protected brand treatment.

## Navigation p95 Gate

`tests/quality/navigation-performance.spec.mjs` measures in-page ArrowRight input to a stable
target in the production build.

Per sample:

1. A capturing `keydown` listener records `performance.now()`.
2. The expected target marker becomes visible.
3. `document.fonts.ready` resolves and all visible target images complete/decode.
4. MutationObserver, ResizeObserver, and `layout-shift` entries are monitored.
5. Stability occurs after two consecutive animation frames with identical frame/content/media
   geometry and no intervening signal.
6. Record `stableAt - inputAt`, visibility time, stability time, and shift entries.

Sampling/statistics:

- warm up before recording;
- at least 20 measured transitions per affected scenario;
- balance representative scenarios across callout, figure/authors, closing, image/text, code,
  process/status, and task/highlight content;
- nearest-rank p95 is sorted index `ceil(0.95 × N) - 1`;
- retain every raw sample.

Blocking thresholds:

- affected-slide p95 `<= 100 ms`;
- unchanged-control after p95 `<= pre-feature p95 × 1.10`;
- zero target-attributed post-visibility layout-shift entry.

The test must not reuse a helper that disables transitions or inserts a fixed stabilization wait.

## Delayed-media Layout-shift Gate

For a representative figure and closing logo:

1. Intercept a local asset request.
2. Make the target slide visible before fulfilling the request.
3. Record frame, media shell, caption, and adjacent-region geometry.
4. Fulfill/decode the image.
5. Require unchanged surrounding geometry and zero target-attributed layout shift.
6. Repeat the failure path and require descriptive fallback with stable geometry.

Author-supplied media bytes are excluded from theme output/asset size budgets, but component
geometry and error handling are not excluded from stability checks.

## Production Output Gate

Metrics:

- sum of regular-file bytes in clean output trees;
- stable logical main CSS, main JS, `SlideFrame`, and any new feature chunk groups;
- before/after environment and sorted file evidence.

Required sources:

- representative standalone/example deck;
- generated protocol deck.

Thresholds:

- each total `<= floor(fresh pre-feature baseline × 1.05)`;
- each affected shipped bundle/group `<= floor(fresh pre-feature baseline × 1.05)`, unless a
  named reviewed feature-addition record explains a genuinely new chunk;
- a smaller after result never rewrites the approved baseline automatically.

## Asset Gate

Keep all existing brand-fidelity checks and add recursive enumeration of every shipped
theme-owned asset root, including package `assets/` and `public/`.

- No unapproved individual theme-owned shipped asset exceeds 256,000 bytes (250 KiB).
- Any exception record includes path, bytes, reviewer, rationale, mitigation, and follow-up.
- Author-supplied fixture media is identified and excluded from the byte budget.
- New asset paths cannot escape validation merely because they are not in the current brand
  allowlist.

## Evidence

Approved immutable baselines:

```text
tests/quality/baselines/
├── output-sizes.json
├── navigation-performance.json
└── visual/
```

Ignored runtime evidence:

```text
.artifacts/quality/
├── summary.json
├── performance-after.json
├── navigation-performance-after.json
├── axe/
├── screenshots/
├── diffs/
└── logs/
```

Durable review evidence:

```text
qa/expand-theme-content/
├── performance-before.json
├── performance-after.json
└── visual-review.md
```

Any required skip is release-blocking unless it has an explicit reason, owner, follow-up, and
constitutionally approved time-bounded exception.
