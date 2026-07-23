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
const requiredDeckIds = ['example', 'default-only', 'protocol']

const sha256 = value => createHash('sha256').update(value).digest('hex')

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
    const computedMaximum = Math.floor(recorded.baselineBytes * 1.05)
    if (recorded.maximumBytes !== computedMaximum) {
      throw new Error(
        `${deckId}: approved ceiling ${recorded.maximumBytes} does not equal floor(${recorded.baselineBytes} × 1.05) = ${computedMaximum}`,
      )
    }
    const directory = options.decks.get(deckId)
    const measured = await measureOutputDirectory(directory)
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
    }
  }

  const evidence = {
    schemaVersion: 1,
    phase: 'after',
    measuredAt: new Date().toISOString(),
    gitCommit: commit.trim(),
    workingTreeDirty: status.trim().length > 0,
    nodeVersion: process.version,
    pnpmVersion: pnpmVersion.trim(),
    lockfileSha256: sha256(lockfile),
    baselineRecord: relative(repositoryRoot, baselinePath),
    status: Object.values(decks).every(deck => deck.status === 'pass')
      ? 'pass'
      : 'fail',
    decks,
  }
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
