import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

const loadTypeScript = async () => {
  try {
    return (await import('typescript')).default
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error

    const pnpmDirectory = new URL('../../node_modules/.pnpm/', import.meta.url)
    const packageDirectory = (await readdir(pnpmDirectory))
      .filter(name => /^typescript@[^_]+$/.test(name))
      .sort()
      .at(-1)
    if (!packageDirectory) throw error

    const compilerUrl = new URL(
      `${packageDirectory}/node_modules/typescript/lib/typescript.js`,
      pnpmDirectory,
    )
    return (await import(compilerUrl.href)).default
  }
}

const ts = await loadTypeScript()

const moduleUrl = new URL('../../setup/presentation-config.ts', import.meta.url)

const loadConfigurationModule = async () => {
  const source = await readFile(moduleUrl, 'utf8')
  const transpiled = ts.transpileModule(source, {
    fileName: 'presentation-config.ts',
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })

  const encoded = Buffer.from(
    `${transpiled.outputText}\n//# sourceURL=${pathToFileURL(fileURLToPath(moduleUrl)).href}`,
  ).toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}

const config = await loadConfigurationModule()

test('option definitions are the immutable canonical public contract', () => {
  assert.deepEqual(config.PRESENTATION_PRESETS, ['default', 'ucas', 'ict'])
  assert.deepEqual(config.PRESENTATION_DENSITIES, ['compact', 'normal', 'relaxed'])
  assert.deepEqual(config.PRESENTATION_CHROME_VALUES, ['auto', 'on', 'off'])
  assert.deepEqual(config.FRAME_VARIANTS, [
    'default',
    'cover',
    'intro',
    'section',
    'toc',
    'center',
    'two-cols',
    'statement',
    'quote',
    'figure',
    'references',
    'closing',
    'image-text',
    'code',
  ])

  assert.deepEqual(Object.keys(config.PRESENTATION_OPTIONS), [
    'preset',
    'density',
    'chrome',
    'header',
    'footerAuthors',
    'pageNumber',
    'accent',
  ])
  assert.deepEqual(config.PRESENTATION_DEFAULTS, {
    preset: 'default',
    density: 'normal',
    chrome: 'auto',
    header: false,
    footerAuthors: true,
    pageNumber: true,
    accent: null,
  })

  assert.equal(config.PRESENTATION_OPTIONS.preset.deckKey, 'preset')
  assert.deepEqual(config.PRESENTATION_OPTIONS.preset.slideKeys, ['presentationPreset'])
  assert.deepEqual(config.PRESENTATION_OPTIONS.chrome.slideKeys, ['presentationChrome', 'chrome'])
  assert.deepEqual(config.PRESENTATION_OPTIONS.header.slideKeys, ['presentationHeader', 'header'])
  assert.deepEqual(config.PRESENTATION_OPTIONS.pageNumber.slideKeys, ['pageNumber'])
  assert.deepEqual(config.PRESENTATION_OPTIONS.accent.slideKeys, ['accent'])
  assert.equal(config.PRESENTATION_OPTIONS.accent.scope, 'deck-and-slide')

  assert.ok(Object.isFrozen(config.PRESENTATION_PRESETS))
  assert.ok(Object.isFrozen(config.PRESENTATION_DENSITIES))
  assert.ok(Object.isFrozen(config.PRESENTATION_CHROME_VALUES))
  assert.ok(Object.isFrozen(config.FRAME_VARIANTS))
  assert.ok(Object.isFrozen(config.PRESENTATION_OPTIONS))
  assert.ok(Object.isFrozen(config.PRESENTATION_DEFAULTS))
  for (const definition of Object.values(config.PRESENTATION_OPTIONS)) {
    assert.ok(Object.isFrozen(definition))
    assert.ok(Object.isFrozen(definition.slideKeys))
  }
})

