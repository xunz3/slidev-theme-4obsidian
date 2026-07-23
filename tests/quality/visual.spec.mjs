import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import {
  acquireVisualBuildContext,
  captureVisualScenario,
  comparePngPixels,
  createVisualBrowser,
  sha256,
  visualBaselineManifestPath,
  visualScenarios,
} from './visual-baselines.mjs'
import { qualityArtifactRoot, repositoryRoot } from './helpers.mjs'

test('reviewed DPR-2 visual references remain within fixed tolerance', { timeout: 240_000 }, async (t) => {
  const manifest = JSON.parse(
    await readFile(visualBaselineManifestPath, 'utf8'),
  )
  assert.deepEqual(
    manifest.scenarios.map(scenario => scenario.id),
    visualScenarios.map(scenario => scenario.id),
    'visual scenario manifest drift',
  )
  assert.deepEqual(manifest.viewport, {
    deviceScaleFactor: 2,
    logicalHeight: 552,
    logicalWidth: 980,
    rasterHeight: 1104,
    rasterWidth: 1960,
  })
  assert.equal(manifest.tolerance.maximumChangedPixelRatio, 0)
  assert.equal(manifest.tolerance.maximumChannelDelta, 0)
  assert.equal(manifest.tolerance.perChannelThreshold, 0)

  const acquired = await acquireVisualBuildContext()
  const { browser, context } = await createVisualBrowser()
  const differenceDirectory = resolve(qualityArtifactRoot, 'diffs/visual')
  await mkdir(differenceDirectory, { recursive: true })

  try {
    for (const scenario of manifest.scenarios) {
      await t.test(scenario.id, async () => {
        const page = await context.newPage()
        try {
          const actual = await captureVisualScenario(
            page,
            acquired.builds[scenario.buildId],
            scenario,
          )
          const expected = await readFile(resolve(repositoryRoot, scenario.path))
          assert.equal(expected.length, scenario.bytes, 'baseline byte manifest')
          assert.equal(sha256(expected), scenario.sha256, 'baseline hash manifest')

          const comparison = sha256(actual.screenshot) === scenario.sha256
            ? {
                changedPixelRatio: 0,
                changedPixels: 0,
                height: scenario.height,
                maximumChannelDelta: 0,
                width: scenario.width,
              }
            : await comparePngPixels(
              page,
              actual.screenshot,
              expected,
              manifest.tolerance,
            )
          try {
            assert.equal(comparison.width, manifest.viewport.rasterWidth)
            assert.equal(comparison.height, manifest.viewport.rasterHeight)
            assert.ok(
              comparison.changedPixelRatio
                <= manifest.tolerance.maximumChangedPixelRatio,
              `${scenario.id}: changed-pixel ratio ${comparison.changedPixelRatio}`,
            )
            assert.ok(
              comparison.maximumChannelDelta
                <= manifest.tolerance.maximumChannelDelta,
              `${scenario.id}: channel delta ${comparison.maximumChannelDelta}`,
            )
          } catch (error) {
            const actualPath = resolve(
              differenceDirectory,
              `${scenario.id}-actual.png`,
            )
            const expectedPath = resolve(
              differenceDirectory,
              `${scenario.id}-expected.png`,
            )
            const metadataPath = resolve(
              differenceDirectory,
              `${scenario.id}.json`,
            )
            await Promise.all([
              writeFile(actualPath, actual.screenshot),
              writeFile(expectedPath, expected),
              writeFile(metadataPath, `${JSON.stringify({
                actualSha256: sha256(actual.screenshot),
                caseId: scenario.id,
                comparison,
                expectedSha256: scenario.sha256,
                scenario,
                tolerance: manifest.tolerance,
              }, null, 2)}\n`),
            ])
            error.message = `${error.message}; artifacts: ${actualPath}, ${expectedPath}, ${metadataPath}`
            throw error
          }
        } finally {
          await page.close()
        }
      })
    }
  } finally {
    await context.close()
    await browser.close()
    await acquired.close()
  }
})
