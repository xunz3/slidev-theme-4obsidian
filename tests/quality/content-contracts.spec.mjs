import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright-chromium'
import {
  generateExpandedContentBuilds,
  readQualityBuildContext,
  repositoryRoot,
  startStaticServer,
  waitForSlide,
} from './helpers.mjs'

export const expandedPresets = Object.freeze(['default', 'ucas', 'ict'])
export const expandedModes = Object.freeze(['light', 'dark'])
export const calloutFamilies = Object.freeze([
  {
    marker: 'us1-callouts-info',
    slide: 3,
    types: ['note', 'info', 'todo', 'abstract', 'summary'],
  },
  {
    marker: 'us1-callouts-positive',
    slide: 4,
    types: ['tip', 'success', 'check'],
  },
  {
    marker: 'us1-callouts-caution',
    slide: 5,
    types: ['warning', 'caution', 'attention'],
  },
  {
    marker: 'us1-callouts-danger',
    slide: 6,
    types: ['danger', 'error', 'failure'],
  },
  {
    marker: 'us1-callouts-question',
    slide: 7,
    types: ['question', 'help', 'faq'],
  },
  {
    marker: 'us1-callouts-quotation',
    slide: 8,
    types: ['quote', 'cite'],
  },
])
const calloutTitles = Object.freeze({
  abstract: 'Abstract',
  attention: 'Attention',
  caution: 'Caution',
  check: 'Check',
  cite: 'Citation',
  danger: 'Danger',
  error: 'Error',
  failure: 'Failure',
  faq: 'FAQ',
  help: 'Help',
  info: 'Info',
  note: 'Note',
  question: 'Question',
  quote: 'Quote',
  success: 'Success',
  summary: 'Summary',
  tip: 'Tip',
  todo: 'To do',
  warning: 'Warning',
})

const loadTypeScript = async () => {
  try {
    return (await import('typescript')).default
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error
    const packageDirectory = (await readdir(
      resolve(repositoryRoot, 'node_modules/.pnpm'),
    ))
      .filter(name => /^typescript@[^_]+$/.test(name))
      .sort()
      .at(-1)
    if (!packageDirectory) throw error
    return (await import(pathToFileURL(resolve(
      repositoryRoot,
      'node_modules/.pnpm',
      packageDirectory,
      'node_modules/typescript/lib/typescript.js',
    )).href)).default
  }
}

const loadTypeScriptModule = async (relativePath) => {
  const ts = await loadTypeScript()
  const absolutePath = resolve(repositoryRoot, relativePath)
  const source = await readFile(absolutePath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    fileName: relativePath,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const encoded = Buffer.from(
    `${transpiled.outputText}\n//# sourceURL=${pathToFileURL(absolutePath).href}`,
  ).toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}

export const createExpandedContentContext = async () => {
  const supplied = readQualityBuildContext()
  if (supplied) {
    for (const preset of expandedPresets) {
      assert.ok(supplied[`expanded-${preset}`], `missing expanded-${preset} build`)
    }
    return {
      builds: supplied,
      close: async () => {},
    }
  }

  const definitions = await generateExpandedContentBuilds()
  const servers = await Promise.all(
    definitions.map(definition => startStaticServer(definition.outDir)),
  )
  return {
    builds: Object.fromEntries(definitions.map((definition, index) => [
      definition.id,
      {
        ...definition,
        baseUrl: servers[index].baseUrl,
      },
    ])),
    close: () => Promise.all(servers.map(server => server.close())),
  }
}

export const inspectBuiltCase = async ({
  baseUrl,
  caseId,
  mode = 'light',
  page,
  slide,
}) => {
  await waitForSlide(page, baseUrl, slide, mode, caseId)
  return page.evaluate((marker) => {
    const marked = document.querySelector(`[data-quality-case="${marker}"]`)
    const canvas = marked?.closest('.slidev-layout')
    if (!(marked instanceof HTMLElement) || !(canvas instanceof HTMLElement)) {
      throw new Error(`${marker}: built marker/canvas is missing`)
    }
    return {
      canvasClass: canvas.className,
      density: canvas.dataset.presentationDensity,
      markerText: marked.textContent?.trim() ?? '',
      preset: canvas.dataset.presentationPreset,
      runtimePreset: document.documentElement.dataset.presentationPreset,
    }
  }, caseId)
}

test('expanded-content production harness', async (t) => {
  const fixture = await readFile(
    resolve(repositoryRoot, 'fixtures/expanded-content.md'),
    'utf8',
  )
  assert.match(fixture, /__EXPANDED_PRESET__/)
  assert.match(fixture, /expanded-control-start/)
  assert.match(fixture, /expanded-control-target/)
  for (const story of ['US1', 'US2', 'US3', 'US4', 'US5']) {
    assert.match(fixture, new RegExp(`EXPANDED-${story}-START`))
    assert.match(fixture, new RegExp(`EXPANDED-${story}-END`))
  }
  assert.doesNotMatch(fixture, /obsidian-slidev.*(?:addon|plugin)/i)

  const buildContext = await createExpandedContentContext()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })
  try {
    for (const preset of expandedPresets) {
      await t.test(`${preset} standalone shell`, async () => {
        const page = await context.newPage()
        const runtimeErrors = []
        page.on('console', (message) => {
          if (message.type() === 'error'
            && message.text() !== 'Wake Lock permission request denied') {
            runtimeErrors.push(message.text())
          }
        })
        page.on('pageerror', (error) => {
          if (error.message !== 'Wake Lock permission request denied') {
            runtimeErrors.push(error.message)
          }
        })
        try {
          const state = await inspectBuiltCase({
            baseUrl: buildContext.builds[`expanded-${preset}`].baseUrl,
            caseId: 'expanded-control-target',
            page,
            slide: 2,
          })
          assert.equal(state.preset, preset)
          assert.equal(state.runtimePreset, preset)
          assert.equal(state.density, 'normal')
          assert.match(state.markerText, /Stable navigation control/)
          assert.deepEqual(runtimeErrors, [])
        } finally {
          await page.close()
        }
      })
    }
  } finally {
    await context.close()
    await browser.close()
    await buildContext.close()
  }
})

