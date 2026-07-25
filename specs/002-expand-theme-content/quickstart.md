# Quickstart: Validate Expanded Theme Content

## Purpose

Use this guide after implementation to prove the standalone authoring surface, generated-markup
compatibility, cross-preset presentation, accessibility, accent isolation, output budgets, and
navigation stability end to end.

Normative references:

- [Data model](data-model.md)
- [Component contract](contracts/components.md)
- [Layout contract](contracts/layouts.md)
- [Accent contract](contracts/presentation-accent.md)
- [Quality-gate contract](contracts/quality-gates.md)

## Prerequisites

- Node.js `>=20.19.0`
- pnpm compatible with the checked-in lockfile
- Pinned Playwright Chromium available
- Canonical visual fonts available
- Repository checkout containing the implementation and its reviewed pre-feature performance
  baseline
- Writable ignored `.artifacts/quality/` directory

From the repository root:

```bash
pnpm install --frozen-lockfile
```

Expected:

- Installation succeeds without changing `pnpm-lock.yaml`.
- No new runtime dependency is installed for this feature.
- `playwright-chromium` and `axe-core` remain development-only quality dependencies.

## 1. Confirm Baseline Provenance

Before accepting an after result, inspect:

```text
tests/quality/baselines/output-sizes.json
tests/quality/baselines/navigation-performance.json
qa/expand-theme-content/performance-before.json
```

Expected:

- The records identify a pre-rendering-change commit/environment.
- Output totals reflect the post-spec-001 optimized assets rather than the older 3.2–4.3 MB
  totals.
- Navigation records contain raw unchanged-control samples and nearest-rank p95.
- Reviewer and rationale are present.

If the pre-feature baseline was not captured before rendering implementation, stop: an after
run cannot reconstruct a trustworthy before comparison.

## 2. Run the Complete Blocking Gate

```bash
pnpm run quality
```

Expected:

- Exit status `0`.
- Existing example/default/UCAS/ICT/protocol/preset-isolation builds pass.
- Standalone `expanded-content` builds for all three presets pass without the conversion plugin.
- 114/114 callout type/preset/mode cases pass.
- Component/layout, generated-markup, accent, task, and highlight contracts pass.
- Existing and new reviewed visual references pass at their fixed tolerance.
- Axe reports zero serious/critical findings.
- No unintended frame/content overflow or browser runtime error is reported.
- Affected-slide p95 is at most 100 ms.
- Unchanged-control p95 is at most 110% of its pre-feature value.
- Delayed/failing figures and logos produce zero target-attributed post-visibility layout shift.
- Standalone/protocol output and affected logical bundles remain within 5%.
- No unjustified shipped theme asset exceeds 256,000 bytes.
- Approved baseline files are byte-for-byte unchanged by the normal run.
- The aggregate gate finishes in under 300 seconds.

Start failure diagnosis with:

```text
.artifacts/quality/summary.json
```

Every failure should link to a retained log, Axe record, screenshot/diff, raw timing sample, or
output measurement.

## 3. Verify Standalone Authoring Independently

```bash
pnpm exec slidev build fixtures/expanded-content.md --out .artifacts/manual-expanded
```

Expected:

- Production build succeeds.
- The deck enables no Obsidian conversion plugin.
- It exercises all 19 callout types, neutral/rich fallback, Figure, Authors, five layout names,
  accent sequence, Steps, Timeline, Tag, Badge, Kbd, tasks, and highlights.

The aggregate gate additionally builds this source under global `default`, `ucas`, and `ict`.

## 4. Run Focused Diagnostics

Use these only when isolating a failed aggregate phase:

```bash
node --test tests/quality/configuration.spec.mjs
node --test tests/quality/content-contracts.spec.mjs
node --test tests/quality/accessibility.spec.mjs
node --test tests/quality/navigation-performance.spec.mjs
node --test tests/quality/visual.spec.mjs
pnpm run assets:check
```

Expected focused results:

- Configuration: local `accent` resolves local → deck → preset and never leaks.
- Content contracts: exhaustive callouts plus component/layout semantics and compatibility pass.
- Accessibility: alternatives, order, focus, task state, non-color cues, and overflow pass.
- Navigation performance: raw samples, p95, and layout-shift thresholds pass.
- Visual: exact approved references pass.
- Assets: existing brand fidelity and recursive 250 KiB checks pass.

## 5. Verify Existing Build Compatibility

```bash
pnpm run build
pnpm run build:fixture
pnpm run build:default
pnpm run build:ucas
pnpm run build:ict
```

Expected:

