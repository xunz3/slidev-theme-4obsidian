import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { promisify } from 'node:util'
import test from 'node:test'
import { chromium } from 'playwright-chromium'
import {
  brandAssetDefinitions,
  brandBaselinePath,
  discoverThemeOwnedAssets,
  findOversizedThemeAssets,
  inspectBrandSource,
  renderBrandReference,
  requiredPairPaths,
  sha256,
  themeOwnedAssetPolicy,
  ucasSvgPaths,
  visualReferenceName,
} from './brand-assets.mjs'
import { repositoryRoot } from './helpers.mjs'

const execFileAsync = promisify(execFile)
const baseline = JSON.parse(await readFile(brandBaselinePath, 'utf8'))
const baselineByPath = new Map(baseline.assets.map(asset => [asset.path, asset]))

const listFiles = async (directory) => {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  })
  return entries
    .filter(entry => entry.isFile())
    .map(entry => relative(
      repositoryRoot,
      resolve(entry.parentPath, entry.name),
    ))
    .sort()
}

const assetDataUrl = async (path) => {
  const buffer = await readFile(resolve(repositoryRoot, path))
  const format = extname(path).slice(1).toLowerCase()
  const mediaType = format === 'svg' ? 'image/svg+xml' : 'image/png'
  return `data:${mediaType};base64,${buffer.toString('base64')}`
}

test('recursive shipped-asset policy covers unlisted files under assets and public', async () => {
  assert.equal(themeOwnedAssetPolicy.maximumBytes, 256_000)
  assert.deepEqual(themeOwnedAssetPolicy.roots, ['assets', 'public'])

  const discovered = await discoverThemeOwnedAssets()
  const paths = discovered.map(asset => asset.path)
  for (const definition of brandAssetDefinitions) {
    assert.ok(paths.includes(definition.path), `${definition.path}: recursively discovered`)
  }
  assert.ok(paths.includes('public/obsidian-card.svg'))
  assert.deepEqual(findOversizedThemeAssets(discovered), [])

  assert.deepEqual(findOversizedThemeAssets([
    { bytes: 256_000, path: 'assets/reviewed.bin' },
    { bytes: 256_001, path: 'assets/unlisted.bin' },
  ]), [{
    bytes: 256_001,
    maximumBytes: 256_000,
    path: 'assets/unlisted.bin',
  }])

  for (const exception of themeOwnedAssetPolicy.reviewedExceptions) {
    assert.ok(exception.path)
    assert.ok(Number.isSafeInteger(exception.bytes))
    assert.ok(exception.reviewer)
    assert.ok(exception.rationale)
    assert.ok(exception.mitigation)
    assert.ok(exception.followUp)
  }
})

test('reviewed manifest covers every shipped brand asset and its provenance', async () => {
  const shipped = [
    ...await listFiles(resolve(repositoryRoot, 'assets/ICT')),
    ...await listFiles(resolve(repositoryRoot, 'assets/UCAS')),
  ].sort()
  const recorded = baseline.assets.map(asset => asset.path).sort()

  assert.deepEqual(recorded, shipped)
  assert.deepEqual(
    brandAssetDefinitions.map(asset => asset.path).sort(),
    shipped,
  )
  assert.equal(baseline.commit.length, 40)
  assert.equal(baseline.lockfileSha256.length, 64)
  assert.ok(Object.keys(baseline.licenseContexts).length > 0)

  for (const asset of baseline.assets) {
    assert.ok(asset.displayRoles.length > 0, `${asset.path}: display role`)
    assert.ok(
      baseline.licenseContexts[asset.licenseContextId],
      `${asset.path}: license context`,
    )
    assert.equal(asset.render.rgbaSha256.length, 64)
    assert.equal(asset.render.alpha.sha256.length, 64)
    const reference = resolve(
      repositoryRoot,
      asset.render.visualReference,
    )
    assert.equal(
      visualReferenceName(asset.path),
      reference.split('/').at(-1),
    )
    assert.ok((await readFile(reference)).length > 0)
  }
})