test('US1 callout and author normalization is closed, ordered, and empty-safe', async () => {
  const [callouts, authors] = await Promise.all([
    loadTypeScriptModule('setup/callouts.ts'),
    loadTypeScriptModule('setup/authors.ts'),
  ])
  assert.equal(callouts.CALLOUT_TYPES.length, 19)
  assert.ok(Object.isFrozen(callouts.CALLOUT_TYPES))
  assert.equal(callouts.normalizeCalloutType(' WARNING '), 'warning')
  assert.equal(callouts.normalizeCalloutType('unsupported'), null)
  assert.deepEqual(callouts.resolveCallout('', ''), {
    family: 'neutral',
    title: 'Callout',
    type: null,
  })

  const normalized = authors.resolveDeckAuthors({
    authors: [
      'Ada',
      { institution: 'Research Lab' },
      { email: 'valid@example.org' },
      { email: 'not actionable' },
      { name: 'Duplicate' },
      { name: 'Duplicate' },
      {},
      '',
    ],
    author: 'Legacy fallback must not be used',
  })
  assert.deepEqual(normalized.map(author => author.name), [
    'Ada',
    'Research Lab',
    'valid@example.org',
    'not actionable',
    'Duplicate',
    'Duplicate',
  ])
  assert.equal(normalized[2].emailHref, 'mailto:valid@example.org')
  assert.equal(normalized[3].emailHref, undefined)
  assert.deepEqual(authors.resolveDeckAuthors({
    authors: [{}],
    author: 'Legacy fallback',
  }).map(author => author.name), ['Legacy fallback'])
  assert.deepEqual(authors.resolveDeckAuthors({
    authors: ['', {}],
    author: {},
  }), [])
})

test('US1 standalone semantic component contracts', { timeout: 240_000 }, async () => {
  const buildContext = await createExpandedContentContext()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })
  let canonicalCases = 0
  try {
    const page = await context.newPage()
    try {
      for (const preset of expandedPresets) {
        const baseUrl = buildContext.builds[`expanded-${preset}`].baseUrl
        for (const mode of expandedModes) {
          for (const family of calloutFamilies) {
            await waitForSlide(page, baseUrl, family.slide, mode, family.marker)
            const callouts = page.locator(
              `[data-quality-case="${family.marker}"] > .obsidian-slidev-callout`,
            )
            assert.equal(await callouts.count(), family.types.length)
            for (const [index, type] of family.types.entries()) {
              const callout = callouts.nth(index)
              assert.equal(await callout.getAttribute('data-callout'), type)
              assert.equal(await callout.getAttribute('role'), 'note')
              assert.ok(
                (await callout.getAttribute('aria-labelledby'))?.trim(),
                `${preset}/${mode}/${type}: labelled note`,
              )
              assert.ok(
                await callout.evaluate((element, modifier) => (
                  element.classList.contains(modifier)
                ), `obsidian-slidev-callout--${type}`),
              )
              assert.equal(
                (await callout.locator('.obsidian-slidev-callout__title')
                  .textContent())?.trim(),
                calloutTitles[type],
              )
              const style = await callout.evaluate((element) => {
                const computed = getComputedStyle(element)
                const cue = getComputedStyle(
                  element.querySelector('.obsidian-slidev-callout__title'),
                  '::before',
                )
                return {
                  backgroundColor: computed.backgroundColor,
                  borderLeftColor: computed.borderLeftColor,
                  borderLeftWidth: computed.borderLeftWidth,
                  cueBackground: cue.backgroundColor,
                  cueBorderWidth: cue.borderTopWidth,
                }
              })
              assert.notEqual(style.backgroundColor, 'rgba(0, 0, 0, 0)')
              assert.notEqual(style.borderLeftWidth, '0px')
              assert.notEqual(style.borderLeftColor, 'rgba(0, 0, 0, 0)')
              assert.ok(
                style.cueBackground !== 'rgba(0, 0, 0, 0)'
                || style.cueBorderWidth !== '0px',
              )
              canonicalCases += 1
            }
          }
        }
      }
      assert.equal(canonicalCases, 114)

      const defaultUrl = buildContext.builds['expanded-default'].baseUrl
      await waitForSlide(
        page,
        defaultUrl,
        9,
        'light',
        'us1-callout-fallbacks',
      )
      const fallbacks = page.locator(
        '[data-quality-case="us1-callout-fallbacks"] > .obsidian-slidev-callout',
      )
      assert.equal(await fallbacks.count(), 4)
      for (const index of [0, 1, 2]) {
        const callout = fallbacks.nth(index)
        assert.equal(await callout.getAttribute('data-callout'), 'neutral')
        assert.doesNotMatch(
          await callout.getAttribute('class') ?? '',
          /obsidian-slidev-callout--/,
        )
      }
      assert.equal(
        (await fallbacks.nth(0).locator('.obsidian-slidev-callout__title')
          .textContent())?.trim(),
        'Callout',
      )
      assert.equal(
        (await fallbacks.nth(1).locator('.obsidian-slidev-callout__title')
          .textContent())?.trim(),
        'Authored neutral',
      )
      const normalized = fallbacks.nth(3)
      assert.equal(await normalized.getAttribute('data-callout'), 'warning')
      assert.ok(await normalized.locator('strong').count())
      assert.ok(await normalized.locator('code').count())
      assert.ok(await normalized.locator('a[href]').count())
      assert.equal(await normalized.locator('ol > li').count(), 2)

      await waitForSlide(
        page,
        defaultUrl,
        10,
        'light',
        'us1-callout-equivalence',
      )
      const fingerprints = await page.locator(
        '[data-quality-case="us1-callout-equivalence"] > .obsidian-slidev-callout',
      ).evaluateAll(elements => elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          backgroundColor: style.backgroundColor,
          borderLeftColor: style.borderLeftColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          padding: style.padding,
        }
      }))
      assert.equal(fingerprints.length, 2)
      assert.deepEqual(fingerprints[0], fingerprints[1])

      await waitForSlide(
        page,
        defaultUrl,
        11,
        'light',
        'us1-figures-alternatives',
      )
      const figures = page.locator(
        '[data-quality-case="us1-figures-alternatives"] > figure',
      )
      assert.equal(await figures.count(), 5)
      assert.equal(
        await figures.nth(0).locator('img').getAttribute('alt'),
        'Obsidian card connected to a presentation',
      )
      assert.equal(
        await figures.nth(1).locator('img').getAttribute('alt'),
        'Caption supplies the omitted alternative.',
      )
      assert.equal(await figures.nth(2).locator('img').getAttribute('alt'), '')
      for (const index of [3, 4]) {
        assert.equal(await figures.nth(index).locator('img').count(), 0)
        assert.ok(
          (await figures.nth(index)
            .locator('.obsidian-slidev-media__fallback').textContent())?.trim(),
        )
      }

      await waitForSlide(
        page,
        defaultUrl,
        12,
        'light',
        'us1-figures-geometry',
      )
      assert.equal(
        await page.locator(
          '[data-quality-case="us1-figures-geometry"] > figure img',
        ).count(),
        3,
      )

      await waitForSlide(
        page,
        defaultUrl,
        13,
        'light',
        'us1-authors-mixed',
      )
      const authors = page.locator(
        '[data-quality-case="us1-authors-mixed"] .presentation-author',
      )
      assert.equal(await authors.count(), 6)
      assert.deepEqual(
        await authors.locator('.presentation-author__name').allTextContents(),
        [
          'Ada Lovelace',
          'Grace Hopper',
          'Institute for Reproducible Research',
          'contributor@example.org',
          'Intentional Duplicate',
          'Intentional Duplicate',
        ],
      )
      assert.deepEqual(
        await authors.locator('a[href^="mailto:"]').evaluateAll(links => (
          links.map(link => link.getAttribute('href'))
        )),
        ['mailto:grace@example.org', 'mailto:contributor@example.org'],
      )
    } finally {
      await page.close()
    }
  } finally {
    await context.close()
    await browser.close()
    await buildContext.close()
  }
})