- Every command exits `0`.
- Existing decks need no author/configuration changes.
- Existing raw `.obsidian-slidev-*` callout/media markup remains accepted.
- Protocol task/highlight markup receives theme presentation styling without parser changes.
- Built-in-compatible `end`, `image-left`, and `image-right` authoring still accepts the
  existing `image`, `class`, and `backgroundSize` inputs.

## 6. Inspect Accent and Reading-order Evidence

Review the content-contract and browser evidence for:

1. valid local accent;
2. immediately following unaccented fallback;
3. empty/invalid local fallback;
4. another valid local accent;
5. protected UCAS/ICT brand treatment;
6. `image-left` and `image-right` with identical narrative-then-figure DOM order;
7. `end` and `thanks` with equivalent structure;
8. ordered Steps/Timeline source order.

Expected:

- Local accent variables exist only on their rendered slide roots.
- Document-root variables represent deck state only.
- Visual orientation does not change document reading order.
- No static label, keycap, decorative connector, or task checkbox enters tab order.

## 7. Review Media Failure and Stability

Inspect delayed-success and failed-request evidence in:

```text
.artifacts/quality/navigation-performance-after.json
.artifacts/quality/axe/
.artifacts/quality/screenshots/
```

Expected:

- Figure/logo shells reserve space before decode.
- Adjacent narrative/message geometry is unchanged after success or failure.
- Meaningful fallback description remains available.
- Decorative images stay excluded from the accessibility tree.
- No broken image remains in the inspected DOM.

## 8. Review Output and Navigation Evidence

Compare:

```text
qa/expand-theme-content/performance-before.json
qa/expand-theme-content/performance-after.json
.artifacts/quality/performance-after.json
.artifacts/quality/navigation-performance-after.json
```

Expected:

- Environment differences are explicit.
- Raw file lists sum to their reported totals.
- Stable logical bundle groups do not depend on hashed filenames.
- Total and affected-bundle growth are at most 5%, absent a reviewed exception.
- Every timing scenario includes raw samples, median, p95, maximum, visibility/stability
  components, and layout-shift evidence.
- The after record references, but does not rewrite, the approved before baseline.

## 9. Complete Human Visual Review

Review at 980 × 552 in every preset and supported mode:

- six callout families plus neutral fallback;
- meaningful, decorative, missing, and failed figures;
- mixed/long author cards and focus-visible email;
- `end`/`thanks`, both image orientations, and code;
- zero/one/many Steps/Timeline;
- Tag/Badge/Kbd long and bilingual content;
- checked/unchecked nested tasks and prose highlights;
- valid/fallback accent sequence and protected brand identity.

Record the result in:

```text
qa/expand-theme-content/visual-review.md
```

The record includes reviewer, date, environment, cases/matrix, result, and any required skip
with reason, owner, and follow-up. An unexplained skip does not pass.

## 10. Validate Documentation Usability

Using only `README.md`, have a maintainer create:

1. one typed callout;
2. one captioned accessible figure;
3. one author collection from root metadata;
4. one closing slide;
5. one image-and-text slide.

Expected:

- The five examples take no more than 10 minutes in total.
- At least 90% of documented tasks work correctly on the first attempt.
- Every new component/layout, accent precedence, task style, highlight style, and fallback is
  documented.
- Representative examples exist in both `README.md` and maintained fixtures/example content.

## Reviewed Baseline Maintenance

Do not update baselines merely to make a failure pass.

For an intentional approved visual-only change:

```bash
pnpm run quality:update-visual-baselines -- --reviewer "<name>" --rationale "<approved reason>"
pnpm run quality
```

Performance baselines are captured before rendering implementation, not after:

```bash
pnpm run quality:update-performance-baselines -- --reviewer "<name>" --rationale "<approved pre-feature reason>"
```

Any performance-baseline recapture after implementation requires a constitutionally reviewed
exception because it replaces the required comparison.

## Completion Checklist

- [ ] Standalone expanded-content and all existing production builds pass.
- [ ] 114/114 exhaustive callout cases pass.
- [ ] Component/generated equivalence and public fallbacks pass.
- [ ] Closing aliases and image orientations preserve compatibility and reading order.
- [ ] Slide accent precedence, isolation, and protected roles pass.
- [ ] Tasks are disabled/non-focusable and highlights do not affect code.
- [ ] Zero serious/critical Axe findings and zero unintended overflow.
- [ ] Navigation p95 and zero-layout-shift gates pass.
- [ ] Output/bundle and recursive asset budgets pass.
- [ ] Human visual and documentation usability reviews are recorded.
- [ ] Normal validation mutates no approved baseline.