test('all assets meet byte budgets and UCAS metadata is fully removed', async () => {
  const inspected = await Promise.all(
    brandAssetDefinitions.map(inspectBrandSource),
  )
  const violations = []

  for (const asset of inspected) {
    if (asset.rawBytes > baseline.assetMaximumBytes) {
      violations.push(
        `${asset.path}: ${asset.rawBytes} B exceeds ${baseline.assetMaximumBytes} B`,
      )
    }
  }

  const pairBytes = requiredPairPaths.reduce(
    (total, path) => total + inspected.find(asset => asset.path === path).rawBytes,
    0,
  )
  if (pairBytes > baseline.requiredPair.maximumBytes) {
    violations.push(
      `required pair: ${pairBytes} B exceeds ${baseline.requiredPair.maximumBytes} B`,
    )
  }
  if (pairBytes !== baseline.requiredPair.expectedOptimizedBytes) {
    violations.push(
      `required pair: expected ${baseline.requiredPair.expectedOptimizedBytes} B, got ${pairBytes} B`,
    )
  }

  const expectedExactBytes = new Map([
    ['assets/UCAS/emblem.svg', 70_710],
    ['assets/UCAS/emblem-name-bilingual-hz.svg', 179_085],
  ])
  for (const [path, expected] of expectedExactBytes) {
    const actual = inspected.find(asset => asset.path === path).rawBytes
    if (actual !== expected) {
      violations.push(`${path}: expected ${expected} B, got ${actual} B`)
    }
  }

  for (const path of ucasSvgPaths) {
    const source = await readFile(resolve(repositoryRoot, path), 'utf8')
    for (const forbidden of [
      'data:application/vnd.iccprofile',
      '<color-profile',
      'xmlns:xlink=',
      'xmlns:svg=',
      'Created with Inkscape',
    ]) {
      if (source.includes(forbidden)) {
        violations.push(`${path}: contains forbidden metadata ${forbidden}`)
      }
    }
  }

  assert.deepEqual(violations, [])
})

test('source structure, dimensions, transparency, and normalized bytes match the reviewed source', async () => {
  for (const definition of brandAssetDefinitions) {
    const actual = await inspectBrandSource(definition)
    const expected = baselineByPath.get(definition.path)

    assert.equal(actual.format, expected.format, `${definition.path}: format`)
    if (actual.format === 'svg') {
      assert.deepEqual(
        actual.source.dimensions,
        expected.source.dimensions,
        `${definition.path}: dimensions`,
      )
      assert.deepEqual(
        actual.source.elementCounts,
        expected.source.elementCounts,
        `${definition.path}: elements`,
      )
      for (const key of ['fills', 'ids', 'pathData', 'transforms']) {
        assert.deepEqual(
          actual.source[key],
          expected.source[key],
          `${definition.path}: ${key}`,
        )
      }
      assert.equal(
        actual.source.normalizedSha256,
        expected.source.normalizedSha256,
        `${definition.path}: normalized source`,
      )
      assert.equal(
        actual.source.normalizedBytes,
        expected.source.normalizedBytes,
        `${definition.path}: normalized bytes`,
      )
      assert.equal(
        actual.source.elementCounts.image,
        0,
        `${definition.path}: embedded raster`,
      )
      if (ucasSvgPaths.includes(definition.path)) {
        assert.equal(
          actual.rawSha256,
          expected.source.normalizedSha256,
          `${definition.path}: committed source is not the approved cleanup`,
        )
      } else {
        assert.equal(
          actual.rawSha256,
          expected.rawSha256,
          `${definition.path}: source bytes`,
        )
      }
    } else {
      assert.deepEqual(
        actual.source,
        expected.source,
        `${definition.path}: PNG structure`,
      )
      assert.equal(
        actual.rawSha256,
        expected.rawSha256,
        `${definition.path}: PNG bytes`,
      )
    }
  }
})

