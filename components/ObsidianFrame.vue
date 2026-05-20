<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

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

const showChrome = computed(() => {
  const local = normalizeChrome(props.chrome ?? frontmatter.value.obsidianChrome ?? frontmatter.value.chrome)
  if (local === 'on') return true
  if (local === 'off') return false

  const global = normalizeChrome(obsidianConfig.value.chrome)
  if (global === 'on') return true
  if (global === 'off') return false

  return props.variant !== 'cover' && props.variant !== 'section'
})

const showPageNumber = computed(() => {
  if (frontmatter.value.pageNumber === false) return false
  return obsidianConfig.value.pageNumber !== false
})

const headerTitle = computed(() => {
  return props.title ?? frontmatter.value.title ?? configs.value.title ?? ''
})

const headerSubtitle = computed(() => {
  return props.subtitle ?? frontmatter.value.subtitle ?? ''
})

const footerLeft = computed(() => {
  if (frontmatter.value.footerLeft) return frontmatter.value.footerLeft
  if (configs.value.footerLeft) return configs.value.footerLeft
  if (configs.value.author) return configs.value.author

  const authors = configs.value.authors
  if (Array.isArray(authors) && authors.length > 0) {
    const first = authors[0]
    return typeof first === 'string' ? first : first?.name ?? ''
  }

  return ''
})

const footerMiddle = computed(() => {
  return frontmatter.value.footerMiddle ?? configs.value.footerMiddle ?? configs.value.title ?? frontmatter.value.title ?? configs.value.info ?? ''
})
</script>

<template>
  <div
    class="obsidian-frame"
    :class="[
      `obsidian-frame--${variant}`,
      { 'obsidian-frame--chrome': showChrome },
    ]"
    :data-obsidian-preset="resolvedPreset"
    :data-obsidian-density="resolvedDensity"
    :style="frameStyle"
  >
    <header v-if="showChrome" class="obsidian-frame__header">
      <div class="obsidian-frame__header-main">
        <div v-if="headerTitle" class="obsidian-frame__title">{{ headerTitle }}</div>
        <div v-if="headerSubtitle" class="obsidian-frame__subtitle">{{ headerSubtitle }}</div>
      </div>
      <div class="obsidian-frame__header-mark">Obsidian Slidev</div>
    </header>

    <main class="obsidian-frame__content">
      <slot />
    </main>

    <footer v-if="showChrome" class="obsidian-frame__footer">
      <div class="obsidian-frame__footer-left">{{ footerLeft }}</div>
      <div class="obsidian-frame__footer-middle">{{ footerMiddle }}</div>
      <div v-if="showPageNumber" class="obsidian-frame__page">
        {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
      </div>
    </footer>
  </div>
</template>