test('normalizers accept only documented enum and boolean values', () => {
  assert.equal(config.normalizePreset(' ucas '), 'ucas')
  assert.equal(config.normalizePreset('UCAS'), undefined)
  assert.equal(config.normalizePreset('unknown'), undefined)
  assert.equal(config.normalizeDensity(' relaxed '), 'relaxed')
  assert.equal(config.normalizeDensity('dense'), undefined)

  for (const [input, expected] of [
    [true, true],
    [false, false],
    [' true ', true],
    ['on', true],
    [' false ', false],
    ['off', false],
  ]) {
    assert.equal(config.normalizeBoolean(input), expected)
  }
  for (const input of [1, 0, 'yes', 'no', 'TRUE', '', {}, []]) {
    assert.equal(config.normalizeBoolean(input), undefined)
  }

  for (const [input, expected] of [
    ['auto', 'auto'],
    [' on ', 'on'],
    ['off', 'off'],
    [true, 'on'],
    [false, 'off'],
    ['true', 'on'],
    ['false', 'off'],
  ]) {
    assert.equal(config.normalizeChrome(input), expected)
  }
  assert.equal(config.normalizeChrome('always'), undefined)
})

test('missing and invalid deck configuration resolve field-by-field to defaults', () => {
  assert.deepEqual(config.resolveDeckPresentation(), config.PRESENTATION_DEFAULTS)
  assert.deepEqual(config.resolveDeckPresentation(null), config.PRESENTATION_DEFAULTS)
  assert.deepEqual(config.resolveDeckPresentation([]), config.PRESENTATION_DEFAULTS)
  assert.deepEqual(config.resolveDeckPresentation({
    preset: 'invalid',
    density: 1,
    chrome: 'always',
    header: 'yes',
    footerAuthors: 0,
    pageNumber: {},
    accent: 'not-a-color',
  }, {
    supportsColor: () => false,
  }), config.PRESENTATION_DEFAULTS)
})

test('deck normalization accepts every supported value and textual boolean', () => {
  assert.deepEqual(config.resolveDeckPresentation({
    preset: 'ict',
    density: 'compact',
    chrome: 'true',
    header: 'on',
    footerAuthors: 'false',
    pageNumber: 'off',
    accent: '  #345f8f  ',
  }, {
    supportsColor: value => value === '#345f8f',
  }), {
    preset: 'ict',
    density: 'compact',
    chrome: 'on',
    header: true,
    footerAuthors: false,
    pageNumber: false,
    accent: '#345f8f',
  })
})

test('slide resolution uses first-valid prop, slide, deck, and default precedence', () => {
  const deck = {
    preset: 'ucas',
    density: 'relaxed',
    chrome: 'off',
    header: true,
    footerAuthors: false,
    pageNumber: false,
    accent: '#123456',
  }

  assert.deepEqual(config.resolvePresentation({
    deck,
    slide: {
      presentationPreset: 'ict',
      presentationDensity: 'compact',
      presentationChrome: 'on',
      presentationHeader: 'off',
      footerAuthors: 'true',
      pageNumber: 'on',
    },
    variant: 'default',
    supportsColor: value => value === '#123456',
  }), {
    preset: 'ict',
    density: 'compact',
    chrome: 'on',
    header: false,
    footerAuthors: true,
    pageNumber: true,
    accent: '#123456',
    variant: 'default',
    showChrome: true,
    showHeader: false,
  })

  assert.equal(config.resolvePresentation({
    deck,
    slide: {
      presentationChrome: 'off',
      chrome: 'on',
    },
    chrome: 'auto',
    variant: 'default',
  }).chrome, 'auto')
})

test('invalid higher-priority input inherits the next valid candidate', () => {
  const resolved = config.resolvePresentation({
    deck: {
      preset: 'ucas',
      density: 'relaxed',
      chrome: 'on',
      header: true,
      footerAuthors: false,
      pageNumber: false,
    },
    slide: {
      presentationPreset: 'unsupported',
      presentationDensity: 'dense',
      presentationChrome: 'sometimes',
      chrome: 'off',
      presentationHeader: 'maybe',
      header: 'false',
      footerAuthors: 'no',
      pageNumber: 'yes',
    },
    chrome: 'invalid',
    variant: 'intro',
  })

  assert.deepEqual(resolved, {
    preset: 'ucas',
    density: 'relaxed',
    chrome: 'off',
    header: false,
    footerAuthors: false,
    pageNumber: false,
    accent: null,
    variant: 'intro',
    showChrome: false,
    showHeader: false,
  })
})

