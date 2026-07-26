<script setup lang="ts">
import Authors from '../components/Authors.vue'
import SlideFrame from '../components/SlideFrame.vue'
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import type { PresentationChrome } from '../setup/presentation-config'

const props = withDefaults(defineProps<{
  background?: string
  chrome?: PresentationChrome | boolean
}>(), {
  chrome: undefined,
})

const { $slidev, $frontmatter } = useSlideContext()

const configs = computed(() => (($slidev.configs ?? {}) as Record<string, unknown>))
// Slidev injects frontmatter as a reactive object, not a Ref.
const frontmatter = computed(() => ($frontmatter as Record<string, unknown>))
const title = computed(() => {
  const value = frontmatter.value.title ?? configs.value.title
  return typeof value === 'string' ? value.trim() : ''
})
const subtitle = computed(() => {
  const value = frontmatter.value.subtitle ?? configs.value.subtitle
  return typeof value === 'string' ? value.trim() : ''
})

const style = computed(() => {
  if (!props.background) return undefined

  return {
    background: `center / cover no-repeat url("${props.background}")`,
  }
})
</script>

<template>
  <SlideFrame variant="cover" :chrome="chrome" :canvas-style="style">
    <div class="slide-cover" :class="{ 'slide-cover--has-title': title }">
      <div class="slide-cover__main">
        <h1 v-if="title" class="slide-cover__title">{{ title }}</h1>
        <div v-if="subtitle" class="slide-cover__subtitle">{{ subtitle }}</div>

        <div class="slide-cover__body">
          <slot />
        </div>
      </div>

      <Authors variant="cover" />
    </div>
  </SlideFrame>
</template>