test('US2 closing aliases and image/text layouts preserve public compatibility', {
  timeout: 240_000,
}, async () => {
  const buildContext = await createExpandedContentContext()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })
  try {
    const page = await context.newPage()
    const baseUrl = buildContext.builds['expanded-default'].baseUrl
    try {
      const onSlide = (slide, selector) => (
        page.locator(`.slidev-page-${slide} ${selector}`)
      )
      const structure = async (slide, marker) => {
        await waitForSlide(page, baseUrl, slide, 'light', marker)
        return onSlide(slide, '.presentation-closing').evaluate((root) => (
          [...root.querySelectorAll('*')].map(element => ({
            ariaHidden: element.getAttribute('aria-hidden'),
            className: element.className,
            role: element.getAttribute('role'),
            tagName: element.tagName.toLowerCase(),
          }))
        ))
      }
      assert.deepEqual(
        await structure(14, 'us2-end-minimal'),
        await structure(15, 'us2-thanks-minimal'),
      )
      await waitForSlide(page, baseUrl, 14, 'light', 'us2-end-minimal')
      assert.ok(await onSlide(14, '.slide-frame--closing').count())
      assert.equal(await onSlide(14, '.slide-frame__footer').count(), 0)

      await waitForSlide(page, baseUrl, 16, 'light', 'us2-closing-metadata')
      const closingOrder = await onSlide(16, '.presentation-closing')
        .evaluate(root => [...root.children].map(element => element.className))
      assert.deepEqual(closingOrder, [
        'presentation-closing__message',
        'presentation-closing__contact',
        'presentation-closing__authors',
        'obsidian-slidev-media obsidian-slidev-media--image presentation-closing__logo',
      ])
      assert.equal(
        await onSlide(16, '.presentation-closing__contact').getAttribute('href'),
        'mailto:research@example.org',
      )
      assert.equal(await onSlide(16,
        '.presentation-closing__authors .presentation-author',
      ).count(), 6)
      assert.equal(
        await onSlide(16, '.presentation-closing__logo img').getAttribute('alt'),
        'Obsidian presentation research mark',
      )

      await waitForSlide(
        page,
        baseUrl,
        17,
        'light',
        'us2-closing-decorative-logo',
      )
      const decorativeLogo = onSlide(17, '.presentation-closing__logo img')
      assert.equal(await decorativeLogo.getAttribute('alt'), '')
      assert.equal(await decorativeLogo.getAttribute('aria-hidden'), 'true')

      await waitForSlide(
        page,
        baseUrl,
        18,
        'light',
        'us2-closing-failed-logo',
      )
      assert.equal(await onSlide(18, '.presentation-closing__logo img').count(), 0)
      assert.match(
        await onSlide(18,
          '.presentation-closing__logo .obsidian-slidev-media__fallback',
        ).textContent(),
        /Research group logo unavailable/,
      )
      assert.equal(
        await onSlide(18, '.presentation-closing__contact').getAttribute('href'),
        null,
      )

      await waitForSlide(page, baseUrl, 19, 'light', 'us2-closing-omitted')
      assert.equal(await onSlide(19, '.presentation-closing__contact').count(), 0)
      assert.equal(await onSlide(19, '.presentation-closing__authors').count(), 0)
      assert.equal(await onSlide(19, '.presentation-closing__logo').count(), 0)

      const inspectImageLayout = async (slide, marker) => {
        await waitForSlide(page, baseUrl, slide, 'light', marker)
        return onSlide(slide, '.presentation-image-text').evaluate((root) => {
          const children = [...root.children]
          const narrative = root.querySelector('.presentation-image-text__narrative')
          const figure = root.querySelector('.presentation-image-text__figure')
          const rect = element => element?.getBoundingClientRect()
          return {
            childClasses: children.map(element => element.className),
            figureLeft: rect(figure)?.left ?? null,
            narrativeLeft: rect(narrative)?.left ?? null,
            orientation: root.getAttribute('data-orientation'),
          }
        })
      }
      const left = await inspectImageLayout(20, 'us2-image-left')
      const right = await inspectImageLayout(21, 'us2-image-right')
      assert.deepEqual(left.childClasses, [
        'presentation-image-text__narrative',
        'obsidian-slidev-media obsidian-slidev-media--image presentation-image-text__figure',
      ])
      assert.deepEqual(right.childClasses, left.childClasses)
      assert.equal(left.orientation, 'left')
      assert.equal(right.orientation, 'right')
      assert.ok(left.figureLeft < left.narrativeLeft)
      assert.ok(right.figureLeft > right.narrativeLeft)

      await waitForSlide(page, baseUrl, 22, 'light', 'us2-image-legacy')
      assert.ok(await onSlide(22, '.slidev-layout.legacy-image-layout').count())
      assert.equal(
        await onSlide(22, '.presentation-image-text__figure img')
          .getAttribute('alt'),
        'Caption fallback supplies the omitted image alternative.',
      )
      assert.equal(
        await onSlide(22, '.presentation-image-text__figure')
          .getAttribute('data-media-fit'),
        null,
      )
      assert.equal(
        await onSlide(22, '.presentation-image-text__figure')
          .locator('.obsidian-slidev-media__viewport')
          .getAttribute('data-media-fit'),
        'cover',
      )

      await waitForSlide(page, baseUrl, 23, 'light', 'us2-image-missing')
      assert.equal(await onSlide(23, '.presentation-image-text__figure').count(), 0)
      assert.ok(await onSlide(23,
        '.presentation-image-text--narrative-only',
      ).count())

      await waitForSlide(page, baseUrl, 24, 'light', 'us2-image-failed')
      assert.equal(
        await onSlide(24, '.presentation-image-text__figure img').count(),
        0,
      )
      assert.match(
        await onSlide(24,
          '.presentation-image-text__figure .obsidian-slidev-media__fallback',
        ).textContent(),
        /Failed experimental figure/,
      )

      const thanksSource = await readFile(
        resolve(repositoryRoot, 'layouts/thanks.vue'),
        'utf8',
      )
      assert.match(
        thanksSource,
        /import\s+EndLayout\s+from\s+['"]\.\/end\.vue['"]/,
      )
      assert.match(thanksSource, /<EndLayout\b/)
      assert.doesNotMatch(
        thanksSource,
        /defineProps|<SlideFrame|ClosingLayout|presentation-closing/,
      )
    } finally {
      await page.close()
    }
  } finally {
    await context.close()
    await browser.close()
    await buildContext.close()
  }
})

