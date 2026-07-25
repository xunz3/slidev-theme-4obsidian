import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const baselinePath = resolve(
  repositoryRoot,
  'tests/quality/baselines/output-sizes.json',
)
export const OUTPUT_BUDGET_RATIO = 1.05
export const requiredDeckIds = ['example', 'default-only', 'protocol']
export const logicalBundleNames = ['mainCss', 'mainJs', 'slideFrame']

const sha256 = value => createHash('sha256').update(value).digest('hex')
const resolvePnpmVersion = stdout => (
  stdout.trim()
  || process.env.npm_config_user_agent?.match(/\bpnpm\/([^\s]+)/)?.[1]
  || ''
)

export const maximumBytesFor = baselineBytes => (
  Math.floor(baselineBytes * OUTPUT_BUDGET_RATIO)
)

export const classifyLogicalBundle = (path) => {
  if (/^assets\/index-[^/]+\.css$/.test(path)) return 'mainCss'
  if (/^assets\/index-[^/]+\.js$/.test(path)) return 'mainJs'
  if (/^assets\/SlideFrame-[^/]+\.js$/.test(path)) return 'slideFrame'
  return null
}

export const groupLogicalBundles = (files) => {
  const grouped = Object.fromEntries(
    logicalBundleNames.map(name => [name, { files: [], totalBytes: 0 }]),
  )
  for (const file of [...files].sort((left, right) => (
    left.path.localeCompare(right.path)
  ))) {
    const group = classifyLogicalBundle(file.path)
    if (!group) continue
    grouped[group].files.push({ path: file.path, bytes: file.bytes })
    grouped[group].totalBytes += file.bytes
  }
  return grouped
}

