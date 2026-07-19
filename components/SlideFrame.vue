<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { formatAuthorNames, normalizeAuthors } from '../setup/authors'
import ucasEmblem from '../assets/UCAS/emblem.svg'
import ucasEmblemWhite from '../assets/UCAS/emblem-white.png'
import ucasWordmark from '../assets/UCAS/emblem-name-bilingual-hz.svg'
import ucasWordmarkWhite from '../assets/UCAS/emblem-name-bilingual-hz-white.png'
import ucasVerticalWordmark from '../assets/UCAS/emblem-name-bilingual-vt-white.png'
import ictEmblem from '../assets/ICT/emblem.svg'
import ictWordmark from '../assets/ICT/emblem-name-bilingual-stacked.svg'

type ChromeSetting = 'auto' | 'on' | 'off'
type Preset = 'default' | 'ucas' | 'ict'
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
// Slidev injects frontmatter as a reactive object, not a Ref.
const frontmatter = computed(() => ($frontmatter as Record<string, any>))
const presentationConfig = computed(() => (
  (configs.value.themeConfig?.presentation ?? {}) as Record<string, any>
))

const normalizeChrome = (value: unknown): ChromeSetting | null => {
  if (value === true) return 'on'
  if (value === false) return 'off'
  if (value === 'auto' || value === 'on' || value === 'off') return value
  return null
}

const normalizePreset = (value: unknown): Preset => {
  if (value === 'default' || value === 'ucas' || value === 'ict') return value
  return 'default'
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
  return normalizePreset(
    frontmatter.value.presentationPreset
      ?? presentationConfig.value.preset,
  )
})

const resolvedDensity = computed(() => {
  return normalizeDensity(
    frontmatter.value.presentationDensity
      ?? presentationConfig.value.density,
  )
})

const frameStyle = computed<FrameStyle | undefined>(() => {
  const accent = normalizeAccent(presentationConfig.value.accent)
  if (!accent) return undefined

  return {
    '--slidev-theme-primary': accent,
    '--presentation-accent': accent,
  }
})

const showFooter = computed(() => {
  const local = normalizeChrome(
    props.chrome
      ?? frontmatter.value.presentationChrome
      ?? frontmatter.value.chrome,
  )
  if (local === 'on') return true
  if (local === 'off') return false

  const global = normalizeChrome(presentationConfig.value.chrome)
  if (global === 'on') return true
  if (global === 'off') return false

  return props.variant !== 'cover' && props.variant !== 'section'
})

const showHeader = computed(() => {
  if (!showFooter.value) return false
  return normalizeBoolean(
    frontmatter.value.presentationHeader
      ?? frontmatter.value.header
      ?? presentationConfig.value.header,
  )
})

const showPageNumber = computed(() => {
  if (frontmatter.value.pageNumber === false) return false
  return presentationConfig.value.pageNumber !== false
})

const headerTitle = computed(() => {
  const value = frontmatter.value.title ?? props.title
  return typeof value === 'string' ? value.trim() : ''
})

const headerSubtitle = computed(() => {
  const value = frontmatter.value.subtitle ?? props.subtitle
  return typeof value === 'string' ? value.trim() : ''
})

const footerLeft = computed(() => {
  if (frontmatter.value.footerAuthors === false || presentationConfig.value.footerAuthors === false) return ''

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
    class="slide-frame"
    :class="[
      `slide-frame--${variant}`,
      {
        'slide-frame--chrome': showFooter,
        'slide-frame--header': showHeader,
      },
    ]"
    :data-presentation-preset="resolvedPreset"
    :data-presentation-density="resolvedDensity"
    :style="frameStyle"
  >
    <aside v-if="resolvedPreset === 'ucas' && variant === 'cover'" class="slide-frame__ucas-rail" aria-hidden="true">
      <img class="slide-frame__ucas-rail-brand" :src="ucasVerticalWordmark" alt="" />
    </aside>

    <img
      v-if="resolvedPreset === 'ict' && variant === 'cover'"
      class="slide-frame__ict-lockup"
      :src="ictWordmark"
      alt="Institute of Computing Technology, Chinese Academy of Sciences"
    />

    <img
      v-if="resolvedPreset === 'ict' && variant !== 'cover'"
      class="slide-frame__ict-mark"
      :src="ictEmblem"
      alt=""
      aria-hidden="true"
    />

    <img
      v-if="resolvedPreset === 'ict'"
      class="slide-frame__ict-watermark"
      :src="ictEmblem"
      alt=""
      aria-hidden="true"
    />

    <template v-if="resolvedPreset === 'ucas' && variant !== 'cover'">
      <img
        class="slide-frame__ucas-wordmark slide-frame__ucas-wordmark--theme-light"
        :src="variant === 'section' ? ucasWordmarkWhite : ucasWordmark"
        alt=""
        aria-hidden="true"
      />
      <img
        class="slide-frame__ucas-wordmark slide-frame__ucas-wordmark--theme-dark"
        :src="ucasWordmarkWhite"
        alt=""
        aria-hidden="true"
      />
    </template>

    <img
      v-if="resolvedPreset === 'ucas'"
      class="slide-frame__ucas-watermark"
      :src="variant === 'section' ? ucasEmblemWhite : ucasEmblem"
      alt=""
      aria-hidden="true"
    />

    <header v-if="showHeader" class="slide-frame__header">
      <div class="slide-frame__header-main">
        <div v-if="headerTitle" class="slide-frame__title">{{ headerTitle }}</div>
        <div v-if="headerSubtitle" class="slide-frame__subtitle">{{ headerSubtitle }}</div>
      </div>
      <template v-if="resolvedPreset === 'ucas'">
        <img
          class="slide-frame__header-logo slide-frame__header-logo--theme-light"
          :src="ucasWordmark"
          alt=""
          aria-hidden="true"
        />
        <img
          class="slide-frame__header-logo slide-frame__header-logo--theme-dark"
          :src="ucasWordmarkWhite"
          alt=""
          aria-hidden="true"
        />
      </template>
      <img
        v-else-if="resolvedPreset === 'ict'"
        class="slide-frame__header-logo slide-frame__header-logo--ict"
        :src="ictEmblem"
        alt=""
        aria-hidden="true"
      />
    </header>

    <main class="slide-frame__content">
      <slot />
    </main>

    <footer v-if="showFooter" class="slide-frame__footer">
      <div class="slide-frame__footer-left">{{ footerLeft }}</div>
      <div class="slide-frame__footer-middle">{{ footerMiddle }}</div>
      <div v-if="showPageNumber" class="slide-frame__page">
        {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
      </div>
    </footer>
  </div>
</template>