test('accent validation and local → deck → preset fallback are first-valid', () => {
  const supported = new Set([
    'rebeccapurple',
    'oklch(60% 0.2 20)',
    'color-mix(in srgb, currentColor 70%, #5b4fc4)',
  ])
  const supportsColor = value => supported.has(value)

  assert.equal(config.normalizeAccent(' rebeccapurple ', supportsColor), 'rebeccapurple')
  assert.equal(config.normalizeAccent('not-a-color', supportsColor), undefined)
  assert.equal(config.normalizeAccent('', supportsColor), undefined)
  assert.equal(config.normalizeAccent(42, supportsColor), undefined)

  for (const value of [
    'blue',
    '#345f8f',
    'rgb(20 40 60)',
    'hsl(210 50% 40%)',
    'oklch(60% 0.2 20)',
    'color(display-p3 0.2 0.4 0.8)',
    'color-mix(in srgb, currentColor 70%, #5b4fc4)',
    'var(--authored-accent)',
  ]) {
    assert.equal(config.normalizeAccent(value), value, value)
  }

  assert.equal(config.resolvePresentation({
    deck: { accent: 'oklch(60% 0.2 20)' },
    slide: { accent: 'rebeccapurple' },
    variant: 'default',
    supportsColor,
  }).accent, 'rebeccapurple')

  for (const accent of [undefined, '', 'not-a-color', 42]) {
    assert.equal(config.resolvePresentation({
      deck: { accent: 'oklch(60% 0.2 20)' },
      slide: { accent },
      variant: 'default',
      supportsColor,
    }).accent, 'oklch(60% 0.2 20)')
  }

  assert.equal(config.resolvePresentation({
    deck: { accent: 'not-a-color' },
    slide: { accent: '' },
    variant: 'default',
    supportsColor,
  }).accent, null)

  assert.equal(config.resolvePresentation({
    deck: { accent: 'rebeccapurple' },
    slide: {
      accent: 'rebeccapurple',
      presentationAccent: 'oklch(60% 0.2 20)',
    },
    variant: 'default',
    supportsColor,
  }).accent, 'rebeccapurple')
})

test('app setup remains deck-only while the shared frame owns local accent scope', async () => {
  const [setupSource, frameSource] = await Promise.all([
    readFile(resolve(repositoryRoot, 'setup/main.ts'), 'utf8'),
    readFile(resolve(repositoryRoot, 'components/SlideFrame.vue'), 'utf8'),
  ])

  assert.match(setupSource, /resolveDeckPresentation/)
  assert.doesNotMatch(
    setupSource,
    /\$frontmatter|useSlideContext|currentPage|nav\.|afterEach|onAfterRoute/,
  )
  assert.match(frameSource, /slide:\s*frontmatter\.value/)
  assert.match(frameSource, /--presentation-accent/)
  assert.match(frameSource, /--slidev-theme-primary/)
})

test('derived chrome and header behavior covers every frame variant', () => {
  for (const variant of config.FRAME_VARIANTS) {
    const auto = config.resolvePresentation({
      deck: { chrome: 'auto', header: true },
      variant,
    })
    const expectedChrome = !['cover', 'section', 'closing'].includes(variant)
    assert.equal(auto.showChrome, expectedChrome, variant)
    assert.equal(auto.showHeader, expectedChrome, variant)

    const forcedOn = config.resolvePresentation({
      deck: { chrome: 'on', header: true },
      variant,
    })
    assert.equal(forcedOn.showChrome, true, variant)
    assert.equal(forcedOn.showHeader, true, variant)

    const forcedOff = config.resolvePresentation({
      deck: { chrome: 'off', header: true },
      variant,
    })
    assert.equal(forcedOff.showChrome, false, variant)
    assert.equal(forcedOff.showHeader, false, variant)
  }

  assert.equal(config.normalizeFrameVariant('closing'), 'closing')
  assert.equal(config.normalizeFrameVariant('image-text'), 'image-text')
  assert.equal(config.normalizeFrameVariant('code'), 'code')
  assert.equal(config.normalizeFrameVariant('unsupported'), undefined)
})

