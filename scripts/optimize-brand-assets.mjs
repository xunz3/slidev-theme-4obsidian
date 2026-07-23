import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')
const baselinePath = resolve(
  repositoryRoot,
  'tests/quality/baselines/brand-assets.json',
)

export const ucasSvgPaths = [
  'assets/UCAS/emblem.svg',
  'assets/UCAS/emblem-name-bilingual-hz.svg',
  'assets/UCAS/emblem-name-bilingual-stacked.svg',
  'assets/UCAS/emblem-name-bilingual-hz-kaiti.svg',
  'assets/UCAS/emblem-name-bilingual-vt.svg',
  'assets/UCAS/emblem-name-bilingual-vt-kaiti.svg',
]

const generatorComment = (
  '<!-- Created with Inkscape (http://www.inkscape.org/) -->\n\n'
)
const xlinkNamespace = '\n   xmlns:xlink="http://www.w3.org/1999/xlink"'
const svgNamespace = '\n   xmlns:svg="http://www.w3.org/2000/svg"'
const colorProfileExpression = /\s*<color-profile\b[\s\S]*?\/>/

const sha256 = value => createHash('sha256').update(value).digest('hex')
const occurrences = (source, expression) => (
  [...source.matchAll(expression)].length
)

export const stripAllowlistedUcasMetadata = source => (
  source
    .replace(generatorComment, '')
    .replace(xlinkNamespace, '')
    .replace(svgNamespace, '')
    .replace(colorProfileExpression, '')
)

const assertCanonicalOutput = (path, source, baselineAsset) => {
  const violations = []
  const expectedBytes = baselineAsset.source.normalizedBytes
  const expectedSha = baselineAsset.source.normalizedSha256
  const actualBytes = Buffer.byteLength(source)
  const actualSha = sha256(source)

  if (actualBytes !== expectedBytes) {
    violations.push(`expected ${expectedBytes} B, produced ${actualBytes} B`)
  }
  if (actualSha !== expectedSha) {
    violations.push(`expected SHA-256 ${expectedSha}, produced ${actualSha}`)
  }
  for (const forbidden of [
    'data:application/vnd.iccprofile',
    '<color-profile',
    'xmlns:xlink=',
    'xmlns:svg=',
    'Created with Inkscape',
  ]) {
    if (source.includes(forbidden)) {
      violations.push(`output still contains ${forbidden}`)
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `${path}: allowlisted cleanup did not reproduce the reviewed output:\n- ${violations.join('\n- ')}`,
    )
  }
}

const assertRecordedSourcePreconditions = (path, source) => {
  const checks = [
    {
      actual: occurrences(
        source,
        /<!-- Created with Inkscape \(http:\/\/www\.inkscape\.org\/\) -->\n\n/g,
      ),
      expected: 1,
      label: 'exact Inkscape generator comment',
    },
    {
      actual: occurrences(
        source,
        /\n   xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g,
      ),
      expected: 1,
      label: 'unused xmlns:xlink declaration',
    },
    {
      actual: occurrences(
        source,
        /\n   xmlns:svg="http:\/\/www\.w3\.org\/2000\/svg"/g,
      ),
      expected: 1,
      label: 'unused xmlns:svg declaration',
    },
    {
      actual: occurrences(source, /<color-profile\b/g),
      expected: 1,
      label: 'color-profile element',
    },
    {
      actual: occurrences(source, /\s*<color-profile\b[\s\S]*?\/>/g),
      expected: 1,
      label: 'self-closing color-profile payload',
    },
    {
      actual: occurrences(
        source,
        /data:application\/vnd\.iccprofile/g,
      ),
      expected: 1,
      label: 'embedded ICC data URI',
    },
  ]
  const violations = checks
    .filter(check => check.actual !== check.expected)
    .map(check => (
      `${check.label}: expected ${check.expected}, found ${check.actual}`
    ))

  if (violations.length > 0) {
    throw new Error(
      `${path}: source metadata does not match the reviewed cleanup preconditions:\n- ${violations.join('\n- ')}`,
    )
  }
}

export const optimizeUcasSvgSource = (path, source, baselineAsset) => {
  if (!ucasSvgPaths.includes(path)) {
    throw new Error(`${path}: not one of the six approved UCAS SVG targets`)
  }
  if (!baselineAsset || baselineAsset.path !== path) {
    throw new Error(`${path}: reviewed baseline entry is missing or mismatched`)
  }
  if (baselineAsset.format !== 'svg') {
    throw new Error(`${path}: reviewed baseline format is not SVG`)
  }

  const actualSha = sha256(source)
  const optimizedSha = baselineAsset.source.normalizedSha256
  if (actualSha === optimizedSha) {
    assertCanonicalOutput(path, source, baselineAsset)
    return source
  }
  if (actualSha !== baselineAsset.rawSha256) {
    throw new Error(
      `${path}: SHA-256 ${actualSha} is neither the reviewed source (${baselineAsset.rawSha256}) nor approved optimized output (${optimizedSha}); refusing to rewrite unreviewed bytes`,
    )
  }

  assertRecordedSourcePreconditions(path, source)
  const optimized = stripAllowlistedUcasMetadata(source)
  assertCanonicalOutput(path, optimized, baselineAsset)
  return optimized
}

const run = async () => {
  const unsupported = process.argv.slice(2).filter(argument => argument !== '--check')
  if (unsupported.length > 0) {
    throw new Error(
      `Unsupported argument${unsupported.length === 1 ? '' : 's'}: ${unsupported.join(', ')}`,
    )
  }
  const checkOnly = process.argv.includes('--check')
  const baseline = JSON.parse(await readFile(baselinePath, 'utf8'))
  const baselineByPath = new Map(
    baseline.assets.map(asset => [asset.path, asset]),
  )
  const outputs = []

  for (const path of ucasSvgPaths) {
    const absolutePath = resolve(repositoryRoot, path)
    const source = await readFile(absolutePath, 'utf8')
    const optimized = optimizeUcasSvgSource(
      path,
      source,
      baselineByPath.get(path),
    )
    outputs.push({ absolutePath, optimized, path, source })
  }

  const changed = outputs.filter(output => output.optimized !== output.source)
  if (checkOnly && changed.length > 0) {
    throw new Error(
      `${changed.length} UCAS SVG${changed.length === 1 ? '' : 's'} require approved metadata cleanup:\n- ${changed.map(output => output.path).join('\n- ')}\nRun pnpm run assets:optimize and review the resulting asset checks.`,
    )
  }

  for (const output of changed) {
    await writeFile(output.absolutePath, output.optimized)
  }

  if (changed.length === 0) {
    console.log(`${outputs.length} UCAS SVGs are already optimized`)
    return
  }

  const beforeBytes = changed.reduce(
    (total, output) => total + Buffer.byteLength(output.source),
    0,
  )
  const afterBytes = changed.reduce(
    (total, output) => total + Buffer.byteLength(output.optimized),
    0,
  )
  console.log(
    `Optimized ${changed.length} UCAS SVGs: ${beforeBytes} B → ${afterBytes} B`,
  )
}

const isMain = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  run().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