test('theme-owned image elements reserve their intrinsic geometry', async () => {
  const componentPath = resolve(repositoryRoot, 'internals/PresetBranding.vue')
  const component = await readFile(componentPath, 'utf8')
  const imports = new Map(
    [...component.matchAll(
      /import\s+(\w+)\s+from\s+['"]\.\.\/(assets\/[^'"]+)['"]/g,
    )].map(([, identifier, path]) => [identifier, path]),
  )
  const imageTags = [...component.matchAll(/<img\b[\s\S]*?\/>/g)]

  assert.ok(imageTags.length > 0)
  for (const [index, match] of imageTags.entries()) {
    const tag = match[0]
    const width = Number(tag.match(/\bwidth="(\d+)"/)?.[1])
    const height = Number(tag.match(/\bheight="(\d+)"/)?.[1])
    const expression = tag.match(/:src="([^"]+)"/)?.[1] ?? ''
    const referencedAssets = [...imports]
      .filter(([identifier]) => new RegExp(`\\b${identifier}\\b`).test(expression))
      .map(([, path]) => path)

    assert.ok(Number.isFinite(width) && width > 0, `image ${index}: width`)
    assert.ok(Number.isFinite(height) && height > 0, `image ${index}: height`)
    assert.match(tag, /\balt="[^"]*"/, `image ${index}: alt text`)
    assert.match(tag, /\bdecoding="(?:async|sync)"/, `image ${index}: decoding`)
    assert.ok(referencedAssets.length > 0, `image ${index}: imported source`)

    for (const path of referencedAssets) {
      const intrinsic = baselineByPath.get(path).render.intrinsic
      assert.deepEqual(
        { height, width },
        intrinsic,
        `image ${index}: ${path} intrinsic dimensions`,
      )
    }
  }
})

test('browser decoding preserves approved pixels, alpha, and reserved geometry', async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-font-subpixel-positioning',
      '--disable-lcd-text',
      '--font-render-hinting=none',
    ],
  })
  const page = await browser.newPage({
    viewport: baseline.rendering.logicalViewport,
  })

  try {
    for (const definition of brandAssetDefinitions) {
      const expected = baselineByPath.get(definition.path)
      const actual = await renderBrandReference(page, definition)
      assert.deepEqual(
        actual.intrinsic,
        expected.render.intrinsic,
        `${definition.path}: intrinsic size`,
      )
      assert.deepEqual(
        actual.alpha,
        expected.render.alpha,
        `${definition.path}: alpha`,
      )
      assert.equal(
        actual.rgbaSha256,
        expected.render.rgbaSha256,
        `${definition.path}: RGBA`,
      )

      const source = await assetDataUrl(definition.path)
      const geometry = await page.evaluate(async ({
        height,
        src,
        width,
      }) => {
        document.body.replaceChildren()
        const image = document.createElement('img')
        image.alt = ''
        image.decoding = 'sync'
        image.height = height
        image.width = width
        document.body.append(image)
        const before = image.getBoundingClientRect()
        image.src = src
        await image.decode()
        await new Promise(resolveAnimationFrame => (
          requestAnimationFrame(() => requestAnimationFrame(resolveAnimationFrame))
        ))
        const after = image.getBoundingClientRect()
        return {
          after: { height: after.height, width: after.width },
          before: { height: before.height, width: before.width },
          complete: image.complete,
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
        }
      }, {
        ...definition.referenceSize,
        src: source,
      })

      assert.equal(geometry.complete, true, `${definition.path}: decoded`)
      assert.ok(geometry.naturalWidth > 0, `${definition.path}: natural width`)
      assert.ok(geometry.naturalHeight > 0, `${definition.path}: natural height`)
      assert.deepEqual(
        geometry.after,
        geometry.before,
        `${definition.path}: post-decode geometry`,
      )
    }
  } finally {
    await page.close()
    await browser.close()
  }
})

test('the optimizer is clean, deterministic, and idempotent', async () => {
  const optimizerUrl = new URL('../../scripts/optimize-brand-assets.mjs', import.meta.url)
  const { optimizeUcasSvgSource } = await import(optimizerUrl)

  for (const path of ucasSvgPaths) {
    const source = await readFile(resolve(repositoryRoot, path), 'utf8')
    const once = optimizeUcasSvgSource(path, source, baselineByPath.get(path))
    const twice = optimizeUcasSvgSource(path, once, baselineByPath.get(path))
    assert.equal(once, source, `${path}: optimizer should be a no-op`)
    assert.equal(twice, once, `${path}: second optimization changed bytes`)
  }

  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    ['scripts/optimize-brand-assets.mjs', '--check'],
    { cwd: repositoryRoot },
  )
  assert.equal(stderr, '')
  assert.match(stdout, /6 UCAS SVGs are already optimized/)
})