const sourceFiles = async (directory) => {
  const entries = await readdir(resolve(repositoryRoot, directory), {
    recursive: true,
    withFileTypes: true,
  })
  return entries
    .filter(entry => entry.isFile() && /\.(?:ts|vue)$/.test(entry.name))
    .map(entry => resolve(entry.parentPath, entry.name))
    .sort()
}

test('presentation types, defaults, and normalizers have one source authority', async () => {
  const canonicalPath = resolve(repositoryRoot, 'setup/presentation-config.ts')
  const files = [
    ...await sourceFiles('components'),
    ...await sourceFiles('internals'),
    ...await sourceFiles('layouts'),
    ...await sourceFiles('setup'),
  ]
  const duplicatePatterns = [
    {
      label: 'preset literal union',
      expression: /['"]default['"]\s*\|\s*['"]ucas['"]\s*\|\s*['"]ict['"]/,
    },
    {
      label: 'density literal union',
      expression: /['"]compact['"]\s*\|\s*['"]normal['"]\s*\|\s*['"]relaxed['"]/,
    },
    {
      label: 'chrome literal union',
      expression: /['"]auto['"]\s*\|\s*['"]on['"]\s*\|\s*['"]off['"]/,
    },
    {
      label: 'presentation defaults declaration',
      expression: /\b(?:const|let|var)\s+PRESENTATION_DEFAULTS\b/,
    },
    {
      label: 'presentation option declaration',
      expression: /\b(?:const|let|var)\s+PRESENTATION_OPTIONS\b/,
    },
    {
      label: 'normalizer declaration',
      expression: /\b(?:const|function)\s+normalize(?:Preset|Density|Chrome|Boolean|Accent)\b/,
    },
  ]

  for (const file of files) {
    if (file === canonicalPath) continue
    const source = await readFile(file, 'utf8')
    for (const pattern of duplicatePatterns) {
      assert.doesNotMatch(
        source,
        pattern.expression,
        `${relative(repositoryRoot, file)} duplicates ${pattern.label}`,
      )
    }
  }

  const canonical = await readFile(canonicalPath, 'utf8')
  for (const name of [
    'PRESENTATION_PRESETS',
    'PRESENTATION_DENSITIES',
    'PRESENTATION_CHROME_VALUES',
    'PRESENTATION_OPTIONS',
    'PRESENTATION_DEFAULTS',
    'normalizePreset',
    'normalizeDensity',
    'normalizeChrome',
    'normalizeBoolean',
    'normalizeAccent',
    'resolvePresentation',
  ]) {
    assert.match(canonical, new RegExp(`\\b${name}\\b`), name)
  }
})