test('US3 slide accents are local, first-valid, consumer-complete, and protected', {
  timeout: 240_000,
}, async () => {
  const deckAccent = 'color-mix(in srgb, currentColor 72%, #5b4fc4)'
  const localAccentA = 'color-mix(in srgb, currentColor 68%, #c2410c)'
  const localAccentB = 'color-mix(in srgb, currentColor 68%, #047857)'
  const definitions = [
    { accent: localAccentA, marker: 'us3-accent-local-a', slide: 26 },
    { accent: deckAccent, marker: 'us3-accent-unaccented', slide: 27 },
    { accent: deckAccent, marker: 'us3-accent-empty', slide: 28 },
    { accent: deckAccent, marker: 'us3-accent-invalid', slide: 29 },
    { accent: localAccentB, marker: 'us3-accent-local-b', slide: 30 },
    { accent: deckAccent, marker: 'us3-accent-equal-deck', slide: 31 },
  ]
  const buildContext = await createExpandedContentContext()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })

  const inspect = async ({ baseUrl, marker, mode, page, slide }) => {
    await waitForSlide(page, baseUrl, slide, mode, marker)
    return page.evaluate((caseId) => {
      const marked = document.querySelector(`[data-quality-case="${caseId}"]`)
      const canvas = marked?.closest('.slidev-layout')
      if (!(canvas instanceof HTMLElement)) {
        throw new Error(`${caseId}: canvas is missing`)
      }
      const style = (element, property, pseudo) => (
        element instanceof Element
          ? getComputedStyle(element, pseudo).getPropertyValue(property)
          : null
      )
      const calloutStyle = (type) => {
        const callout = canvas.querySelector(`[data-callout="${type}"]`)
        const title = callout?.querySelector('.obsidian-slidev-callout__title')
        return callout
          ? {
              background: style(callout, 'background-color'),
              border: style(callout, 'border-left-color'),
              marker: style(title, 'background-color', '::before'),
              title: style(title, 'color'),
            }
          : null
      }
      const link = canvas.querySelector('a')
      const inlineCode = canvas.querySelector(':not(pre) > code')
      const listItem = canvas.querySelector('li')
      const tableHeader = canvas.querySelector('th')
      const info = calloutStyle('info')
      const header = canvas.querySelector('.slide-frame__header')
      const footer = canvas.querySelector('.slide-frame__footer')
      return {
        brand: [...canvas.querySelectorAll(
          '[class*="slide-frame__ucas"], [class*="slide-frame__ict"]',
        )].map(element => ({
          className: element.className,
          filter: style(element, 'filter'),
          height: style(element, 'height'),
          opacity: style(element, 'opacity'),
          src: element instanceof HTMLImageElement ? element.currentSrc : null,
          width: style(element, 'width'),
        })),
        canvasAccent: getComputedStyle(canvas)
          .getPropertyValue('--presentation-accent').trim(),
        canvasPrimary: getComputedStyle(canvas)
          .getPropertyValue('--slidev-theme-primary').trim(),
        consumers: {
          footerBorder: style(footer, 'border-top-color'),
          headerBorder: style(header, 'border-bottom-color'),
          info,
          inlineCodeBackground: style(inlineCode, 'background-color'),
          inlineCodeColor: style(inlineCode, 'color'),
          linkColor: style(link, 'color'),
          listMarkerColor: style(listItem, 'color', '::marker'),
          tableHeaderBackground: style(tableHeader, 'background-color'),
          tableHeaderBorder: style(tableHeader, 'border-bottom-color'),
        },
        inlineAccent: canvas.style.getPropertyValue('--presentation-accent').trim(),
        inlinePrimary: canvas.style.getPropertyValue('--slidev-theme-primary').trim(),
        protectedSemantic: Object.fromEntries(
          ['success', 'warning', 'danger', 'question']
            .map(type => [type, calloutStyle(type)]),
        ),
        rootAccent: document.documentElement.style
          .getPropertyValue('--presentation-accent').trim(),
        rootPrimary: document.documentElement.style
          .getPropertyValue('--slidev-theme-primary').trim(),
      }
    }, marker)
  }

  try {
    for (const preset of expandedPresets) {
      const baseUrl = buildContext.builds[`expanded-${preset}`].baseUrl
      for (const mode of expandedModes) {
        const page = await context.newPage()
        try {
          const states = []
          for (const definition of definitions) {
            states.push(await inspect({
              baseUrl,
              marker: definition.marker,
              mode,
              page,
              slide: definition.slide,
            }))
          }

          for (const [index, definition] of definitions.entries()) {
            const state = states[index]
            assert.equal(state.inlineAccent, definition.accent)
            assert.equal(state.inlinePrimary, definition.accent)
            assert.equal(state.canvasAccent, definition.accent)
            assert.equal(state.canvasPrimary, definition.accent)
            assert.equal(state.rootAccent, deckAccent)
            assert.equal(state.rootPrimary, deckAccent)
          }

          const local = states[0]
          const fallback = states[1]
          for (const role of [
            'footerBorder',
            'headerBorder',
            'inlineCodeBackground',
            'inlineCodeColor',
            'linkColor',
            'listMarkerColor',
            'tableHeaderBackground',
            'tableHeaderBorder',
          ]) {
            assert.notEqual(
              local.consumers[role],
              fallback.consumers[role],
              `${preset}/${mode}: ${role} ignored the local accent`,
            )
          }
          assert.notDeepEqual(local.consumers.info, fallback.consumers.info)
          assert.deepEqual(
            local.protectedSemantic,
            fallback.protectedSemantic,
            `${preset}/${mode}: semantic colors changed with accent`,
          )
          assert.deepEqual(
            local.brand,
            fallback.brand,
            `${preset}/${mode}: protected brand styles changed with accent`,
          )

          await waitForSlide(
            page,
            baseUrl,
            26,
            mode,
            'us3-accent-local-a',
          )
          await page.keyboard.press('ArrowRight')
          await page.locator('[data-quality-case="us3-accent-unaccented"]')
            .waitFor({ state: 'attached' })
          const mounted = await page.evaluate(() => {
            const accent = slide => document.querySelector(
              `.slidev-page-${slide} .slidev-layout`,
            )?.style.getPropertyValue('--presentation-accent').trim() ?? null
            return {
              local: accent(26),
              next: accent(27),
              root: document.documentElement.style
                .getPropertyValue('--presentation-accent').trim(),
            }
          })
          assert.deepEqual(mounted, {
            local: localAccentA,
            next: deckAccent,
            root: deckAccent,
          })
        } finally {
          await page.close()
        }
      }
    }
  } finally {
    await context.close()
    await browser.close()
    await buildContext.close()
  }
})

