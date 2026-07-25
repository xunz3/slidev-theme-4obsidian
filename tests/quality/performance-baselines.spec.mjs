import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import {
  OUTPUT_BUDGET_RATIO,
  classifyLogicalBundle,
  groupLogicalBundles,
  maximumBytesFor,
  validateOutputEvidence,
} from '../../scripts/measure-build-output.mjs'
import { repositoryRoot } from './helpers.mjs'

const readJson = async path => JSON.parse(await readFile(path, 'utf8'))

test('logical output bundles are classified independently of content hashes', () => {
  assert.equal(classifyLogicalBundle('assets/index-a1B2c3.css'), 'mainCss')
  assert.equal(classifyLogicalBundle('assets/index-Z9_y8.js'), 'mainJs')
  assert.equal(classifyLogicalBundle('assets/SlideFrame-C9q5umTH.js'), 'slideFrame')
  assert.equal(classifyLogicalBundle('assets/modules/vue-BY1aeybS.js'), null)

  assert.deepEqual(groupLogicalBundles([
    { path: 'assets/SlideFrame-new.js', bytes: 70 },
    { path: 'assets/index-next.css', bytes: 20 },
    { path: 'assets/index-next.js', bytes: 30 },
    { path: 'assets/index-old.css', bytes: 10 },
    { path: 'index.html', bytes: 5 },
  ]), {
    mainCss: {
      files: [
        { path: 'assets/index-next.css', bytes: 20 },
        { path: 'assets/index-old.css', bytes: 10 },
      ],
      totalBytes: 30,
    },
    mainJs: {
      files: [{ path: 'assets/index-next.js', bytes: 30 }],
      totalBytes: 30,
    },
    slideFrame: {
      files: [{ path: 'assets/SlideFrame-new.js', bytes: 70 }],
      totalBytes: 70,
    },
  })
})

test('output ceilings use the exact five-percent contract', () => {
  assert.equal(OUTPUT_BUDGET_RATIO, 1.05)
  assert.equal(maximumBytesFor(100), 105)
  assert.equal(maximumBytesFor(101), 106)
  assert.equal(maximumBytesFor(0), 0)
})

test('the reviewed before baseline has complete reproducibility provenance', async () => {
  const baselinePath = resolve(
    repositoryRoot,
    'tests/quality/baselines/output-sizes.json',
  )
  const baseline = await readJson(baselinePath)
  assert.doesNotThrow(() => validateOutputEvidence(baseline, {
    phase: 'before',
    requireReview: true,
  }))
})

test('quality exposes separate visual and performance mutation modes', async () => {
  const [packageJson, runner, aggregate] = await Promise.all([
    readJson(resolve(repositoryRoot, 'package.json')),
    readFile(resolve(repositoryRoot, 'scripts/run-quality-gates.mjs'), 'utf8'),
    readFile(resolve(repositoryRoot, 'tests/quality/run.mjs'), 'utf8'),
  ])

  assert.match(
    packageJson.scripts['quality:update-visual-baselines'] ?? '',
    /--update-visual-baselines/,
  )
  assert.match(
    packageJson.scripts['quality:update-performance-baselines'] ?? '',
    /--update-performance-baselines/,
  )
  assert.match(runner, /--update-visual-baselines/)
  assert.match(runner, /--update-performance-baselines/)
  assert.match(aggregate, /updateVisualBaselines/)
  assert.match(aggregate, /updatePerformanceBaselines/)
})

test('a normal quality run snapshots and preserves every approved baseline', async () => {
  const aggregate = await readFile(
    resolve(repositoryRoot, 'tests/quality/run.mjs'),
    'utf8',
  )
  assert.match(aggregate, /baselineBefore\s*=\s*await snapshotTree/)
  assert.match(aggregate, /baselineAfter\s*=\s*await snapshotTree/)
  assert.match(aggregate, /Normal quality run mutated approved baselines/)
})