test('only the shared frame resolves presentation state and owns preset attributes', async () => {
  const layoutFiles = await sourceFiles('layouts')
  const delegatedLayouts = new Map([
    ['layouts/end.vue', 'ClosingLayout'],
    ['layouts/image-left.vue', 'ImageTextLayout'],
    ['layouts/image-right.vue', 'ImageTextLayout'],
  ])
  for (const file of layoutFiles) {
    const source = await readFile(file, 'utf8')
    const name = relative(repositoryRoot, file)
    if (name === 'layouts/thanks.vue') {
      assert.match(source, /import\s+EndLayout\s+from\s+['"]\.\/end\.vue['"]/)
      assert.match(source, /<EndLayout\b/)
      assert.doesNotMatch(
        source,
        /defineProps|<SlideFrame|ClosingLayout|presentation-closing/,
      )
      continue
    }
    const delegate = delegatedLayouts.get(name)
    if (delegate) {
      assert.match(
        source,
        new RegExp(`import\\s+${delegate}\\s+from`),
        `${name}: shared internal import`,
      )
      assert.match(source, new RegExp(`<${delegate}\\b`), `${name}: internal usage`)
    } else {
      assert.match(source, /import\s+SlideFrame\s+from/, `${name}: shared frame import`)
      assert.match(source, /<SlideFrame\b/, `${name}: shared frame usage`)
    }
    assert.doesNotMatch(source, /\bresolvePresentation\s*\(/, `${name}: local resolver`)
    assert.doesNotMatch(source, /themeConfig\??\.presentation/, `${name}: deck resolution`)
    assert.doesNotMatch(source, /data-presentation-(?:preset|density)/, `${name}: state ownership`)
  }

  for (const [path, expectedVariant] of [
    ['internals/ClosingLayout.vue', 'closing'],
    ['internals/ImageTextLayout.vue', 'image-text'],
  ]) {
    const source = await readFile(resolve(repositoryRoot, path), 'utf8')
    assert.match(source, /import\s+SlideFrame\s+from/, `${path}: frame import`)
    assert.match(source, /<SlideFrame\b/, `${path}: frame usage`)
    assert.match(source, new RegExp(`variant=["']${expectedVariant}["']`))
  }

  const componentFiles = await sourceFiles('components')
  const resolverOwners = []
  const attributeOwners = []
  for (const file of componentFiles) {
    const source = await readFile(file, 'utf8')
    if (/\bresolvePresentation\s*\(/.test(source)) resolverOwners.push(relative(repositoryRoot, file))
    if (/data-presentation-(?:preset|density)/.test(source)) {
      attributeOwners.push(relative(repositoryRoot, file))
    }
  }
  assert.deepEqual(resolverOwners, ['components/SlideFrame.vue'])
  assert.deepEqual(attributeOwners, ['components/SlideFrame.vue'])
})

test('package metadata has no duplicate presentation defaults', async () => {
  const packageJson = JSON.parse(
    await readFile(resolve(repositoryRoot, 'package.json'), 'utf8'),
  )
  assert.equal(packageJson.slidev?.themeConfig, undefined)
  assert.equal(packageJson.slidev?.defaults?.themeConfig, undefined)
  assert.equal(packageJson.themeConfig, undefined)
  assert.deepEqual(
    Object.keys(packageJson.dependencies).sort(),
    ['@slidev/client', '@slidev/types', 'slidev-pane'],
  )
})

test('README mirrors the canonical deck and slide configuration contract', async () => {
  const readme = await readFile(resolve(repositoryRoot, 'README.md'), 'utf8')
  const perSlideSection = readme.match(
    /Per-slide overrides:[\s\S]*?(?=\n## |\n`themeConfig`)/,
  )?.[0] ?? ''

  for (const [key, values, defaultValue] of [
    ['preset', '`default`, `ucas`, `ict`', '`default`'],
    ['accent', 'Any CSS color', 'theme default'],
    ['density', '`compact`, `normal`, `relaxed`', '`normal`'],
    ['chrome', '`auto`, `on`, `off`', '`auto`'],
    ['header', '`true`, `false`', '`false`'],
    ['footerAuthors', '`true`, `false`', '`true`'],
    ['pageNumber', '`true`, `false`', '`true`'],
  ]) {
    const row = `| \`${key}\` | ${values} | ${defaultValue} |`
    assert.ok(readme.includes(row), `README deck row drift: ${key}`)
  }

  for (const key of [
    'presentationPreset',
    'presentationDensity',
    'presentationChrome',
    'chrome',
    'presentationHeader',
    'header',
    'footerAuthors',
    'pageNumber',
    'footer',
  ]) {
    assert.match(
      perSlideSection,
      new RegExp(`\\| \\\`${key}\\\` \\|`),
      `README per-slide row drift: ${key}`,
    )
  }

  for (const phrase of [
    'first valid',
    'textual booleans',
    '`true`',
    '`false`',
    '`on`',
    '`off`',
    'no migration',
    'pnpm run assets:optimize',
    'pnpm run assets:check',
    'pnpm run quality',
    'pnpm run quality:update-baselines',
    '300 seconds',
  ]) {
    assert.ok(
      readme.toLowerCase().includes(phrase.toLowerCase()),
      `README is missing contract phrase: ${phrase}`,
    )
  }
})