const assertNonEmptyString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} must be a non-empty string`)
  }
}

const assertFiles = (files, field) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error(`${field} must contain at least one regular file`)
  }
  const paths = files.map(file => file?.path)
  const sortedPaths = [...paths].sort((left, right) => left.localeCompare(right))
  if (JSON.stringify(paths) !== JSON.stringify(sortedPaths)) {
    throw new Error(`${field} must be sorted by path`)
  }
  for (const [index, file] of files.entries()) {
    assertNonEmptyString(file?.path, `${field}[${index}].path`)
    if (!Number.isSafeInteger(file?.bytes) || file.bytes < 0) {
      throw new Error(`${field}[${index}].bytes must be a non-negative integer`)
    }
  }
}

const validateMeasuredRecord = (record, field, { phase }) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error(`${field} must be an object`)
  }
  assertFiles(record.files, `${field}.files`)
  const measuredTotal = record.files.reduce((sum, file) => sum + file.bytes, 0)
  if (record.totalBytes !== measuredTotal) {
    throw new Error(
      `${field}.totalBytes ${record.totalBytes} does not equal file sum ${measuredTotal}`,
    )
  }
  if (!Number.isSafeInteger(record.baselineBytes) || record.baselineBytes < 0) {
    throw new Error(`${field}.baselineBytes must be a non-negative integer`)
  }
  const expectedMaximum = maximumBytesFor(record.baselineBytes)
  if (record.maximumBytes !== expectedMaximum) {
    throw new Error(
      `${field}.maximumBytes ${record.maximumBytes} does not equal floor(${record.baselineBytes} × ${OUTPUT_BUDGET_RATIO}) = ${expectedMaximum}`,
    )
  }
  if (phase === 'before' && record.baselineBytes !== record.totalBytes) {
    throw new Error(`${field}.baselineBytes must equal totalBytes for before evidence`)
  }
  if (phase === 'after') {
    const expectedStatus = record.totalBytes <= record.maximumBytes ? 'pass' : 'fail'
    if (record.status !== expectedStatus) {
      throw new Error(`${field}.status must be ${expectedStatus}`)
    }
  }

  const grouped = groupLogicalBundles(record.files)
  if (!record.logicalBundles || typeof record.logicalBundles !== 'object') {
    throw new Error(`${field}.logicalBundles is required`)
  }
  for (const name of logicalBundleNames) {
    const bundle = record.logicalBundles[name]
    if (!bundle || typeof bundle !== 'object') {
      throw new Error(`${field}.logicalBundles.${name} is required`)
    }
    const actual = grouped[name]
    if (JSON.stringify(bundle.files) !== JSON.stringify(actual.files)) {
      throw new Error(`${field}.logicalBundles.${name}.files does not match classification`)
    }
    if (bundle.totalBytes !== actual.totalBytes) {
      throw new Error(`${field}.logicalBundles.${name}.totalBytes is inconsistent`)
    }
    if (phase === 'before' && bundle.baselineBytes !== bundle.totalBytes) {
      throw new Error(
        `${field}.logicalBundles.${name}.baselineBytes must equal totalBytes`,
      )
    }
    if (!Number.isSafeInteger(bundle.baselineBytes) || bundle.baselineBytes < 0) {
      throw new Error(
        `${field}.logicalBundles.${name}.baselineBytes must be a non-negative integer`,
      )
    }
    const bundleMaximum = maximumBytesFor(bundle.baselineBytes)
    if (bundle.maximumBytes !== bundleMaximum) {
      throw new Error(
        `${field}.logicalBundles.${name}.maximumBytes must equal ${bundleMaximum}`,
      )
    }
    if (phase === 'after') {
      const bundleStatus = bundle.totalBytes <= bundle.maximumBytes ? 'pass' : 'fail'
      if (bundle.status !== bundleStatus) {
        throw new Error(
          `${field}.logicalBundles.${name}.status must be ${bundleStatus}`,
        )
      }
    }
  }
}

export const validateOutputEvidence = (
  evidence,
  { phase, requireReview = false } = {},
) => {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    throw new Error('Output evidence must be an object')
  }
  if (evidence.schemaVersion !== 2) {
    throw new Error('Output evidence schemaVersion must be 2')
  }
  if (!['before', 'after'].includes(evidence.phase)) {
    throw new Error('Output evidence phase must be before or after')
  }
  if (phase && evidence.phase !== phase) {
    throw new Error(`Output evidence phase must be ${phase}`)
  }
  for (const field of [
    'recordedAt',
    'gitCommit',
    'nodeVersion',
    'pnpmVersion',
    'lockfileSha256',
  ]) {
    assertNonEmptyString(evidence[field], field)
  }
  if (requireReview || evidence.phase === 'before') {
    assertNonEmptyString(evidence.review?.reviewer, 'review.reviewer')
    assertNonEmptyString(evidence.review?.rationale, 'review.rationale')
  }
  if (!evidence.decks || typeof evidence.decks !== 'object') {
    throw new Error('Output evidence decks are required')
  }
  const actualDeckIds = Object.keys(evidence.decks).sort()
  const expectedDeckIds = [...requiredDeckIds].sort()
  if (JSON.stringify(actualDeckIds) !== JSON.stringify(expectedDeckIds)) {
    throw new Error(`Output evidence requires decks: ${requiredDeckIds.join(', ')}`)
  }
  for (const deckId of requiredDeckIds) {
    const deck = evidence.decks[deckId]
    assertNonEmptyString(deck?.source, `decks.${deckId}.source`)
    validateMeasuredRecord(deck, `decks.${deckId}`, {
      phase: evidence.phase,
    })
  }
  if (evidence.phase === 'after') {
    assertNonEmptyString(evidence.baselineRecord, 'baselineRecord')
    const expectedStatus = Object.values(evidence.decks).every(deck => (
      deck.status === 'pass'
      && logicalBundleNames.every(name => (
        deck.logicalBundles[name].status === 'pass'
      ))
    ))
      ? 'pass'
      : 'fail'
    if (evidence.status !== expectedStatus) {
      throw new Error(`Output evidence status must be ${expectedStatus}`)
    }
  }
  return evidence
}

const visitRegularFiles = async (root, directory = root, files = []) => {
  const entries = await readdir(directory, { withFileTypes: true })
  entries.sort((left, right) => left.name.localeCompare(right.name))

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(
        `${relative(root, absolutePath)}: symbolic links are not valid build-output evidence`,
      )
    }
    if (entry.isDirectory()) {
      await visitRegularFiles(root, absolutePath, files)
      continue
    }
    if (!entry.isFile()) {
      throw new Error(
        `${relative(root, absolutePath)}: only regular files and directories are allowed`,
      )
    }
    const metadata = await stat(absolutePath)
    files.push({
      path: relative(root, absolutePath).split('\\').join('/'),
      bytes: metadata.size,
    })
  }
  return files
}

export const measureOutputDirectory = async (directory) => {
  const absoluteDirectory = resolve(repositoryRoot, directory)
  const metadata = await stat(absoluteDirectory).catch(() => null)
  if (!metadata?.isDirectory()) {
    throw new Error(`${directory}: build output directory does not exist`)
  }

  const files = await visitRegularFiles(absoluteDirectory)
  files.sort((left, right) => left.path.localeCompare(right.path))
  if (files.length === 0) {
    throw new Error(`${directory}: build output directory is empty`)
  }
  return {
    files,
    logicalBundles: groupLogicalBundles(files),
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
  }
}

const parseArguments = (arguments_) => {
  const result = { decks: new Map(), output: null }
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (argument === '--output') {
      result.output = arguments_[index + 1]
      index += 1
      continue
    }
    if (argument === '--deck') {
      const value = arguments_[index + 1] ?? ''
      const separator = value.indexOf('=')
      if (separator <= 0 || separator === value.length - 1) {
        throw new Error('--deck must use <deck-id>=<output-directory>')
      }
      const deckId = value.slice(0, separator)
      const directory = value.slice(separator + 1)
      if (result.decks.has(deckId)) {
        throw new Error(`${deckId}: duplicate --deck argument`)
      }
      result.decks.set(deckId, directory)
      index += 1
      continue
    }
    throw new Error(`Unsupported argument: ${argument}`)
  }

  if (!result.output) {
    throw new Error('--output <evidence-path> is required')
  }
  const actualDeckIds = [...result.decks.keys()].sort()
  const expectedDeckIds = [...requiredDeckIds].sort()
  if (JSON.stringify(actualDeckIds) !== JSON.stringify(expectedDeckIds)) {
    throw new Error(
      `Exactly these --deck IDs are required: ${requiredDeckIds.join(', ')}`,
    )
  }
  return result
}

const run = async () => {
  const options = parseArguments(process.argv.slice(2))
  const baseline = JSON.parse(await readFile(baselinePath, 'utf8'))
  validateOutputEvidence(baseline, { phase: 'before', requireReview: true })
  const lockfile = await readFile(resolve(repositoryRoot, 'pnpm-lock.yaml'))
  const [
    { stdout: commit },
    { stdout: pnpmVersion },
    { stdout: status },
  ] = await Promise.all([
    execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot }),
    execFileAsync('pnpm', ['--version'], { cwd: repositoryRoot }),
    execFileAsync('git', ['status', '--porcelain'], { cwd: repositoryRoot }),
  ])
  const decks = {}

  for (const deckId of requiredDeckIds) {
    const recorded = baseline.decks[deckId]
    if (!recorded) {
      throw new Error(`${deckId}: approved output-size baseline is missing`)
    }
    const computedMaximum = maximumBytesFor(recorded.baselineBytes)
    if (recorded.maximumBytes !== computedMaximum) {
      throw new Error(
        `${deckId}: approved ceiling ${recorded.maximumBytes} does not equal floor(${recorded.baselineBytes} × 1.05) = ${computedMaximum}`,
      )
    }
    const directory = options.decks.get(deckId)
    const measured = await measureOutputDirectory(directory)
    const logicalBundles = Object.fromEntries(
      logicalBundleNames.map((name) => {
        const current = measured.logicalBundles[name]
        const approved = recorded.logicalBundles[name]
        return [name, {
          ...current,
          baselineBytes: approved.baselineBytes,
          maximumBytes: approved.maximumBytes,
          status: current.totalBytes <= approved.maximumBytes ? 'pass' : 'fail',
        }]
      }),
    )
    decks[deckId] = {
      source: recorded.source,
      outputDirectory: relative(
        repositoryRoot,
        resolve(repositoryRoot, directory),
      ).split('\\').join('/'),
      baselineBytes: recorded.baselineBytes,
      maximumBytes: recorded.maximumBytes,
      totalBytes: measured.totalBytes,
      status: measured.totalBytes <= recorded.maximumBytes ? 'pass' : 'fail',
      files: measured.files,
      logicalBundles,
    }
  }

  const evidence = {
    schemaVersion: 2,
    phase: 'after',
    recordedAt: new Date().toISOString(),
    gitCommit: commit.trim(),
    workingTreeDirty: status.trim().length > 0,
    nodeVersion: process.version,
    pnpmVersion: resolvePnpmVersion(pnpmVersion),
    lockfileSha256: sha256(lockfile),
    baselineRecord: relative(repositoryRoot, baselinePath),
    status: Object.values(decks).every(deck => (
      deck.status === 'pass'
      && logicalBundleNames.every(name => (
        deck.logicalBundles[name].status === 'pass'
      ))
    ))
      ? 'pass'
      : 'fail',
    decks,
  }
  validateOutputEvidence(evidence, { phase: 'after' })
  const outputPath = resolve(repositoryRoot, options.output)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`)

  for (const [deckId, deck] of Object.entries(decks)) {
    console.log(
      `${deckId}: ${deck.totalBytes} B / ${deck.maximumBytes} B (${deck.status})`,
    )
  }
  console.log(`Wrote ${relative(repositoryRoot, outputPath)}`)
  if (evidence.status !== 'pass') process.exitCode = 1
}

const isMain = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  run().catch((error) => {
    console.error(error.message)
    process.exitCode = 2
  })
}
