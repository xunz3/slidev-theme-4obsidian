<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { formatAuthorNames, normalizeAuthors } from '../setup/authors'

type ChromeSetting = 'auto' | 'on' | 'off'
type Preset = 'clean' | 'scholarly'
type Density = 'compact' | 'normal' | 'relaxed'
type FrameStyle = Record<string, string>

const props = withDefaults(defineProps<{
  variant?: string
  title?: string
  subtitle?: string
  chrome?: ChromeSetting
}>(), {
  variant: 'default',
})

const { $slidev, $frontmatter } = useSlideContext()

const configs = computed(() => (($slidev.configs ?? {}) as Record<string, any>))
const frontmatter = computed(() => (($frontmatter.value ?? {}) as Record<string, any>))
const obsidianConfig = computed(() => ((configs.value.themeConfig?.obsidian ?? {}) as Record<string, any>))

const normalizeChrome = (value: unknown): ChromeSetting | null => {
  if (value === true) return 'on'
  if (value === false) return 'off'
  if (value === 'auto' || value === 'on' || value === 'off') return value
  return null
}

const normalizePreset = (value: unknown): Preset => {
  return value === 'scholarly' ? 'scholarly' : 'clean'
}

const normalizeDensity = (value: unknown): Density => {
  if (value === 'compact' || value === 'relaxed') return value
  return 'normal'
}

const normalizeAccent = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeBoolean = (value: unknown): boolean => {
  return value === true || value === 'true' || value === 'on'
}

const resolvedPreset = computed(() => {
  return normalizePreset(frontmatter.value.obsidianPreset ?? obsidianConfig.value.preset)
})

const resolvedDensity = computed(() => {
  return normalizeDensity(frontmatter.value.obsidianDensity ?? obsidianConfig.value.density)
})

const frameStyle = computed<FrameStyle | undefined>(() => {
  const accent = normalizeAccent(obsidianConfig.value.accent)
  if (!accent) return undefined

  return {
    '--slidev-theme-primary': accent,
    '--obsidian-accent': accent,
  }
})

const showFooter = computed(() => {
  const local = normalizeChrome(props.chrome ?? frontmatter.value.obsidianChrome ?? frontmatter.value.chrome)
  if (local === 'on') return true
  if (local === 'off') return false

  const global = normalizeChrome(obsidianConfig.value.chrome)
  if (global === 'on') return true
  if (global === 'off') return false

  return props.variant !== 'cover' && props.variant !== 'section'
})

const showHeader = computed(() => {
  if (!showFooter.value) return false
  return normalizeBoolean(frontmatter.value.obsidianHeader ?? frontmatter.value.header ?? obsidianConfig.value.header)
})

const showPageNumber = computed(() => {
  if (frontmatter.value.pageNumber === false) return false
  return obsidianConfig.value.pageNumber !== false
})

const headerTitle = computed(() => {
  return props.title ?? frontmatter.value.title ?? ''
})

const headerSubtitle = computed(() => {
  return props.subtitle ?? frontmatter.value.subtitle ?? ''
})

const footerLeft = computed(() => {
  if (frontmatter.value.footerAuthors === false || obsidianConfig.value.footerAuthors === false) return ''

  const authors = normalizeAuthors(configs.value.authors)
  if (authors.length > 0) return formatAuthorNames(authors)

  return formatAuthorNames(normalizeAuthors(configs.value.author))
})

const footerMiddle = computed(() => {
  return frontmatter.value.footer ?? configs.value.footer ?? configs.value.title ?? configs.value.info ?? ''
})
</script>

<template>
  <div
    class="obsidian-frame"
    :class="[
      `obsidian-frame--${variant}`,
      {
        'obsidian-frame--chrome': showFooter,
        'obsidian-frame--header': showHeader,
      },
    ]"
    :data-obsidian-preset="resolvedPreset"
    :data-obsidian-density="resolvedDensity"
    :style="frameStyle"
  >
    <header v-if="showHeader" class="obsidian-frame__header">
      <div class="obsidian-frame__header-main">
        <div v-if="headerTitle" class="obsidian-frame__title">{{ headerTitle }}</div>
        <div v-if="headerSubtitle" class="obsidian-frame__subtitle">{{ headerSubtitle }}</div>
      </div>
      <div class="obsidian-frame__header-mark">Obsidian Slidev</div>
    </header>

    <main class="obsidian-frame__content">
      <slot />
    </main>

    <footer v-if="showFooter" class="obsidian-frame__footer">
      <div class="obsidian-frame__footer-left">{{ footerLeft }}</div>
      <div class="obsidian-frame__footer-middle">{{ footerMiddle }}</div>
      <div v-if="showPageNumber" class="obsidian-frame__page">
        {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
      </div>
    </footer>
  </div>
</template>
