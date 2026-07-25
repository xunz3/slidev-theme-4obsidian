import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import axe from 'axe-core'
import { chromium } from 'playwright-chromium'
import {
  buildDeck,
  generateExpandedContentBuilds,
  generatePresetMatrixBuilds,
  qualityArtifactRoot,
  readQualityBuildContext,
  startStaticServer,
  waitForSlide,
} from './helpers.mjs'

const presets = ['default', 'ucas', 'ict']
const modes = ['light', 'dark']
const layoutSlides = {
  default: { marker: 'invalid-inputs', slide: 6 },
  cover: { marker: 'layout-cover', slide: 8 },
  intro: { marker: 'layout-intro', slide: 9 },
  section: { marker: 'layout-section', slide: 10 },
  toc: { marker: 'layout-toc', slide: 11 },
  center: { marker: 'layout-center', slide: 12 },
  'two-cols': { marker: 'layout-two-cols', slide: 13 },
  statement: { marker: 'layout-statement', slide: 14 },
  quote: { marker: 'layout-quote', slide: 15 },
  figure: { marker: 'layout-figure', slide: 16 },
  references: { marker: 'layout-references', slide: 17 },
}

const serializeError = error => ({
  message: error.message,
  name: error.name,
  stack: error.stack,
})

const createFallbackContext = async () => {
  const [matrixBuilds, expandedBuilds] = await Promise.all([
    generatePresetMatrixBuilds(),
    generateExpandedContentBuilds(),
  ])
  const protocolBuild = {
    id: 'protocol',
    outDir: resolve(qualityArtifactRoot, 'build/accessibility/protocol'),
    source: resolve('fixtures/obsidian-protocol.md'),
  }
  await buildDeck(protocolBuild)
  const builds = [
    ...matrixBuilds.map(build => ({
      ...build,
      id: `matrix-${build.preset}`,
    })),
    ...expandedBuilds,
    protocolBuild,
  ]
  const servers = await Promise.all(
    builds.map(build => startStaticServer(build.outDir)),
  )
  return {
    builds: Object.fromEntries(builds.map((build, index) => [
      build.id,
      { ...build, baseUrl: servers[index].baseUrl },
    ])),
    close: () => Promise.all(servers.map(server => server.close())),
  }
}

const pageState = async (page, marker) => page.evaluate((qualityMarker) => {
  const markedCanvas = qualityMarker
    ? document.querySelector(`[data-quality-case="${qualityMarker}"]`)
      ?.closest('.slidev-layout')
    : null
  const visibleCanvas = [...document.querySelectorAll('.slidev-layout')]
    .find((element) => {
      const rect = element.getBoundingClientRect()
      return rect.right > 0
        && rect.bottom > 0
        && rect.left < innerWidth
        && rect.top < innerHeight
    })
  const canvas = markedCanvas ?? visibleCanvas
  const frame = canvas?.querySelector('.slide-frame')
  const content = canvas?.querySelector('.slide-frame__content')
  if (!(canvas instanceof HTMLElement)
    || !(frame instanceof HTMLElement)
    || !(content instanceof HTMLElement)) {
    throw new Error('Current slide has no shared canvas/frame/content hierarchy')
  }

  const bounds = (element) => {
    const style = getComputedStyle(element)
    return {
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
    }
  }
  const accessibleName = (element) => (
    element.getAttribute('aria-label')
    || element.getAttribute('title')
    || element.textContent
    || ''
  ).trim()
  const images = [...canvas.querySelectorAll('img')].map(image => ({
    alt: image.getAttribute('alt'),
    ariaHidden: image.getAttribute('aria-hidden'),
    complete: image.complete,
    naturalHeight: image.naturalHeight,
    naturalWidth: image.naturalWidth,
    src: image.currentSrc || image.src,
  }))
  const focusables = [...canvas.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )]
    .filter((element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return !element.matches(':disabled')
        && element.tabIndex >= 0
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0
    })
    .map(element => ({
      name: accessibleName(element),
      tagName: element.tagName.toLowerCase(),
    }))

  return {
    bounds: {
      canvas: bounds(canvas),
      content: bounds(content),
      frame: bounds(frame),
    },
    focusables,
    headings: [...canvas.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter(element => getComputedStyle(element).display !== 'none')
      .map(element => ({
        level: Number(element.tagName.slice(1)),
        text: element.textContent?.trim() ?? '',
      })),
    images,
    landmarkCount: canvas.querySelectorAll('main').length,
    preset: canvas.dataset.presentationPreset ?? null,
  }
}, marker)

