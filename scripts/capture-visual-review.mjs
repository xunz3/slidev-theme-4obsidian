import { createHash } from 'node:crypto'
import { access, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  qualityArtifactRoot,
  resetArtifactDirectory,
  startStaticServer,
} from '../tests/quality/helpers.mjs'
import {
  captureVisualScenario,
  createVisualBrowser,
} from '../tests/quality/visual-baselines.mjs'

const presets = ['default', 'ucas', 'ict']
const modes = ['light', 'dark']
const layouts = {
  default: { caseId: 'invalid-inputs', slide: 6 },
  cover: { caseId: 'layout-cover', slide: 8 },
  intro: { caseId: 'layout-intro', slide: 9 },
  section: { caseId: 'layout-section', slide: 10 },
  toc: { caseId: 'layout-toc', slide: 11 },
  center: { caseId: 'layout-center', slide: 12 },
  'two-cols': { caseId: 'layout-two-cols', slide: 13 },
  statement: { caseId: 'layout-statement', slide: 14 },
  quote: { caseId: 'layout-quote', slide: 15 },
  figure: { caseId: 'layout-figure', slide: 16 },
  references: { caseId: 'layout-references', slide: 17 },
}
const sha256 = value => createHash('sha256').update(value).digest('hex')
const evidenceDirectory = await resetArtifactDirectory(
  resolve(qualityArtifactRoot, 'screenshots/visual-review'),
)
const buildDefinitions = presets.map(preset => ({
  id: `matrix-${preset}`,
  outDir: resolve(qualityArtifactRoot, `build/matrix/${preset}`),
  preset,
}))
await Promise.all(
  buildDefinitions.map(build => access(resolve(build.outDir, 'index.html'))),
)
const servers = await Promise.all(
  buildDefinitions.map(build => startStaticServer(build.outDir)),
)
const builds = Object.fromEntries(buildDefinitions.map((build, index) => [
  build.preset,
  { ...build, baseUrl: servers[index].baseUrl },
]))
const { browser, context } = await createVisualBrowser()
const captures = []

try {
  for (const preset of presets) {
    for (const mode of modes) {
      for (const [layout, definition] of Object.entries(layouts)) {
        const id = `${preset}-${mode}-${layout}`
        const scenario = {
          ...definition,
          id,
          mode,
          preset,
        }
        const page = await context.newPage()
        try {
          const captured = await captureVisualScenario(
            page,
            builds[preset],
            scenario,
          )
          const path = resolve(evidenceDirectory, `${id}.png`)
          await writeFile(path, captured.screenshot)
          captures.push({
            bytes: captured.screenshot.length,
            id,
            layout,
            mode,
            path,
            preset,
            sha256: sha256(captured.screenshot),
            state: captured.state,
          })
        } finally {
          await page.close()
        }
      }
    }
  }

  const sheetContext = await browser.newContext({
    deviceScaleFactor: 1,
    viewport: { height: 1200, width: 1580 },
  })
  try {
    for (const preset of presets) {
      for (const mode of modes) {
        const group = captures.filter(
          capture => capture.preset === preset && capture.mode === mode,
        )
        const cards = await Promise.all(group.map(async (capture) => {
          const bytes = await readFile(capture.path)
          return `
            <figure>
              <figcaption>${capture.layout}</figcaption>
              <img src="data:image/png;base64,${bytes.toString('base64')}" alt="${capture.layout}">
            </figure>
          `
        }))
        const page = await sheetContext.newPage()
        try {
          await page.setContent(`
            <!doctype html>
            <meta charset="utf-8">
            <title>${preset} ${mode} visual review</title>
            <style>
              * { box-sizing: border-box; }
              body {
                margin: 0;
                padding: 24px;
                background: #15171b;
                color: #f4f5f7;
                font: 600 18px/1.3 system-ui, sans-serif;
              }
              h1 { margin: 0 0 20px; font-size: 28px; }
              main {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 18px;
              }
              figure {
                margin: 0;
                overflow: hidden;
                border: 1px solid #424751;
                border-radius: 10px;
                background: #242830;
              }
              figcaption {
                padding: 7px 10px;
                text-transform: uppercase;
                letter-spacing: .06em;
              }
              img {
                display: block;
                width: 100%;
                height: auto;
                background: white;
              }
            </style>
            <h1>${preset.toUpperCase()} · ${mode} · 11 layouts</h1>
            <main>${cards.join('')}</main>
          `, { waitUntil: 'load' })
          await page.screenshot({
            fullPage: true,
            path: resolve(evidenceDirectory, `contact-${preset}-${mode}.png`),
            type: 'png',
          })
        } finally {
          await page.close()
        }
      }
    }
  } finally {
    await sheetContext.close()
  }
} finally {
  await context.close()
  await browser.close()
  await Promise.all(servers.map(server => server.close()))
}

await writeFile(
  resolve(evidenceDirectory, 'manifest.json'),
  `${JSON.stringify({
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    viewport: {
      deviceScaleFactor: 2,
      height: 552,
      width: 980,
    },
    cases: captures.map(capture => ({
      ...capture,
      path: capture.path.replace(`${process.cwd()}/`, ''),
    })),
  }, null, 2)}\n`,
)
console.log(
  `Captured ${captures.length} slide reviews and 6 contact sheets in ${evidenceDirectory}`,
)