test('US4 code, sequence, status, and keyboard contracts preserve native meaning', {
  timeout: 240_000,
}, async () => {
  const buildContext = await createExpandedContentContext()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })
  try {
    const page = await context.newPage()
    const baseUrl = buildContext.builds['expanded-default'].baseUrl
    const onSlide = (slide, selector) => (
      page.locator(`.slidev-page-${slide} ${selector}`)
    )
    try {
      await waitForSlide(page, baseUrl, 32, 'light', 'us4-code-titled')
      assert.equal(await onSlide(32, '.presentation-code-layout h1').count(), 1)
      assert.match(
        await onSlide(32, '.presentation-code-layout h1').textContent(),
        /Solver implementation/,
      )
      const titledCode = await onSlide(
        32,
        '.presentation-code-layout .slidev-code-wrapper',
      ).evaluate((wrapper) => {
        const content = wrapper.closest('.slide-frame__content')
        const pre = wrapper.querySelector('pre')
        const code = wrapper.querySelector('code')
        const wrapperRect = wrapper.getBoundingClientRect()
        const style = getComputedStyle(wrapper)
        return {
          codeSpanCount: code?.querySelectorAll('span').length ?? 0,
          contentWidth: content?.clientWidth ?? 0,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          preCount: pre ? 1 : 0,
          scrollHeight: wrapper.scrollHeight,
          scrollWidth: wrapper.scrollWidth,
          width: wrapperRect.width,
        }
      })
      assert.equal(titledCode.preCount, 1)
      assert.ok(titledCode.codeSpanCount > 0)
      assert.ok(
        Math.abs(titledCode.width - titledCode.contentWidth) <= 2,
        JSON.stringify(titledCode),
      )
      assert.match(titledCode.overflowX, /auto|scroll/)
      assert.ok(titledCode.scrollWidth > titledCode.width)

      await waitForSlide(page, baseUrl, 33, 'light', 'us4-code-titleless')
      assert.equal(await onSlide(33, '.presentation-code-layout h1').count(), 0)
      const titlelessCode = await onSlide(
        33,
        '.presentation-code-layout .slidev-code-wrapper',
      ).evaluate((wrapper) => {
        const content = wrapper.closest('.slide-frame__content')
        const frame = wrapper.closest('.slide-frame')
        return {
          clientHeight: wrapper.clientHeight,
          contentOverflow: content
            ? {
                clientHeight: content.clientHeight,
                scrollHeight: content.scrollHeight,
              }
            : null,
          frameOverflow: frame
            ? {
                clientHeight: frame.clientHeight,
                clientWidth: frame.clientWidth,
                scrollHeight: frame.scrollHeight,
                scrollWidth: frame.scrollWidth,
              }
            : null,
          overflowY: getComputedStyle(wrapper).overflowY,
          scrollHeight: wrapper.scrollHeight,
        }
      })
      assert.match(titlelessCode.overflowY, /auto|scroll/)
      assert.ok(titlelessCode.scrollHeight > titlelessCode.clientHeight)
      assert.ok(
        titlelessCode.contentOverflow.scrollHeight
          <= titlelessCode.contentOverflow.clientHeight + 1,
      )
      assert.ok(
        titlelessCode.frameOverflow.scrollHeight
          <= titlelessCode.frameOverflow.clientHeight + 1,
      )
      assert.ok(
        titlelessCode.frameOverflow.scrollWidth
          <= titlelessCode.frameOverflow.clientWidth + 1,
      )

      await waitForSlide(page, baseUrl, 34, 'light', 'us4-steps-zero')
      assert.equal(await onSlide(34, '.presentation-steps').count(), 1)
      assert.equal(await onSlide(34, '.presentation-steps ol').count(), 0)
      assert.match(
        await onSlide(34, '.presentation-steps').textContent(),
        /receives no sequence decoration/,
      )

      await waitForSlide(page, baseUrl, 35, 'light', 'us4-steps-one')
      assert.equal(await onSlide(35, '.presentation-steps ol').count(), 1)
      assert.equal(await onSlide(35, '.presentation-steps li').count(), 1)
      assert.equal(
        await onSlide(35, '.presentation-steps li')
          .evaluate(element => getComputedStyle(element, '::after').content),
        'none',
      )

      await waitForSlide(page, baseUrl, 36, 'light', 'us4-steps-many')
      const stepItems = onSlide(36, '.presentation-steps > ol > li')
      assert.equal(await stepItems.count(), 4)
      assert.deepEqual(
        (await stepItems.allTextContents()).map(value => value.trim()),
        [
          'Collect · 采集 raw observations and environment details.',
          'Normalize · 规范化 measurements without discarding provenance.',
          'Validate · 验证 assumptions, uncertainty, and exclusions.',
          'Publish · 发布 evidence with a rerunnable audit trail.',
        ],
      )
      assert.notEqual(
        await stepItems.first()
          .evaluate(element => getComputedStyle(element, '::after').content),
        'none',
      )
      assert.equal(
        await stepItems.last()
          .evaluate(element => getComputedStyle(element, '::after').content),
        'none',
      )

      await waitForSlide(page, baseUrl, 37, 'light', 'us4-timeline-zero')
      assert.equal(await onSlide(37, '.presentation-timeline ol').count(), 0)

      await waitForSlide(page, baseUrl, 38, 'light', 'us4-timeline-one')
      assert.equal(await onSlide(38, '.presentation-timeline li').count(), 1)
      assert.equal(await onSlide(38, '.presentation-timeline time').count(), 0)

      await waitForSlide(page, baseUrl, 39, 'light', 'us4-timeline-many')
      const timelineItems = onSlide(39, '.presentation-timeline > ol > li')
      assert.equal(await timelineItems.count(), 4)
      assert.deepEqual(
        await onSlide(39, '.presentation-timeline time')
          .evaluateAll(elements => elements.map(element => ({
            datetime: element.getAttribute('datetime'),
            text: element.textContent,
          }))),
        [
          { datetime: '2024-09', text: 'Sep 2024' },
          { datetime: '2025-02', text: 'Feb 2025' },
        ],
      )
      assert.notEqual(
        await timelineItems.first()
          .evaluate(element => getComputedStyle(element, '::after').content),
        'none',
      )
      assert.equal(
        await timelineItems.last()
          .evaluate(element => getComputedStyle(element, '::after').content),
        'none',
      )

      await waitForSlide(page, baseUrl, 40, 'light', 'us4-status-labels')
      const labels = await onSlide(
        40,
        '.presentation-tag, .presentation-badge',
      ).evaluateAll(elements => elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          background: style.backgroundColor,
          borderRadius: style.borderRadius,
          className: element.className,
          pseudo: getComputedStyle(element, '::before').content,
          role: element.getAttribute('role'),
          tabIndex: element.getAttribute('tabindex'),
          tagName: element.tagName.toLowerCase(),
        }
      }))
      assert.equal(labels.length, 4)
      assert.deepEqual(labels.map(label => label.tagName), [
        'span',
        'span',
        'span',
        'span',
      ])
      assert.ok(labels.every(label => label.role === null))
      assert.ok(labels.every(label => label.tabIndex === null))
      assert.notEqual(labels[0].borderRadius, labels[2].borderRadius)
      assert.notEqual(labels[0].background, labels[2].background)
      assert.equal(labels[0].pseudo, 'none')
      assert.notEqual(labels[2].pseudo, 'none')

      await waitForSlide(page, baseUrl, 41, 'light', 'us4-keyboard')
      const single = onSlide(41, '.presentation-kbd--single')
      assert.equal(await single.count(), 2)
      assert.deepEqual(
        (await single.allTextContents()).map(value => value.trim()),
        ['Esc', 'Fallback key'],
      )
      const chords = onSlide(41, '.presentation-kbd-sequence')
      assert.equal(await chords.count(), 2)
      assert.deepEqual(
        await chords.evaluateAll(elements => elements.map(element => ({
          ariaLabel: element.getAttribute('aria-label'),
          accessibleText: element.querySelector(
            '.presentation-kbd-accessible',
          )?.textContent,
          innerKeys: [...element.querySelectorAll(':scope > kbd')]
            .map(key => key.textContent),
          separators: [...element.querySelectorAll(
            ':scope > .presentation-kbd-separator',
          )].map(separator => separator.textContent),
          tabIndex: element.getAttribute('tabindex'),
          tagName: element.tagName.toLowerCase(),
        }))),
        [
          {
            ariaLabel: null,
            accessibleText: 'Ctrl plus Shift plus P',
            innerKeys: ['Ctrl', 'Shift', 'P'],
            separators: ['+', '+'],
            tabIndex: null,
            tagName: 'kbd',
          },
          {
            ariaLabel: null,
            accessibleText: '⌘ plus K plus 语言',
            innerKeys: ['⌘', 'K', '语言'],
            separators: ['+', '+'],
            tabIndex: null,
            tagName: 'kbd',
          },
        ],
      )
      assert.equal(await onSlide(41, 'button').count(), 0)
      assert.equal(await onSlide(41, '[tabindex]').count(), 0)
    } finally {
      await page.close()
    }
  } finally {
    await context.close()
    await browser.close()
    await buildContext.close()
  }
})