const assertNoOverflow = (caseId, state) => {
  for (const [surface, bounds] of Object.entries(state.bounds)) {
    if (surface === 'frame'
      && ['hidden', 'clip'].includes(bounds.overflowX)
      && ['hidden', 'clip'].includes(bounds.overflowY)) {
      continue
    }
    assert.ok(
      bounds.scrollWidth <= bounds.clientWidth + 1,
      `${caseId}: ${surface} horizontal overflow ${JSON.stringify(bounds)}`,
    )
    assert.ok(
      bounds.scrollHeight <= bounds.clientHeight + 1,
      `${caseId}: ${surface} vertical overflow ${JSON.stringify(bounds)}`,
    )
  }
}

const assertSemantics = (caseId, state) => {
  assert.equal(state.landmarkCount, 1, `${caseId}: expected one main landmark`)
  for (const heading of state.headings) {
    assert.ok(heading.text, `${caseId}: empty h${heading.level}`)
  }
  for (const control of state.focusables) {
    assert.ok(
      control.name,
      `${caseId}: unnamed focusable ${control.tagName}`,
    )
  }
  for (const image of state.images) {
    assert.equal(image.complete, true, `${caseId}: incomplete image ${image.src}`)
    assert.ok(image.naturalWidth > 0, `${caseId}: broken image ${image.src}`)
    assert.ok(image.naturalHeight > 0, `${caseId}: broken image ${image.src}`)
    if (image.ariaHidden === 'true') {
      assert.equal(image.alt, '', `${caseId}: decorative image needs empty alt`)
    } else {
      assert.ok(image.alt?.trim(), `${caseId}: meaningful image needs an alt name`)
    }
  }
}

const runAxe = async (page, marker) => {
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(async (qualityMarker) => {
    const markedCanvas = qualityMarker
      ? document.querySelector(`[data-quality-case="${qualityMarker}"]`)
        ?.closest('.slidev-layout')
      : null
    const visibleCanvas = [...document.querySelectorAll('.slidev-layout')]
      .find((element) => {
        const rect = element.getBoundingClientRect()
        return rect.right > 0
          && rect.bottom > 0
          && rect.left < innerWidth
          && rect.top < innerHeight
      })
    const canvas = markedCanvas ?? visibleCanvas
    if (!canvas) throw new Error('Axe root canvas is missing')
    return window.axe.run(canvas, {
      resultTypes: ['violations', 'incomplete'],
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    })
  }, marker)
}

