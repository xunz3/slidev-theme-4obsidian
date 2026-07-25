import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import { chromium } from 'playwright-chromium'
import {
  NAVIGATION_ABSOLUTE_MAXIMUM_MS,
  MINIMUM_NAVIGATION_SAMPLES,
  createNavigationTimingScript,
  measureNavigationScenario,
  navigationScenarioDefinitions,
  nearestRankPercentile,
  summarizeNavigationSamples,
  writeNavigationEvidence,
} from './navigation-performance.mjs'
import {
  buildDeck,
  qualityArtifactRoot,
  readQualityBuildContext,
  repositoryRoot,
  startStaticServer,
} from './helpers.mjs'

test('nearest-rank p95 is deterministic and rejects undersampling', () => {
  const samples = Array.from({ length: 20 }, (_, index) => index + 1)
  assert.equal(MINIMUM_NAVIGATION_SAMPLES, 20)
  assert.equal(nearestRankPercentile(samples, 0.95), 19)
  assert.throws(
    () => summarizeNavigationSamples(samples.slice(0, 19)),
    /at least 20/i,
  )
  assert.deepEqual(summarizeNavigationSamples(samples), {
    maximumMs: 20,
    medianMs: 10.5,
    p95Ms: 19,
    samplesMs: samples,
  })
})

test('browser timing starts at the in-page ArrowRight event and observes stability', () => {
  const source = createNavigationTimingScript().toString()
  assert.match(source, /keydown/)
  assert.match(source, /ArrowRight/)
  assert.match(source, /performance\.now/)
  assert.match(source, /document\.fonts/)
  assert.match(source, /\.decode/)
  assert.match(source, /MutationObserver/)
  assert.match(source, /ResizeObserver/)
  assert.match(source, /PerformanceObserver/)
  assert.match(source, /layout-shift/)
  assert.match(source, /requestAnimationFrame/)
  assert.match(source, /stableFrames/)
})

test('navigation evidence is wired into the normal and performance-update gates', async () => {
  const [runner, aggregate] = await Promise.all([
    readFile(resolve(repositoryRoot, 'scripts/run-quality-gates.mjs'), 'utf8'),
    readFile(resolve(repositoryRoot, 'tests/quality/run.mjs'), 'utf8'),
  ])
  assert.match(runner, /--update-performance-baselines/)
  assert.match(aggregate, /navigation-performance\.spec\.mjs/)
  assert.match(aggregate, /navigation-performance\.json/)
  assert.match(aggregate, /navigation-performance-after\.json/)
})

test('US1 callout, figure, and author stability scenarios are registered', () => {
  assert.deepEqual(
    navigationScenarioDefinitions
      .filter(scenario => scenario.id.startsWith('us1-'))
      .map(scenario => scenario.id),
    ['us1-callout', 'us1-figure', 'us1-authors'],
  )
  for (const scenario of navigationScenarioDefinitions) {
    assert.equal(scenario.buildId, 'expanded-default')
    assert.match(scenario.targetSelector, /data-quality-case/)
    assert.equal(scenario.targetSlide, scenario.fromSlide + 1)
  }
})

test('US2 closing and mirrored image stability scenarios are registered', () => {
  assert.deepEqual(
    navigationScenarioDefinitions
      .filter(scenario => scenario.id.startsWith('us2-'))
      .map(scenario => scenario.id),
    [
      'us2-closing-media',
      'us2-image-left',
      'us2-image-right',
      'us2-image-failed',
    ],
  )
})

test('US3 accent fallback and second-local stability scenarios are registered', () => {
  assert.deepEqual(
    navigationScenarioDefinitions
      .filter(scenario => scenario.id.startsWith('us3-'))
      .map(scenario => scenario.id),
    [
      'us3-local-to-fallback',
      'us3-invalid-to-local',
    ],
  )
})

test('US4 technical authoring stability scenarios are registered', () => {
  assert.deepEqual(
    navigationScenarioDefinitions
      .filter(scenario => scenario.id.startsWith('us4-'))
      .map(scenario => scenario.id),
    [
      'us4-code',
      'us4-steps',
      'us4-timeline',
      'us4-status',
      'us4-keyboard',
    ],
  )
})

test('US5 task and highlight stability scenarios are registered', () => {
  assert.deepEqual(
    navigationScenarioDefinitions
      .filter(scenario => scenario.id.startsWith('us5-'))
      .map(scenario => scenario.id),
    [
      'us5-tasks',
      'us5-highlights',
    ],
  )
})

test('registered affected slides meet navigation and layout-shift budgets', {
  timeout: 240_000,
}, async (t) => {
  const evidencePath = resolve(
    qualityArtifactRoot,
    'navigation-performance-affected-after.json',
  )
  const measuredScenarios = {}
  const external = readQualityBuildContext()
  let server
  let builds = external
  if (!builds) {
    const build = {
      id: 'expanded-default',
      outDir: resolve(qualityArtifactRoot, 'build/navigation/expanded-default'),
      source: resolve(repositoryRoot, 'fixtures/expanded-content.md'),
    }
    await buildDeck(build)
    server = await startStaticServer(build.outDir)
    builds = {
      'expanded-default': {
        ...build,
        baseUrl: server.baseUrl,
        preset: 'default',
      },
    }
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })
  try {
    for (const scenario of navigationScenarioDefinitions) {
      await t.test(scenario.id, async () => {
        const build = builds[scenario.buildId]
        assert.ok(build, `${scenario.id}: missing ${scenario.buildId} build`)
        const page = await context.newPage()
        try {
          const measured = await measureNavigationScenario({
            baseUrl: build.baseUrl,
            fromSlide: scenario.fromSlide,
            mode: scenario.mode,
            page,
            samples: MINIMUM_NAVIGATION_SAMPLES,
            targetSelector: scenario.targetSelector,
            warmups: 2,
          })
          const status = measured.p95Ms <= NAVIGATION_ABSOLUTE_MAXIMUM_MS
            && measured.layoutShiftEntries.length === 0
            ? 'pass'
            : 'fail'
          measuredScenarios[scenario.id] = {
            absoluteMaximumMs: NAVIGATION_ABSOLUTE_MAXIMUM_MS,
            buildId: scenario.buildId,
            deckId: 'expanded-default',
            fromSlide: scenario.fromSlide,
            mode: scenario.mode,
            preset: scenario.preset,
            targetSelector: scenario.targetSelector,
            targetSlide: scenario.targetSlide,
            ...measured,
            status,
          }
          assert.ok(
            measured.p95Ms <= NAVIGATION_ABSOLUTE_MAXIMUM_MS,
            `${scenario.id}: p95 ${measured.p95Ms} ms exceeds ${NAVIGATION_ABSOLUTE_MAXIMUM_MS} ms`,
          )
          assert.deepEqual(
            measured.layoutShiftEntries,
            [],
            `${scenario.id}: target-attributed layout shifts`,
          )
        } finally {
          await page.close()
        }
      })
    }
  } finally {
    await context.close()
    await browser.close()
    await server?.close()
    await writeNavigationEvidence(evidencePath, {
      schemaVersion: 1,
      phase: 'after',
      recordedAt: new Date().toISOString(),
      status: navigationScenarioDefinitions.every(
        scenario => measuredScenarios[scenario.id]?.status === 'pass',
      )
        ? 'pass'
        : 'fail',
      scenarios: measuredScenarios,
    })
  }
})
