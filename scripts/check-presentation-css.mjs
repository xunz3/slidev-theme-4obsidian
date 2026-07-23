#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const presetNames = ['default', 'ucas', 'ict']
const aggregatePath = resolve(repositoryRoot, 'styles/presets.css')
const errors = []

const requiredLightTokens = [
  '--slidev-theme-primary',
  '--presentation-accent',
  '--presentation-bg',
  '--presentation-bg-elevated',
  '--presentation-bg-muted',
  '--presentation-frame-bg',
  '--presentation-text',
  '--presentation-text-muted',
  '--presentation-border',
  '--presentation-border-strong',
  '--presentation-shadow',
  '--presentation-scrollbar-thumb',
  '--presentation-scrollbar-track',
  '--presentation-font-sans',
  '--presentation-font-serif',
  '--presentation-font-body',
  '--presentation-font-display',
  '--presentation-font-quote',
  '--presentation-font-label',
  '--presentation-font-mono',
  '--presentation-slide-padding',
  '--presentation-content-gap',
  '--presentation-body-size',
  '--presentation-body-line-height',
  '--presentation-list-spacing',
  '--presentation-heading-scale',
  '--presentation-heading-weight',
  '--presentation-heading-letter-spacing',
  '--presentation-heading-line-height',
  '--presentation-table-header-bg',
  '--presentation-table-row-alt-bg',
  '--presentation-code-bg',
  '--presentation-code-border',
  '--presentation-inline-code-bg',
  '--presentation-inline-code-border',
  '--presentation-inline-code-shadow',
  '--presentation-blockquote-bg',
  '--presentation-blockquote-border',
  '--presentation-blockquote-font-style',
  '--presentation-callout-bg',
  '--presentation-callout-border',
  '--presentation-callout-radius',
  '--presentation-callout-shadow',
  '--presentation-warning-bg',
  '--presentation-warning-border',
  '--presentation-warning-text',
  '--presentation-caption-font-style',
  '--presentation-caption-letter-spacing',
  '--presentation-media-max-height',
  '--presentation-media-radius',
  '--presentation-media-shadow',
  '--presentation-statement-size',
  '--presentation-quote-size',
  '--presentation-quote-line-height',
  '--presentation-reference-size',
]

const requiredDarkTokens = [
  '--slidev-theme-primary',
  '--presentation-bg',
  '--presentation-bg-elevated',
  '--presentation-bg-muted',
  '--presentation-frame-bg',
  '--presentation-text',
  '--presentation-text-muted',
  '--presentation-border',
  '--presentation-border-strong',
  '--presentation-code-bg',
  '--presentation-code-border',
  '--presentation-inline-code-bg',
  '--presentation-inline-code-border',
  '--presentation-blockquote-bg',
  '--presentation-blockquote-border',
  '--presentation-callout-bg',
  '--presentation-callout-border',
  '--presentation-warning-bg',
  '--presentation-warning-border',
  '--presentation-warning-text',
]

const requiredVisualSurfaces = [
  'h1',
  'table',
  'pre',
  'blockquote',
  '.obsidian-slidev-callout',
  '.obsidian-slidev-warning',
  '.obsidian-slidev-media__caption',
  '.slide-frame__header',
  '.slide-frame__footer',
]

const blocksForSelector = (css, selectorFragment) => {
  const blocks = []
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g
  for (const match of css.matchAll(blockPattern)) {
    if (match[1].includes(selectorFragment)) blocks.push(match[2])
  }
  return blocks.join('\n')
}

const firstBlockForSelector = (css, selectorFragment) => {
  const selectorOffset = css.indexOf(selectorFragment)
  if (selectorOffset < 0) return ''
  const openBrace = css.indexOf('{', selectorOffset)
  const closeBrace = css.indexOf('}', openBrace + 1)
  if (openBrace < 0 || closeBrace < 0) return ''
  return css.slice(openBrace + 1, closeBrace)
}

