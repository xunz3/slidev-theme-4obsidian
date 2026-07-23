import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { promisify } from 'node:util'
import { chromium } from 'playwright-chromium'
import {
  brandAssetDefinitions,
  brandBaselinePath,
  brandVisualBaselineDirectory,
  inspectBrandSource,
  renderBrandReference,
  requiredPairPaths,
  sha256,
  visualReferenceName,
} from '../tests/quality/brand-assets.mjs'
import { repositoryRoot } from '../tests/quality/helpers.mjs'

const execFileAsync = promisify(execFile)

if (!process.argv.includes('--reviewed-update')) {
  console.error('Refusing to update reviewed brand baselines without --reviewed-update')
  process.exitCode = 2
} else {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-font-subpixel-positioning',
      '--disable-lcd-text',
      '--font-render-hinting=none',
    ],
  })
  const page = await browser.newPage({ viewport: { height: 552, width: 980 } })
  const assets = []

  try {
    await mkdir(brandVisualBaselineDirectory, { recursive: true })
    for (const definition of brandAssetDefinitions) {
      const inspected = await inspectBrandSource(definition)
      const rendered = await renderBrandReference(page, definition)
      const filename = visualReferenceName(definition.path)
      const png = Buffer.from(rendered.png.split(',')[1], 'base64')
      await writeFile(resolve(brandVisualBaselineDirectory, filename), png)
      assets.push({
        ...inspected,
        licenseContextId: 'institutional-brand-artwork',
        render: {
          alpha: rendered.alpha,
          intrinsic: rendered.intrinsic,
          referenceSize: definition.referenceSize,
          rgbaSha256: rendered.rgbaSha256,
          visualReference: relative(
            repositoryRoot,
            resolve(brandVisualBaselineDirectory, filename),
          ),
        },
      })
    }
  } finally {
    await page.close()
    await browser.close()
  }

  const lockfile = await readFile(resolve(repositoryRoot, 'pnpm-lock.yaml'))
  const { stdout: commit } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
    cwd: repositoryRoot,
  })
  const pairBytes = Object.fromEntries(
    requiredPairPaths.map(path => [
      path,
      assets.find(asset => asset.path === path)?.rawBytes,
    ]),
  )
  const baseline = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    commit: commit.trim(),
    lockfileSha256: sha256(lockfile),
    svgStructurePolicy: 'UCAS structural fingerprints exclude only the approved generator comment, unused namespace declarations, and color-profile element; raw bytes and SHA-256 retain the complete pre-optimization source.',
    licenseContexts: {
      'institutional-brand-artwork': {
        context: 'Bundled UCAS and ICT institutional identity artwork retained for theme display; no separate per-asset license file is present.',
        repositoryLicense: 'MIT',
        trademarkNotice: 'Repository licensing does not grant rights to the represented institutional names or marks.',
      },
    },
    rendering: {
      engine: 'Chromium via pinned playwright-chromium',
      logicalViewport: { height: 552, width: 980 },
      method: 'Browser Canvas RGBA at the per-asset presentation reference size',
    },
    requiredPair: {
      baselineBytes: Object.values(pairBytes).reduce((total, bytes) => total + bytes, 0),
      expectedOptimizedBytes: 249_795,
      maximumBytes: 424_883,
      paths: requiredPairPaths,
    },
    assetMaximumBytes: 256_000,
    assets,
  }
  await writeFile(brandBaselinePath, `${JSON.stringify(baseline, null, 2)}\n`)
  console.log(`Captured ${assets.length} brand assets in ${relative(repositoryRoot, brandBaselinePath)}`)
}