const inspectScenario = async ({
  axeDirectory,
  baseUrl,
  browserContext,
  caseId,
  marker,
  mode,
  preset,
  slide,
}) => {
  const page = await browserContext.newPage()
  const runtimeErrors = []
  const ignoredRuntimeEvents = []
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const location = message.location()
    const sourceUrl = location.url
    if (sourceUrl) {
      const url = new URL(sourceUrl)
      if (url.hostname !== '127.0.0.1') {
        ignoredRuntimeEvents.push(
          `external console: ${message.text()} (${sourceUrl})`,
        )
        return
      }
    }
    runtimeErrors.push(
      `console: ${message.text()}${sourceUrl ? ` (${sourceUrl})` : ''}`,
    )
  })
  page.on('pageerror', (error) => {
    if (error.message === 'Wake Lock permission request denied') {
      ignoredRuntimeEvents.push(`pageerror: ${error.message}`)
      return
    }
    runtimeErrors.push(`pageerror: ${error.message}`)
  })
  page.on('requestfailed', (request) => {
    const url = new URL(request.url())
    if (url.hostname === '127.0.0.1') {
      runtimeErrors.push(
        `requestfailed: ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`,
      )
    }
  })

  try {
    await waitForSlide(page, baseUrl, slide, mode, marker)
    const state = await pageState(page, marker)
    const axeResult = await runAxe(page, marker)
    const seriousViolations = axeResult.violations.filter(
      violation => violation.impact === 'serious' || violation.impact === 'critical',
    )
    const evidence = {
      caseId,
      ignoredRuntimeEvents,
      mode,
      preset,
      runtimeErrors,
      seriousViolations,
      slide,
      state,
      violations: axeResult.violations,
    }
    const evidencePath = resolve(axeDirectory, `${caseId}.json`)
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`)

    assert.equal(state.preset, preset, `${caseId}: resolved preset`)
    assertNoOverflow(caseId, state)
    assertSemantics(caseId, state)
    assert.deepEqual(runtimeErrors, [], `${caseId}: browser runtime errors`)
    assert.deepEqual(
      seriousViolations,
      [],
      `${caseId}: serious/critical Axe findings; evidence: ${evidencePath}`,
    )
    return { page, state }
  } catch (error) {
    error.message = `${caseId}: ${error.message}`
    await page.close()
    throw error
  }
}

test('WCAG, layout, image, console, and interaction contract', { timeout: 240_000 }, async (t) => {
  const externalContext = readQualityBuildContext()
  const fallback = externalContext ? null : await createFallbackContext()
  const builds = externalContext ?? fallback.builds
  for (const id of [
    'matrix-default',
    'matrix-ucas',
    'matrix-ict',
    'expanded-default',
    'expanded-ucas',
    'expanded-ict',
    'protocol',
  ]) {
    assert.ok(builds[id], `quality build context is missing ${id}`)
  }

  const axeDirectory = resolve(qualityArtifactRoot, 'axe')
  await mkdir(axeDirectory, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-font-subpixel-positioning',
      '--disable-lcd-text',
      '--font-render-hinting=none',
    ],
  })
  const browserContext = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })
  await browserContext.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1') await route.continue()
    else {
      await route.fulfill({
        body: '',
        contentType: 'text/plain',
        status: 204,
      })
    }
  })

  try {
    for (const preset of presets) {
      const baseUrl = builds[`matrix-${preset}`].baseUrl
      for (const mode of modes) {
        for (const [layout, definition] of Object.entries(layoutSlides)) {
          const caseId = `${preset}-${layout}-${mode}`
          await t.test(caseId, async () => {
            const result = await inspectScenario({
              axeDirectory,
              baseUrl,
              browserContext,
              caseId,
              marker: definition.marker,
              mode,
              preset,
              slide: definition.slide,
            })
            await result.page.close()
          })
        }
      }
    }

    const us1Scenarios = [
      {
        marker: 'us1-callouts-info',
        name: 'callouts',
        slide: 3,
      },
      {
        marker: 'us1-callout-fallbacks',
        name: 'callout-rich-long-bilingual',
        slide: 9,
      },
      {
        marker: 'us1-figures-alternatives',
        name: 'figure-alternatives',
        slide: 11,
      },
      {
        marker: 'us1-authors-mixed',
        name: 'authors-email',
        slide: 13,
      },
      {
        marker: 'us2-closing-metadata',
        name: 'us2-closing-metadata',
        slide: 16,
      },
      {
        marker: 'us2-closing-failed-logo',
        name: 'us2-closing-failed-logo',
        slide: 18,
      },
      {
        marker: 'us2-image-left',
        name: 'us2-image-left',
        slide: 20,
      },
      {
        marker: 'us2-image-right',
        name: 'us2-image-right',
        slide: 21,
      },
      {
        marker: 'us2-image-bilingual',
        name: 'us2-image-bilingual',
        slide: 25,
      },
      {
        marker: 'us3-accent-local-a',
        name: 'us3-accent-local-a',
        slide: 26,
      },
      {
        marker: 'us3-accent-unaccented',
        name: 'us3-accent-unaccented',
        slide: 27,
      },
      {
        marker: 'us3-accent-local-b',
        name: 'us3-accent-local-b',
        slide: 30,
      },
      {
        marker: 'us4-code-titled',
        name: 'us4-code-titled',
        slide: 32,
      },
      {
        marker: 'us4-code-titleless',
        name: 'us4-code-titleless',
        slide: 33,
      },
      {
        marker: 'us4-steps-many',
        name: 'us4-steps-many',
        slide: 36,
      },
      {
        marker: 'us4-timeline-many',
        name: 'us4-timeline-many',
        slide: 39,
      },
      {
        marker: 'us4-status-labels',
        name: 'us4-status-labels',
        slide: 40,
      },
      {
        marker: 'us4-keyboard',
        name: 'us4-keyboard',
        slide: 41,
      },
      {
        marker: 'us5-tasks-native',
        name: 'us5-tasks-native',
        slide: 42,
      },
      {
        marker: 'us5-tasks-generated',
        name: 'us5-tasks-generated',
        slide: 43,
      },
      {
        marker: 'us5-highlights',
        name: 'us5-highlights',
        slide: 44,
      },
    ]
    for (const preset of presets) {
      const baseUrl = builds[`expanded-${preset}`].baseUrl
      for (const mode of modes) {
        for (const definition of us1Scenarios) {
          const caseId = `${preset}-us1-${definition.name}-${mode}`
          await t.test(caseId, async () => {
            const result = await inspectScenario({
              axeDirectory,
              baseUrl,
              browserContext,
              caseId,
              marker: definition.marker,
              mode,
              preset,
              slide: definition.slide,
            })
            if (definition.name === 'callouts') {
              const cue = await result.page.locator(
                '.obsidian-slidev-callout__title',
              ).first().evaluate((element) => {
                const callout = element.closest('.obsidian-slidev-callout')
                const calloutStyle = getComputedStyle(callout)
                const markerStyle = getComputedStyle(element, '::before')
                return {
                  borderLeftWidth: calloutStyle.borderLeftWidth,
                  markerHeight: markerStyle.height,
                  markerWidth: markerStyle.width,
                }
              })
              assert.notEqual(cue.borderLeftWidth, '0px')
              assert.notEqual(cue.markerHeight, '0px')
              assert.notEqual(cue.markerWidth, '0px')
            }
            if (definition.name === 'figure-alternatives') {
              const alternatives = await result.page.locator(
                `[data-quality-case="${definition.marker}"] > .obsidian-slidev-media`,
              ).evaluateAll(figures => figures.map((figure) => {
                const image = figure.querySelector('img')
                return {
                  alt: image?.getAttribute('alt') ?? null,
                  fallback: figure.querySelector(
                    '.obsidian-slidev-media__fallback',
                  )?.textContent?.trim() ?? null,
                }
              }))
              assert.deepEqual(
                alternatives.map(item => item.alt),
                [
                  'Obsidian card connected to a presentation',
                  'Caption supplies the omitted alternative.',
                  '',
                  null,
                  null,
                ],
              )
              assert.ok(alternatives[3].fallback)
              assert.ok(alternatives[4].fallback)
            }
            if (definition.name === 'authors-email') {
              const email = result.page.locator(
                '.presentation-author a[href^="mailto:"]',
              ).first()
              await email.focus()
              const focus = await email.evaluate((element) => {
                const style = getComputedStyle(element)
                return {
                  outlineStyle: style.outlineStyle,
                  outlineWidth: style.outlineWidth,
                }
              })
              assert.notEqual(focus.outlineStyle, 'none')
              assert.notEqual(focus.outlineWidth, '0px')
            }
            if (definition.name === 'us2-closing-metadata') {
              const contact = result.page.locator(
                '.presentation-closing__contact[href^="mailto:"]',
              )
              await contact.focus()
              const style = await contact.evaluate((element) => {
                const computed = getComputedStyle(element)
                return {
                  outlineStyle: computed.outlineStyle,
                  outlineWidth: computed.outlineWidth,
                }
              })
              assert.notEqual(style.outlineStyle, 'none')
              assert.notEqual(style.outlineWidth, '0px')
            }
            if (definition.name.startsWith('us2-image-')) {
              assert.deepEqual(
                await result.page.locator(
                  `.slidev-page-${definition.slide} .presentation-image-text`,
                )
                  .evaluate(root => [...root.children].map(
                    element => element.className,
                  )),
                [
                  'presentation-image-text__narrative',
                  'obsidian-slidev-media obsidian-slidev-media--image presentation-image-text__figure',
                ],
              )
            }
            if (definition.name === 'us4-status-labels') {
              const labels = result.page.locator(
                `.slidev-page-${definition.slide} :is(.presentation-tag, .presentation-badge)`,
              )
              assert.equal(await labels.count(), 4)
              assert.equal(await labels.locator('[role], [tabindex]').count(), 0)
            }
            if (definition.name === 'us4-keyboard') {
              const keys = result.page.locator(
                `.slidev-page-${definition.slide} :is(.presentation-kbd--single, .presentation-kbd-sequence, .presentation-kbd-key)`,
              )
              assert.ok(await keys.count() > 0)
              assert.equal(await keys.locator('[tabindex]').count(), 0)
              assert.equal(
                await result.page.locator(
                  `.slidev-page-${definition.slide} button`,
                ).count(),
                0,
              )
            }
            if (definition.name.startsWith('us5-tasks-')) {
              const tasks = result.page.locator(
                `.slidev-page-${definition.slide} input[type="checkbox"]`,
              )
              assert.ok(await tasks.count() > 0)
              assert.ok(await tasks.evaluateAll(inputs => inputs.every(
                input => input.disabled
                  && input.tabIndex === -1
                  && input.dataset.presentationTask === 'true',
              )))
              assert.equal(
                result.state.focusables.filter(
                  item => item.tagName === 'input',
                ).length,
                0,
              )
              const cues = await tasks.evaluateAll(inputs => inputs.map(
                (input) => {
                  const item = input.closest('li')
                  return {
                    checked: input.checked,
                    checkedCue: item
                      ? getComputedStyle(item, '::after').content
                      : 'none',
                    emptyCue: item
                      ? getComputedStyle(item, '::before').borderStyle
                      : 'none',
                  }
                },
              ))
              assert.ok(cues.every(cue => cue.emptyCue !== 'none'))
              assert.ok(cues.filter(cue => cue.checked)
                .every(cue => cue.checkedCue !== 'none'))
            }
            if (definition.name === 'us5-highlights') {
              const proseHighlights = result.page.locator(
                `.slidev-page-${definition.slide} [data-highlight-case]`,
              )
              assert.equal(await proseHighlights.count(), 2)
              const codeHighlights = result.page.locator(
                `.slidev-page-${definition.slide} [data-highlight-code-scope] :is(mark, .obsidian-slidev-highlight)`,
              )
              assert.ok(await codeHighlights.evaluateAll(elements => (
                elements.every((element) => {
                  const style = getComputedStyle(element)
                  return style.backgroundColor === 'rgba(0, 0, 0, 0)'
                    && style.borderBottomWidth === '0px'
                })
              )))
            }
            await result.page.close()
          })
        }
      }
    }

    for (const definition of [
      { caseId: 'protocol-callouts-light', marker: null, mode: 'light', slide: 5 },
      { caseId: 'protocol-callouts-dark', marker: null, mode: 'dark', slide: 5 },
      { caseId: 'protocol-warnings-light', marker: null, mode: 'light', slide: 8 },
    ]) {
      await t.test(definition.caseId, async () => {
        const result = await inspectScenario({
          axeDirectory,
          baseUrl: builds.protocol.baseUrl,
          browserContext,
          ...definition,
          preset: 'default',
        })
        if (definition.slide === 5) {
          assert.ok(
            await result.page.locator('.obsidian-slidev-callout').count() >= 3,
            `${definition.caseId}: generated callouts`,
          )
        } else {
          assert.ok(
            await result.page.locator('.obsidian-slidev-warning').count() > 0,
            `${definition.caseId}: generated warning`,
          )
        }
        await result.page.close()
      })
    }

    await t.test('ArrowRight, TOC keyboard, Enter, click, and focus outline', async () => {
      const page = await browserContext.newPage()
      const baseUrl = builds['matrix-default'].baseUrl
      try {
        await waitForSlide(page, baseUrl, 2, 'light', 'baseline-default')
        await page.keyboard.press('ArrowRight')
        await page.locator('[data-quality-case="local-default"]').waitFor({
          state: 'attached',
        })

        await waitForSlide(page, baseUrl, 11, 'light', 'layout-toc')
        const buttons = page.locator(
          '.slide-layout-toc__button:not(.slide-layout-toc__button--static)',
        )
        assert.equal(await buttons.count(), 2)
        await page.locator('body').focus()
        let focused = false
        for (let index = 0; index < 20; index += 1) {
          await page.keyboard.press('Tab')
          focused = await page.evaluate(() => (
            document.activeElement?.classList.contains('slide-layout-toc__button')
            ?? false
          ))
          if (focused) break
        }
        assert.equal(focused, true, 'TOC button is not reachable with Tab')
        const focusStyle = await page.evaluate(() => {
          const style = getComputedStyle(document.activeElement)
          return {
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
          }
        })
        assert.notEqual(focusStyle.outlineStyle, 'none')
        assert.notEqual(focusStyle.outlineWidth, '0px')

        await page.keyboard.press('Enter')
        await page.locator('[data-quality-case="layout-center"]').waitFor({
          state: 'attached',
        })
        await waitForSlide(page, baseUrl, 11, 'light', 'layout-toc')
        await buttons.nth(1).click()
        await page.locator('[data-quality-case="layout-two-cols"]').waitFor({
          state: 'attached',
        })
      } catch (error) {
        const evidencePath = resolve(
          axeDirectory,
          'interaction-failure.json',
        )
        await writeFile(evidencePath, `${JSON.stringify({
          caseId: 'interaction-navigation',
          error: serializeError(error),
        }, null, 2)}\n`)
        error.message = `${error.message}; evidence: ${evidencePath}`
        throw error
      } finally {
        await page.close()
      }
    })
  } finally {
    await browserContext.close()
    await browser.close()
    await fallback?.close()
  }
})
