import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { arch, platform, release } from 'node:os'
import { dirname, relative, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { chromium } from 'playwright-chromium'
import {
  assertArtifactPath,
  buildDeck,
  generateExpandedContentDefinitions,
  generatePresetMatrixDefinitions,
  mapConcurrent,
  qualityArtifactRoot,
  repositoryRoot,
  resetArtifactDirectory,
  runProcess,
  startStaticServer,
  terminateActiveProcesses,
} from './helpers.mjs'
import {
  createVisualBrowser,
  updateVisualBaselines,
} from './visual-baselines.mjs'
import {
  logicalBundleNames,
  maximumBytesFor,
  measureOutputDirectory,
  validateOutputEvidence,
} from '../../scripts/measure-build-output.mjs'
import {
  MINIMUM_NAVIGATION_SAMPLES,
  NAVIGATION_ABSOLUTE_MAXIMUM_MS,
  NAVIGATION_RELATIVE_RATIO,
  measureNavigationScenario,
  navigationScenarioDefinitions,
  writeNavigationEvidence,
} from './navigation-performance.mjs'

const execFileAsync = promisify(execFile)
const summaryPath = resolve(qualityArtifactRoot, 'summary.json')
const baselineRoot = resolve(repositoryRoot, 'tests/quality/baselines')
const outputBaselinePath = resolve(
  baselineRoot,
  'output-sizes.json',
)
const navigationBaselinePath = resolve(
  baselineRoot,
  'navigation-performance.json',
)
const affectedNavigationAfterPath = resolve(
  qualityArtifactRoot,
  'navigation-performance-affected-after.json',
)
const performanceBeforePath = resolve(
  repositoryRoot,
  'qa/expand-theme-content/performance-before.json',
)
const performanceAfterPath = resolve(
  repositoryRoot,
  'qa/expand-theme-content/performance-after.json',
)
const deadlineMs = 300_000
const requiredFailureFields = ['gate', 'caseId', 'status', 'artifactPaths']

const sha256 = value => createHash('sha256').update(value).digest('hex')
const relativePath = path => relative(repositoryRoot, path).split(sep).join('/')
const now = () => new Date().toISOString()
const resolvePnpmVersion = stdout => (
  stdout.trim()
  || process.env.npm_config_user_agent?.match(/\bpnpm\/([^\s]+)/)?.[1]
  || ''
)

const snapshotTree = async (root) => {
  const entries = await readdir(root, { recursive: true, withFileTypes: true })
  const snapshot = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const absolutePath = resolve(entry.parentPath, entry.name)
    const bytes = await readFile(absolutePath)
    snapshot.push({
      path: relative(root, absolutePath).split(sep).join('/'),
      bytes: bytes.length,
      sha256: sha256(bytes),
    })
  }
  snapshot.sort((left, right) => left.path.localeCompare(right.path))
  return snapshot
}

export const validateQualityRecord = (record) => {
  for (const field of requiredFailureFields) {
    if (record[field] === undefined || record[field] === null) {
      throw new Error(`Quality record is missing ${field}`)
    }
  }
  if (!['fail', 'skipped'].includes(record.status)) {
    throw new Error(`Quality record ${record.caseId} has invalid status ${record.status}`)
  }
  if (!Array.isArray(record.artifactPaths) || record.artifactPaths.length === 0) {
    throw new Error(`Quality record ${record.caseId} needs a retained artifact path`)
  }
  for (const artifactPath of record.artifactPaths) {
    assertArtifactPath(artifactPath)
  }
  if (record.status === 'fail'
    && (record.expected === undefined || record.actual === undefined)) {
    throw new Error(`Failed record ${record.caseId} needs expected and actual values`)
  }
  if (record.status === 'skipped') {
    for (const field of ['reason', 'owner', 'followUp']) {
      if (typeof record[field] !== 'string' || !record[field].trim()) {
        throw new Error(`Skipped record ${record.caseId} needs ${field}`)
      }
    }
  }
  return record
}

export const classifyQualityExit = ({
  harnessError = false,
  records = [],
  timedOut = false,
}) => {
  if (timedOut || harnessError || records.some(record => record.status === 'skipped')) {
    return 2
  }
  return records.some(record => record.status === 'fail') ? 1 : 0
}