if (!existsSync(aggregatePath)) {
  errors.push('styles/presets.css is missing')
} else {
  const aggregate = readFileSync(aggregatePath, 'utf8')
  const expectedImports = presetNames.map(name => `@import "./presets/${name}.css";`)
  const actualImports = [...aggregate.matchAll(/@import\s+url\(["'](.+?)["']\);|@import\s+["'](.+?)["'];/g)]
    .map(match => `@import "${match[1] ?? match[2]}";`)

  if (actualImports.length !== expectedImports.length
    || actualImports.some((value, index) => value !== expectedImports[index])) {
    errors.push(`styles/presets.css must import only ${expectedImports.join(', ')} in that order`)
  }

  const withoutImports = aggregate
    .replace(/@import\s+(?:url\()?["'][^"']+["']\)?\s*;/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
  if (withoutImports) {
    errors.push('styles/presets.css must remain an import-only stable aggregate')
  }
}

for (const preset of presetNames) {
  const relativePath = `styles/presets/${preset}.css`
  const absolutePath = resolve(repositoryRoot, relativePath)
  if (!existsSync(absolutePath)) {
    errors.push(`${relativePath} is missing`)
    continue
  }

  const css = readFileSync(absolutePath, 'utf8')
  const anchor = `.slidev-layout[data-presentation-preset="${preset}"]`
  if (!css.includes(anchor)) {
    errors.push(`${relativePath} has no resolved local canvas anchor ${anchor}`)
  }

  if (/(?:^|,|\})\s*(?::root|html)(?:\.dark)?\[data-presentation-preset=/m.test(css)) {
    errors.push(`${relativePath} contains a root-authoritative preset selector`)
  }
  if (/(?:^|,|\})\s*body(?:\.[\w-]+)?\[data-presentation-preset=/m.test(css)
    || /\[data-presentation-preset=(?:"[^"]+"|'[^']+')\]\s+\.slidev-layout/.test(css)) {
    errors.push(`${relativePath} contains an ancestor-authoritative preset selector`)
  }
  if (/(?:^|,|\})\s*:root[^{]*\s+\.(?:slidev-layout|slide-frame)[^{]*\{/m.test(css)
    && css.includes('data-presentation-preset')) {
    errors.push(`${relativePath} contains a root-to-slide preset selector`)
  }
  if (css.includes('!important')) {
    errors.push(`${relativePath} contains an !important isolation patch`)
  }

  const lightBlock = blocksForSelector(css, anchor)
  const rootTokenBlock = firstBlockForSelector(css, anchor)
  for (const token of requiredLightTokens) {
    if (!lightBlock.includes(`${token}:`)) {
      errors.push(`${relativePath} is missing normal/light token ${token}`)
    }
    const declarationCount = [
      ...rootTokenBlock.matchAll(new RegExp(`${token.replaceAll('-', '\\-')}\\s*:`, 'g')),
    ].length
    if (declarationCount !== 1) {
      errors.push(
        `${relativePath} must declare ${token} exactly once in its root token set; found ${declarationCount}`,
      )
    }
  }

  const darkAnchor = `html.dark ${anchor}`
  const darkBlock = blocksForSelector(css, darkAnchor)
  for (const token of requiredDarkTokens) {
    if (!darkBlock.includes(`${token}:`)) {
      errors.push(`${relativePath} is missing dark token ${token}`)
    }
  }

  for (const density of ['compact', 'relaxed']) {
    const densityAnchor = `${anchor}[data-presentation-density="${density}"]`
    const densityBlock = blocksForSelector(css, densityAnchor)
    for (const token of [
      '--presentation-slide-padding',
      '--presentation-content-gap',
      '--presentation-body-size',
      '--presentation-list-spacing',
      '--presentation-statement-size',
      '--presentation-quote-size',
      '--presentation-reference-size',
    ]) {
      if (!densityBlock.includes(`${token}:`)) {
        errors.push(`${relativePath} is missing ${density} token ${token}`)
      }
    }
  }

  for (const surface of requiredVisualSurfaces) {
    if (!css.includes(surface)) {
      errors.push(`${relativePath} has no scoped visual rule for ${surface}`)
    }
  }

  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const target = match[1]
    if (/^(?:data:|https?:|#)/.test(target)) continue
    if (!existsSync(resolve(dirname(absolutePath), target))) {
      errors.push(`${relativePath} references missing local asset ${target}`)
    }
  }
}

for (const file of readdirSync(resolve(repositoryRoot, 'styles'))) {
  if (!file.endsWith('.css') || file === 'presets.css') continue
  const relativePath = `styles/${file}`
  const source = readFileSync(resolve(repositoryRoot, relativePath), 'utf8')
  if (source.includes('data-presentation-preset')) {
    errors.push(`${relativePath} contains preset rules outside styles/presets/`)
  }
}

for (const directory of ['components', 'layouts']) {
  const absoluteDirectory = resolve(repositoryRoot, directory)
  for (const file of readdirSync(absoluteDirectory)) {
    if (!file.endsWith('.vue')) continue
    const lowerName = file.toLowerCase()
    const presetSpecific = presetNames.some(preset => lowerName.includes(preset))
    const frameOrLayout = lowerName.includes('frame')
      || (directory === 'layouts' && lowerName !== 'default.vue')
    if (presetSpecific && frameOrLayout) {
      errors.push(`${directory}/${file} is a forbidden preset-specific frame/layout component`)
    }
  }
}

if (errors.length > 0) {
  console.error(`Presentation CSS architecture check failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log('Presentation CSS architecture check passed for default, UCAS, and ICT.')
}