test('US5 tasks stay presentation-only and prose highlights stay code-scoped', {
  timeout: 240_000,
}, async () => {
  const buildContext = await createExpandedContentContext()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { height: 552, width: 980 },
  })
  try {
    const page = await context.newPage()
    const baseUrl = buildContext.builds['expanded-default'].baseUrl
    const onSlide = (slide, selector) => (
      page.locator(`.slidev-page-${slide} ${selector}`)
    )
    const inspectTasks = async (slide, marker) => {
      await waitForSlide(page, baseUrl, slide, 'light', marker)
      return onSlide(slide, 'input[type="checkbox"]').evaluateAll(inputs => (
        inputs.map((input) => {
          const item = input.closest('li')
          const itemStyle = item ? getComputedStyle(item) : null
          const before = item ? getComputedStyle(item, '::before') : null
          const after = item ? getComputedStyle(item, '::after') : null
          return {
            afterBorderBottomWidth: after?.borderBottomWidth,
            afterBorderLeftWidth: after?.borderLeftWidth,
            afterContent: after?.content,
            checked: input.checked,
            dataPresentationTask: input.dataset.presentationTask,
            disabled: input.disabled,
            itemFontWeight: itemStyle?.fontWeight,
            itemPaddingLeft: itemStyle?.paddingLeft,
            markerBorderStyle: before?.borderStyle,
            markerContent: before?.content,
            tabIndex: input.tabIndex,
          }
        })
      ))
    }

    try {
      const nativeTasks = await inspectTasks(42, 'us5-tasks-native')
      assert.deepEqual(
        nativeTasks.map(task => task.checked),
        [false, true, false, true, false, true],
      )
      assert.ok(nativeTasks.every(task => task.disabled))
      assert.ok(nativeTasks.every(task => task.tabIndex === -1))
      assert.ok(nativeTasks.every(
        task => task.dataPresentationTask === 'true',
      ))
      assert.ok(nativeTasks.every(task => task.markerContent !== 'none'))
      assert.ok(nativeTasks.every(task => task.markerBorderStyle !== 'none'))
      assert.ok(nativeTasks.every(
        task => Number.parseFloat(task.itemPaddingLeft) > 0,
      ))
      assert.equal(nativeTasks[0].afterContent, 'none')
      assert.notEqual(nativeTasks[1].afterContent, 'none')
      assert.notEqual(nativeTasks[1].afterBorderLeftWidth, '0px')
      assert.notEqual(nativeTasks[1].afterBorderBottomWidth, '0px')
      assert.notEqual(nativeTasks[1].itemFontWeight, nativeTasks[0].itemFontWeight)

      const beforeAttempt = await onSlide(42, 'input[type="checkbox"]')
        .evaluateAll(inputs => inputs.map(input => input.checked))
      await onSlide(42, 'input[type="checkbox"]').first()
        .evaluate((input) => {
          input.click()
          input.focus()
          input.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            key: ' ',
          }))
        })
      assert.deepEqual(
        await onSlide(42, 'input[type="checkbox"]')
          .evaluateAll(inputs => inputs.map(input => input.checked)),
        beforeAttempt,
      )
      assert.equal(
        await page.evaluate(() => document.activeElement?.matches(
          'input[type="checkbox"]',
        )),
        false,
      )

      const nestedGeometry = await onSlide(
        42,
        'li:has(> ul input[type="checkbox"])',
      ).first().evaluate((parent) => {
        const nested = parent.querySelector('ul li')
        const longLabel = parent.closest('ul')?.querySelectorAll(':scope > li')[2]
        return {
          longLabelHeight: longLabel?.getBoundingClientRect().height ?? 0,
          nestedLeft: nested?.getBoundingClientRect().left ?? 0,
          parentLeft: parent.getBoundingClientRect().left,
        }
      })
      assert.ok(nestedGeometry.nestedLeft > nestedGeometry.parentLeft)
      assert.ok(nestedGeometry.longLabelHeight > 24)

      const generatedTasks = await inspectTasks(43, 'us5-tasks-generated')
      assert.deepEqual(
        generatedTasks.map(task => task.checked),
        [false, true, false],
      )
      assert.ok(generatedTasks.every(task => task.disabled))
      assert.ok(generatedTasks.every(task => task.tabIndex === -1))

      await page.evaluate(() => {
        const canvas = document.querySelector(
          '.slidev-page-43 .slidev-layout',
        )
        const list = document.createElement('ul')
        list.dataset.qualityDynamicTasks = 'true'
        list.className = 'obsidian-slidev-task-list contains-task-list'
        list.innerHTML = `
          <li class="obsidian-slidev-task-list-item task-list-item">
            <input type="checkbox" checked>
            Later-added checked task.
          </li>
        `
        canvas?.querySelector('.slide-frame__content')?.append(list)
      })
      await page.waitForFunction(() => {
        const input = document.querySelector(
          '[data-quality-dynamic-tasks] input',
        )
        return input instanceof HTMLInputElement
          && input.disabled
          && input.tabIndex === -1
          && input.checked
          && input.dataset.presentationTask === 'true'
      })

      await waitForSlide(page, baseUrl, 44, 'light', 'us5-highlights')
      const highlightStyles = await onSlide(
        44,
        '[data-highlight-case]',
      ).evaluateAll(elements => elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          background: style.backgroundColor,
          borderBottomColor: style.borderBottomColor,
          borderBottomWidth: style.borderBottomWidth,
          boxShadow: style.boxShadow,
          color: style.color,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          paddingTop: style.paddingTop,
        }
      }))
      assert.equal(highlightStyles.length, 2)
      assert.deepEqual(highlightStyles[0], highlightStyles[1])
      assert.notEqual(highlightStyles[0].background, 'rgba(0, 0, 0, 0)')
      assert.notEqual(highlightStyles[0].borderBottomWidth, '0px')

      const adjacent = await onSlide(
        44,
        '[data-quality-case="us5-highlights"]',
      ).evaluate((root) => {
        const style = element => getComputedStyle(element)
        const link = root.querySelector('a')
        const emphasis = root.querySelector('em')
        const inlineCode = root.querySelector(':not(pre) > code')
        const highlight = root.querySelector('[data-highlight-case="native"]')
        return {
          emphasisFontStyle: style(emphasis).fontStyle,
          highlightBackground: style(highlight).backgroundColor,
          inlineCodeBackground: style(inlineCode).backgroundColor,
          inlineCodeFont: style(inlineCode).fontFamily,
          linkBackground: style(link).backgroundColor,
          linkDecoration: style(link).textDecorationLine,
        }
      })
      assert.equal(adjacent.emphasisFontStyle, 'italic')
      assert.match(adjacent.linkDecoration, /underline/)
      assert.notEqual(
        adjacent.inlineCodeBackground,
        adjacent.highlightBackground,
      )
      assert.notEqual(adjacent.linkBackground, adjacent.highlightBackground)
      assert.match(adjacent.inlineCodeFont, /JetBrains Mono|monospace/i)

      const codeScope = await onSlide(
        44,
        '[data-highlight-code-scope] :is(mark, .obsidian-slidev-highlight)',
      ).evaluateAll(elements => elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          background: style.backgroundColor,
          borderBottomWidth: style.borderBottomWidth,
          boxShadow: style.boxShadow,
          padding: style.padding,
        }
      }))
      assert.equal(codeScope.length, 2)
      for (const style of codeScope) {
        assert.equal(style.background, 'rgba(0, 0, 0, 0)')
        assert.equal(style.borderBottomWidth, '0px')
        assert.equal(style.boxShadow, 'none')
        assert.equal(style.padding, '0px')
      }
      assert.equal(
        await onSlide(
          44,
          'pre:not([data-highlight-code-scope]) :is(mark, .obsidian-slidev-highlight)',
        ).count(),
        0,
      )

      const taskSetupSource = await readFile(
        resolve(repositoryRoot, 'setup/task-lists.ts'),
        'utf8',
      )
      assert.doesNotMatch(
        taskSetupSource,
        /markdown-it|remark|unified|parser|converter/i,
      )
      assert.doesNotMatch(taskSetupSource, /(['"`])==.*==\1/)
    } finally {
      await page.close()
    }
  } finally {
    await context.close()
    await browser.close()
    await buildContext.close()
  }
})
