<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { formatAuthorDetails, normalizeAuthors } from '../setup/authors'
import type { PresentationChrome } from '../setup/presentation-config'

const props = defineProps({
  background: {
    type: String,
    default: undefined,
  },
  chrome: {
    type: String as () => PresentationChrome,
    default: undefined,
  },
})

const { $slidev, $frontmatter } = useSlideContext()

const configs = computed(() => (($slidev.configs ?? {}) as Record<string, unknown>))
// Slidev injects frontmatter as a reactive object, not a Ref.
const frontmatter = computed(() => ($frontmatter as Record<string, unknown>))
const authors = computed(() => {
  const configuredAuthors = normalizeAuthors(configs.value.authors)
  return configuredAuthors.length > 0 ? configuredAuthors : normalizeAuthors(configs.value.author)
})
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

      <div v-if="authors.length > 0" class="slide-cover__authors">
        <div v-for="(author, index) in authors" :key="`${author.name}-${author.email ?? index}`" class="slide-cover__author">
          <div class="slide-cover__author-name">{{ author.name }}</div>
          <div v-if="formatAuthorDetails(author)" class="slide-cover__author-details">
            {{ formatAuthorDetails(author) }}
          </div>
        </div>
      </div>
    </div>
  </SlideFrame>
</template>