export const runSelfChecks = async ({ writeSummary = false } = {}) => {
  const selfCheckDirectory = await resetArtifactDirectory(
    resolve(qualityArtifactRoot, 'self-check'),
  )
  const artifact = name => resolve(selfCheckDirectory, name)
  const cases = [
    {
      expectedExitCode: 1,
      record: {
        gate: 'configuration',
        caseId: 'configuration-invalid-local-value',
        status: 'fail',
        selector: 'presentationPreset',
        property: 'value',
        expected: 'valid deck value',
        actual: 'unsupported local value',
        artifactPaths: [artifact('configuration.json')],
      },
    },
    {
      expectedExitCode: 1,
      record: {
        gate: 'visual',
        caseId: 'default-to-ucas-dark',
        status: 'fail',
        deck: 'matrix-default',
        globalPreset: 'default',
        localPreset: 'ucas',
        mode: 'dark',
        slide: 4,
        title: 'Preset isolation',
        selector: '.slidev-layout',
        property: 'pixels',
        expected: { changedPixelRatio: 0 },
        actual: { changedPixelRatio: 0.25 },
        artifactPaths: [
          artifact('screenshot-actual.png'),
          artifact('screenshot-expected.png'),
          artifact('screenshot-diff.json'),
        ],
      },
    },
    {
      expectedExitCode: 1,
      record: {
        gate: 'asset',
        caseId: 'assets-UCAS-emblem.svg',
        status: 'fail',
        property: 'rawBytes',
        expected: 256_000,
        actual: 256_001,
        artifactPaths: [artifact('asset-size.json')],
      },
    },
    {
      expectedExitCode: 2,
      record: {
        gate: 'accessibility',
        caseId: 'axe-environment-unavailable',
        status: 'skipped',
        reason: 'Synthetic required-gate skip',
        owner: 'quality-maintainer',
        followUp: 'Restore Chromium before release',
        artifactPaths: [artifact('skipped-gate.json')],
      },
    },
  ]

  assert.throws(
    () => validateQualityRecord({
      ...cases[3].record,
      owner: '',
      followUp: '',
    }),
    /needs owner|needs followUp/,
  )
  for (const syntheticCase of cases) {
    validateQualityRecord(syntheticCase.record)
    assert.equal(
      classifyQualityExit({ records: [syntheticCase.record] }),
      syntheticCase.expectedExitCode,
      syntheticCase.record.caseId,
    )
  }
  assert.equal(classifyQualityExit({ timedOut: true }), 2)

  const evidence = {
    schemaVersion: 1,
    mode: 'self-check',
    checkedAt: now(),
    status: 'pass',
    cases,
    timeout: {
      expectedExitCode: 2,
      detectedExitCode: classifyQualityExit({ timedOut: true }),
    },
  }
  const evidencePath = artifact('records.json')
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`)
  for (const syntheticCase of cases) {
    for (const path of syntheticCase.record.artifactPaths) {
      await writeFile(
        path,
        `${JSON.stringify({
          caseId: syntheticCase.record.caseId,
          synthetic: true,
        }, null, 2)}\n`,
      )
    }
  }
  if (writeSummary) {
    await mkdir(dirname(summaryPath), { recursive: true })
    await writeFile(summaryPath, `${JSON.stringify({
      ...evidence,
      exitCode: 0,
      summaryPath: relativePath(summaryPath),
    }, null, 2)}\n`)
  }
  return {
    cases: cases.map(syntheticCase => ({
      caseId: syntheticCase.record.caseId,
      expectedExitCode: syntheticCase.expectedExitCode,
    })),
    evidencePath: relativePath(evidencePath),
  }
}

const collectEnvironment = async () => {
  const lockfile = await readFile(resolve(repositoryRoot, 'pnpm-lock.yaml'))
  const [
    { stdout: commit },
    { stdout: pnpmVersion },
    { stdout: chromiumVersion },
    { stdout: status },
  ] = await Promise.all([
    execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot }),
    execFileAsync('pnpm', ['--version'], { cwd: repositoryRoot }),
    execFileAsync(chromium.executablePath(), ['--version'], { cwd: repositoryRoot }),
    execFileAsync('git', ['status', '--porcelain'], { cwd: repositoryRoot }),
  ])
  return {
    architecture: arch(),
    chromiumVersion: chromiumVersion.trim(),
    gitCommit: commit.trim(),
    lockfileSha256: sha256(lockfile),
    nodeVersion: process.version,
    operatingSystem: `${platform()} ${release()}`,
    pnpmVersion: resolvePnpmVersion(pnpmVersion),
    workingTreeDirty: status.trim().length > 0,
  }
}

const updateOutputBaselines = async ({
  buildContext,
  rationale,
  reviewer,
}) => {
  const sources = {
    example: 'example.md',
    'default-only': 'fixtures/default-preset.md',
    protocol: 'fixtures/obsidian-protocol.md',
  }
  const [
    { stdout: commit },
    { stdout: pnpmVersion },
    { stdout: status },
  ] = await Promise.all([
    execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot }),
    execFileAsync('pnpm', ['--version'], { cwd: repositoryRoot }),
    execFileAsync('git', ['status', '--porcelain'], { cwd: repositoryRoot }),
  ])
  const record = {
    schemaVersion: 2,
    phase: 'before',
    recordedAt: now(),
    gitCommit: commit.trim(),
    workingTreeDirty: status.trim().length > 0,
    nodeVersion: process.version,
    pnpmVersion: resolvePnpmVersion(pnpmVersion),
    lockfileSha256: sha256(
      await readFile(resolve(repositoryRoot, 'pnpm-lock.yaml')),
    ),
    review: {
      rationale: rationale.trim(),
      reviewer: reviewer.trim(),
    },
    decks: {},
  }

  for (const [deckId, source] of Object.entries(sources)) {
    const measured = await measureOutputDirectory(buildContext[deckId].outDir)
    const logicalBundles = Object.fromEntries(
      logicalBundleNames.map((name) => {
        const bundle = measured.logicalBundles[name]
        return [name, {
          ...bundle,
          baselineBytes: bundle.totalBytes,
          maximumBytes: maximumBytesFor(bundle.totalBytes),
        }]
      }),
    )
    record.decks[deckId] = {
      source,
      baselineBytes: measured.totalBytes,
      maximumBytes: maximumBytesFor(measured.totalBytes),
      totalBytes: measured.totalBytes,
      files: measured.files,
      logicalBundles,
    }
  }
  validateOutputEvidence(record, { phase: 'before', requireReview: true })
  await writeFile(outputBaselinePath, `${JSON.stringify(record, null, 2)}\n`)
  return {
    path: relativePath(outputBaselinePath),
    record,
    totals: Object.fromEntries(
      Object.entries(record.decks).map(([id, deck]) => [id, deck.totalBytes]),
    ),
  }
}

const navigationViewport = {
  deviceScaleFactor: 2,
  height: 552,
  width: 980,
}

const validateNavigationRecord = (record, { phase }) => {
  assert.equal(record.schemaVersion, 1)
  assert.equal(record.phase, phase)
  assert.ok(record.recordedAt)
  assert.ok(record.environment?.gitCommit)
  assert.ok(record.environment?.lockfileSha256)
  assert.deepEqual(record.environment?.viewport, navigationViewport)
  if (phase === 'before') {
    assert.ok(record.review?.reviewer?.trim())
    assert.ok(record.review?.rationale?.trim())
  }
  assert.ok(record.scenarios && typeof record.scenarios === 'object')
  for (const [id, scenario] of Object.entries(record.scenarios)) {
    assert.ok(
      scenario.samplesMs?.length >= MINIMUM_NAVIGATION_SAMPLES,
      `${id}: insufficient navigation samples`,
    )
    assert.equal(
      scenario.p95Ms,
      [...scenario.samplesMs].sort((left, right) => left - right)[
        Math.ceil(scenario.samplesMs.length * 0.95) - 1
      ],
      `${id}: nearest-rank p95`,
    )
    assert.equal(scenario.absoluteMaximumMs, NAVIGATION_ABSOLUTE_MAXIMUM_MS)
    assert.ok(Array.isArray(scenario.rawSamples))
    assert.equal(scenario.rawSamples.length, scenario.samplesMs.length)
  }
  return record
}

const measureUnchangedNavigationControl = async ({
  buildContext,
  browserContext,
}) => {
  const page = await browserContext.newPage()
  try {
    return await measureNavigationScenario({
      baseUrl: buildContext['default-only'].baseUrl,
      fromSlide: 1,
      mode: 'light',
      page,
      samples: MINIMUM_NAVIGATION_SAMPLES,
      targetSelector: '.slidev-layout h1',
      warmups: 2,
    })
  } finally {
    await page.close()
  }
}

const updateNavigationBaselines = async ({
  buildContext,
  rationale,
  reviewer,
}) => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    colorScheme: 'light',
    deviceScaleFactor: navigationViewport.deviceScaleFactor,
    viewport: {
      height: navigationViewport.height,
      width: navigationViewport.width,
    },
  })
  try {
    const measured = await measureUnchangedNavigationControl({
      browserContext: context,
      buildContext,
    })
    const record = {
      schemaVersion: 1,
      phase: 'before',
      recordedAt: now(),
      environment: {
        ...await collectEnvironment(),
        viewport: navigationViewport,
      },
      review: {
        rationale: rationale.trim(),
        reviewer: reviewer.trim(),
      },
      scenarios: {
        'unchanged-control': {
          absoluteMaximumMs: NAVIGATION_ABSOLUTE_MAXIMUM_MS,
          deckId: 'default-only',
          fromSlide: 1,
          mode: 'light',
          preset: 'default',
          targetSelector: '.slidev-layout h1',
          targetSlide: 2,
          ...measured,
          status: measured.layoutShiftEntries.length === 0
            ? 'recorded'
            : 'fail',
        },
      },
    }
    validateNavigationRecord(record, { phase: 'before' })
    await writeNavigationEvidence(navigationBaselinePath, record)
    return {
      path: relativePath(navigationBaselinePath),
      record,
      scenarios: Object.fromEntries(
        Object.entries(record.scenarios).map(([id, scenario]) => [
          id,
          { p95Ms: scenario.p95Ms, samples: scenario.samplesMs.length },
        ]),
      ),
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

const writePerformanceBeforeReview = async ({
  navigation,
  output,
  rationale,
  reviewer,
}) => {
  const record = {
    schemaVersion: 1,
    phase: 'before',
    recordedAt: now(),
    environment: await collectEnvironment(),
    review: {
      rationale: rationale.trim(),
      reviewer: reviewer.trim(),
    },
    status: 'reviewed',
    output: output.record,
    navigation: navigation.record,
  }
  await mkdir(dirname(performanceBeforePath), { recursive: true })
  await writeFile(
    performanceBeforePath,
    `${JSON.stringify(record, null, 2)}\n`,
  )
  return {
    path: relativePath(performanceBeforePath),
    status: record.status,
  }
}

const updatePerformanceBaselines = async ({
  buildContext,
  rationale,
  reviewer,
}) => {
  const output = await updateOutputBaselines({
    buildContext,
    rationale,
    reviewer,
  })
  const navigation = await updateNavigationBaselines({
    buildContext,
    rationale,
    reviewer,
  })
  const durableReview = await writePerformanceBeforeReview({
    navigation,
    output,
    rationale,
    reviewer,
  })
  return { durableReview, navigation, output }
}

const measureNavigationAfter = async ({ buildContext, onRecord }) => {
  const baseline = JSON.parse(await readFile(navigationBaselinePath, 'utf8'))
  validateNavigationRecord(baseline, { phase: 'before' })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    colorScheme: 'light',
    deviceScaleFactor: navigationViewport.deviceScaleFactor,
    viewport: {
      height: navigationViewport.height,
      width: navigationViewport.width,
    },
  })
  try {
    const measured = await measureUnchangedNavigationControl({
      browserContext: context,
      buildContext,
    })
    const before = baseline.scenarios['unchanged-control']
    const relativeMaximumMs = before.p95Ms * NAVIGATION_RELATIVE_RATIO
    const scenario = {
      absoluteMaximumMs: NAVIGATION_ABSOLUTE_MAXIMUM_MS,
      baselineP95Ms: before.p95Ms,
      deckId: 'default-only',
      fromSlide: 1,
      mode: 'light',
      preset: 'default',
      relativeMaximumMs,
      targetSelector: '.slidev-layout h1',
      targetSlide: 2,
      ...measured,
    }
    scenario.status = scenario.p95Ms <= relativeMaximumMs
      && scenario.layoutShiftEntries.length === 0
      ? 'pass'
      : 'fail'
    const affected = JSON.parse(
      await readFile(affectedNavigationAfterPath, 'utf8'),
    )
    const expectedAffectedIds = navigationScenarioDefinitions
      .map(definition => definition.id)
      .sort()
    assert.deepEqual(
      Object.keys(affected.scenarios ?? {}).sort(),
      expectedAffectedIds,
      'Affected navigation evidence does not match the registered scenario set',
    )
    for (const [id, affectedScenario] of Object.entries(affected.scenarios)) {
      assert.ok(
        affectedScenario.p95Ms <= NAVIGATION_ABSOLUTE_MAXIMUM_MS,
        `${id}: affected navigation p95 exceeds the absolute ceiling`,
      )
      assert.deepEqual(
        affectedScenario.layoutShiftEntries,
        [],
        `${id}: affected navigation produced target-attributed layout shift`,
      )
    }
    const scenarios = {
      'unchanged-control': scenario,
      ...affected.scenarios,
    }
    const record = {
      schemaVersion: 1,
      phase: 'after',
      recordedAt: now(),
      baselineRecord: relativePath(navigationBaselinePath),
      environment: {
        ...await collectEnvironment(),
        viewport: navigationViewport,
      },
      status: Object.values(scenarios).every(
        measuredScenario => measuredScenario.status === 'pass',
      )
        ? 'pass'
        : 'fail',
      scenarios,
    }
    validateNavigationRecord(record, { phase: 'after' })
    onRecord?.(record)
    const artifactPath = resolve(
      qualityArtifactRoot,
      'navigation-performance-after.json',
    )
    await writeNavigationEvidence(artifactPath, record)
    if (record.status !== 'pass') {
      const error = new Error(
        `Unchanged-control navigation p95 ${scenario.p95Ms} ms exceeds ${relativeMaximumMs} ms or produced layout shift`,
      )
      error.exitCode = 1
      throw error
    }
    return {
      evidencePath: relativePath(artifactPath),
      affectedScenarios: expectedAffectedIds.length,
      p95Ms: scenario.p95Ms,
      relativeMaximumMs,
      status: record.status,
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

const parseArguments = () => {
  const arguments_ = process.argv.slice(2)
  const selfCheck = arguments_.includes('--self-check')
  const updateBaselines = arguments_.includes('--update-baselines')
  const updateVisualBaselines = arguments_.includes('--update-visual-baselines')
  const updatePerformanceBaselines = arguments_.includes(
    '--update-performance-baselines',
  )
  const valueAfter = (name) => {
    const index = arguments_.indexOf(name)
    return index >= 0 ? arguments_[index + 1] : undefined
  }
  const reviewer = valueAfter('--reviewer')
  const rationale = valueAfter('--rationale')
  const known = new Set([
    '--',
    '--self-check',
    '--update-baselines',
    '--update-visual-baselines',
    '--update-performance-baselines',
    '--reviewer',
    '--rationale',
    reviewer,
    rationale,
  ])
  const unknown = arguments_.filter(argument => !known.has(argument))
  if (unknown.length > 0) {
    throw new Error(`Unsupported quality argument(s): ${unknown.join(', ')}`)
  }
  const updateCount = [
    updateBaselines,
    updateVisualBaselines,
    updatePerformanceBaselines,
  ].filter(Boolean).length
  if (selfCheck && updateCount > 0) {
    throw new Error('--self-check and baseline updates are mutually exclusive')
  }
  if (updateCount > 1) {
    throw new Error('Baseline update modes are mutually exclusive')
  }
  if (updateCount > 0 && (!reviewer?.trim() || !rationale?.trim())) {
    throw new Error(
      'Baseline updates require non-empty --reviewer and --rationale values',
    )
  }
  return {
    rationale,
    reviewer,
    selfCheck,
    updateBaselines,
    updatePerformanceBaselines,
    updateVisualBaselines,
  }
}

const executeQuality = async (options) => {
  const startedAt = performance.now()
  const baselineBefore = await snapshotTree(baselineRoot)
  const summary = {
    schemaVersion: 1,
    mode: options.updateBaselines
      ? 'combined-baseline-update'
      : options.updateVisualBaselines
        ? 'visual-baseline-update'
        : options.updatePerformanceBaselines
          ? 'performance-baseline-update'
          : 'quality',
    startedAt: now(),
    deadlineMs,
    environment: await collectEnvironment(),
    phases: [],
    failures: [],
  }
  let servers = []
  let deadlineTimer
  let timedOut = false
  let activePhase = null

  const remainingMs = () => Math.max(
    0,
    deadlineMs - Math.round(performance.now() - startedAt),
  )
  const runPhase = async (id, operation) => {
    if (remainingMs() <= 0) {
      const error = new Error(`Quality deadline reached before ${id}`)
      error.exitCode = 2
      error.timedOut = true
      throw error
    }
    const phase = {
      id,
      startedAt: now(),
      status: 'running',
    }
    activePhase = phase
    summary.phases.push(phase)
    const phaseStarted = performance.now()
    try {
      phase.details = await operation()
      phase.status = 'pass'
      return phase.details
    } catch (error) {
      phase.status = error.timedOut || error.exitCode === 2 ? 'error' : 'fail'
      phase.reason = error.message
      error.qualityPhase = id
      throw error
    } finally {
      phase.durationMs = Math.round(performance.now() - phaseStarted)
      phase.finishedAt = now()
      activePhase = null
    }
  }
  const runCommandPhase = async (id, args, timeoutMs = 240_000) => {
    const logPath = resolve(qualityArtifactRoot, `logs/${id}.log`)
    const result = await runProcess(
      process.execPath,
      args,
      {
        env: buildEnvironment,
        label: id,
        logPath,
        timeoutMs: Math.min(timeoutMs, remainingMs()),
      },
    )
    return {
      durationMs: result.durationMs,
      logPath: relativePath(logPath),
    }
  }

  let buildEnvironment = {}
  const timeoutPromise = new Promise((_, reject) => {
    deadlineTimer = setTimeout(() => {
      timedOut = true
      void terminateActiveProcesses()
      const error = new Error(
        `Quality gate exceeded ${deadlineMs} ms during ${activePhase?.id ?? 'unknown phase'}`,
      )
      error.exitCode = 2
      error.timedOut = true
      reject(error)
    }, deadlineMs)
  })

  const run = async () => {
    await runPhase('prepare-artifacts', async () => {
      await Promise.all([
        'axe',
        'build',
        'diffs',
        'generated',
        'logs',
        'screenshots',
        'self-check',
      ].map(directory => resetArtifactDirectory(
        resolve(qualityArtifactRoot, directory),
      )))
      await Promise.all([
        summaryPath,
        affectedNavigationAfterPath,
        resolve(qualityArtifactRoot, 'navigation-performance-after.json'),
        resolve(qualityArtifactRoot, 'performance-after.json'),
      ].map(path => rm(path, { force: true })))
      return { root: relativePath(qualityArtifactRoot) }
    })

    let buildDefinitions
    await runPhase('prepare-builds', async () => {
      const [matrixDefinitions, expandedDefinitions] = await Promise.all([
        generatePresetMatrixDefinitions(),
        generateExpandedContentDefinitions(),
      ])
      const maintainedRoot = await resetArtifactDirectory(
        resolve(qualityArtifactRoot, 'build/maintained'),
      )
      const maintained = [
        { id: 'example', source: 'example.md' },
        { id: 'default-only', source: 'fixtures/default-preset.md' },
        { id: 'ucas', source: 'fixtures/ucas-preset.md' },
        { id: 'ict', source: 'fixtures/ict-preset.md' },
        { id: 'protocol', source: 'fixtures/obsidian-protocol.md' },
      ].map(definition => ({
        ...definition,
        outDir: resolve(maintainedRoot, definition.id),
        source: resolve(repositoryRoot, definition.source),
      }))
      buildDefinitions = [
        ...maintained,
        ...matrixDefinitions.map(definition => ({
          ...definition,
          id: `matrix-${definition.preset}`,
        })),
        ...expandedDefinitions,
      ]
      assert.equal(new Set(buildDefinitions.map(build => build.id)).size, 11)
      for (const build of buildDefinitions) {
        assert.ok(resolve(build.outDir) === build.outDir, `${build.id}: absolute output`)
      }
      return {
        builds: buildDefinitions.map(build => ({
          id: build.id,
          outDir: relativePath(build.outDir),
          source: relativePath(build.source),
        })),
        maximumConcurrency: 2,
      }
    })

    const buildResults = await runPhase('builds', async () => mapConcurrent(
      buildDefinitions,
      2,
      async (definition) => {
        const result = await buildDeck({
          ...definition,
          timeoutMs: Math.min(120_000, remainingMs()),
        })
        return {
          durationMs: result.durationMs,
          id: definition.id,
          logPath: relativePath(
            resolve(qualityArtifactRoot, `logs/build-${definition.id}.log`),
          ),
          outDir: relativePath(definition.outDir),
        }
      },
    ))
    summary.builds = buildResults

    let buildContext
    await runPhase('local-servers', async () => {
      servers = await Promise.all(
        buildDefinitions.map(build => startStaticServer(build.outDir)),
      )
      buildContext = Object.fromEntries(
        buildDefinitions.map((build, index) => [
          build.id,
          {
            baseUrl: servers[index].baseUrl,
            id: build.id,
            outDir: build.outDir,
            preset: build.preset,
            source: build.source,
          },
        ]),
      )
      buildEnvironment = {
        QUALITY_BUILD_CONTEXT: JSON.stringify(buildContext),
      }
      return {
        servers: Object.fromEntries(
          Object.entries(buildContext).map(([id, build]) => [id, build.baseUrl]),
        ),
      }
    })

    if (options.updateBaselines || options.updateVisualBaselines) {
      await runPhase('update-visual-baselines', async () => {
        const { browser, context } = await createVisualBrowser()
        try {
          const manifest = await updateVisualBaselines({
            builds: buildContext,
            context,
            rationale: options.rationale,
            reviewer: options.reviewer,
          })
          return {
            path: relativePath(
              resolve(repositoryRoot, 'tests/quality/baselines/visual/manifest.json'),
            ),
            scenarios: manifest.scenarios.length,
          }
        } finally {
          await context.close()
          await browser.close()
        }
      })
    }
    if (options.updateBaselines || options.updatePerformanceBaselines) {
      await runPhase('update-performance-baselines', () => updatePerformanceBaselines({
        buildContext,
        rationale: options.rationale,
        reviewer: options.reviewer,
      }))
    }
    if (options.updateBaselines
      || options.updateVisualBaselines
      || options.updatePerformanceBaselines) {
      return
    }

    await runPhase('self-checks', () => runSelfChecks())
    await runPhase(
      'performance-baseline-contracts',
      () => runCommandPhase(
        'performance-baseline-contracts',
        [
          '--test',
          'tests/quality/performance-baselines.spec.mjs',
        ],
        30_000,
      ),
    )
    await runPhase(
      'configuration',
      () => runCommandPhase(
        'configuration',
        ['tests/quality/configuration.spec.mjs'],
        30_000,
      ),
    )
    await runPhase(
      'css-architecture',
      () => runCommandPhase(
        'css-architecture',
        ['scripts/check-presentation-css.mjs'],
        30_000,
      ),
    )
    await Promise.all([
      runPhase(
        'preset-isolation',
        () => runCommandPhase(
          'preset-isolation',
          ['--test', 'tests/quality/preset-isolation.spec.mjs'],
        ),
      ),
      runPhase(
        'content-contracts',
        () => runCommandPhase(
          'content-contracts',
          ['--test', 'tests/quality/content-contracts.spec.mjs'],
        ),
      ),
      runPhase(
        'accessibility',
        () => runCommandPhase(
          'accessibility',
          ['--test', 'tests/quality/accessibility.spec.mjs'],
        ),
      ),
      runPhase(
        'visual',
        () => runCommandPhase(
          'visual',
          ['--test', 'tests/quality/visual.spec.mjs'],
        ),
      ),
      runPhase(
        'assets',
        () => runCommandPhase(
          'assets',
          ['--test', 'tests/quality/assets.spec.mjs'],
        ),
      ),
    ])
    await runPhase(
      'navigation-performance-affected',
      () => runCommandPhase(
        'navigation-performance-affected',
        ['--test', 'tests/quality/navigation-performance.spec.mjs'],
      ),
    )
    let navigationAfterRecord
    await runPhase(
      'navigation-performance',
      () => measureNavigationAfter({
        buildContext,
        onRecord: (record) => {
          navigationAfterRecord = record
        },
      }),
    )
    let outputAfterRecord
    await runPhase('output-size', async () => {
      const outputPath = resolve(
        qualityArtifactRoot,
        'performance-after.json',
      )
      const result = await runProcess(
        process.execPath,
        [
          'scripts/measure-build-output.mjs',
          '--output',
          outputPath,
          '--deck',
          `example=${buildContext.example.outDir}`,
          '--deck',
          `default-only=${buildContext['default-only'].outDir}`,
          '--deck',
          `protocol=${buildContext.protocol.outDir}`,
        ],
        {
          label: 'output-size',
          logPath: resolve(qualityArtifactRoot, 'logs/output-size.log'),
          timeoutMs: Math.min(30_000, remainingMs()),
        },
      )
      outputAfterRecord = JSON.parse(await readFile(outputPath, 'utf8'))
      validateOutputEvidence(outputAfterRecord, { phase: 'after' })
      return {
        durationMs: result.durationMs,
        evidencePath: relativePath(outputPath),
      }
    })
    await runPhase('durable-performance-after', async () => {
      assert.ok(navigationAfterRecord, 'Navigation after evidence is missing')
      assert.ok(outputAfterRecord, 'Output after evidence is missing')
      const record = {
        schemaVersion: 1,
        phase: 'after',
        recordedAt: now(),
        environment: navigationAfterRecord.environment,
        baselineRecords: {
          navigation: navigationAfterRecord.baselineRecord,
          output: outputAfterRecord.baselineRecord,
        },
        thresholds: {
          affectedNavigationMaximumMs: NAVIGATION_ABSOLUTE_MAXIMUM_MS,
          outputMaximumRatio: 1.05,
          unchangedControlMaximumRatio: NAVIGATION_RELATIVE_RATIO,
        },
        status: navigationAfterRecord.status === 'pass'
          && outputAfterRecord.status === 'pass'
          ? 'pass'
          : 'fail',
        output: outputAfterRecord,
        navigation: navigationAfterRecord,
      }
      await mkdir(dirname(performanceAfterPath), { recursive: true })
      await writeFile(
        performanceAfterPath,
        `${JSON.stringify(record, null, 2)}\n`,
      )
      return {
        path: relativePath(performanceAfterPath),
        scenarios: Object.keys(navigationAfterRecord.scenarios).length,
        status: record.status,
      }
    })
    await runPhase('baseline-integrity', async () => {
      const baselineAfter = await snapshotTree(baselineRoot)
      assert.deepEqual(
        baselineAfter,
        baselineBefore,
        'Normal quality run mutated approved baselines',
      )
      return {
        files: baselineAfter.length,
        status: 'unchanged',
      }
    })
  }

  let exitCode = 0
  try {
    await Promise.race([run(), timeoutPromise])
  } catch (error) {
    exitCode = error.timedOut || error.exitCode === 2 || error.code === 'ENOENT'
      ? 2
      : 1
    summary.failures.push({
      gate: error.qualityPhase ?? activePhase?.id ?? 'harness',
      caseId: error.qualityPhase ?? 'quality-harness',
      status: 'fail',
      expected: 'phase passes',
      actual: error.message,
      artifactPaths: [
        resolve(
          qualityArtifactRoot,
          `logs/${error.qualityPhase ?? 'harness'}.log`,
        ),
      ],
      reason: error.message,
    })
    if (timedOut) summary.timeoutPhase = activePhase?.id ?? null
  } finally {
    clearTimeout(deadlineTimer)
    const cleanupStarted = performance.now()
    let cleanupStatus = 'pass'
    let cleanupReason
    try {
      await terminateActiveProcesses()
      await Promise.allSettled(servers.map(server => server.close()))
      servers = []
    } catch (error) {
      cleanupStatus = 'error'
      cleanupReason = error.message
      if (exitCode === 0) exitCode = 2
    }
    summary.phases.push({
      id: 'cleanup',
      status: cleanupStatus,
      reason: cleanupReason,
      durationMs: Math.round(performance.now() - cleanupStarted),
      finishedAt: now(),
    })
  }

  summary.durationMs = Math.round(performance.now() - startedAt)
  if (summary.durationMs >= deadlineMs && exitCode === 0) exitCode = 2
  summary.exitCode = exitCode
  summary.status = exitCode === 0
    ? 'pass'
    : exitCode === 1
      ? 'fail'
      : timedOut
        ? 'timeout'
        : 'error'
  summary.finishedAt = now()
  summary.slowestPhases = [...summary.phases]
    .sort((left, right) => right.durationMs - left.durationMs)
    .slice(0, 5)
    .map(phase => ({
      durationMs: phase.durationMs,
      id: phase.id,
      status: phase.status,
    }))
  await mkdir(dirname(summaryPath), { recursive: true })
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`)

  console.log(`Quality status: ${summary.status} (${summary.durationMs} ms)`)
  for (const phase of summary.slowestPhases) {
    console.log(`- ${phase.id}: ${phase.durationMs} ms (${phase.status})`)
  }
  console.log(`Summary: ${relativePath(summaryPath)}`)
  return exitCode
}

const main = async () => {
  let options
  try {
    options = parseArguments()
    if (options.selfCheck) {
      await runSelfChecks({ writeSummary: true })
      console.log(`Quality self-checks passed; summary: ${relativePath(summaryPath)}`)
      return 0
    }
    return await executeQuality(options)
  } catch (error) {
    console.error(error.stack ?? error.message)
    return 2
  }
}

process.exitCode = await main()
