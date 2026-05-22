<script setup lang="ts">
import ObsidianFrame from '../components/ObsidianFrame.vue'
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { formatAuthorDetails, normalizeAuthors } from '../setup/authors'

type ChromeSetting = 'auto' | 'on' | 'off'

const props = defineProps({
  background: {
    type: String,
    default: undefined,
  },
  chrome: {
    type: String as () => ChromeSetting,
    default: undefined,
  },
})

const { $slidev, $frontmatter } = useSlideContext()

const configs = computed(() => (($slidev.configs ?? {}) as Record<string, unknown>))
const frontmatter = computed(() => (($frontmatter.value ?? {}) as Record<string, unknown>))
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
  <div class="slidev-layout cover" :style="style">
    <ObsidianFrame variant="cover" :chrome="chrome">
      <div class="obsidian-cover" :class="{ 'obsidian-cover--has-title': title }">
        <div class="obsidian-cover__main">
          <h1 v-if="title" class="obsidian-cover__title">{{ title }}</h1>
          <div v-if="subtitle" class="obsidian-cover__subtitle">{{ subtitle }}</div>

          <div class="obsidian-cover__body">
            <slot />
          </div>
        </div>

        <div v-if="authors.length > 0" class="obsidian-cover__authors">
          <div v-for="(author, index) in authors" :key="`${author.name}-${author.email ?? index}`" class="obsidian-cover__author">
            <div class="obsidian-cover__author-name">{{ author.name }}</div>
            <div v-if="formatAuthorDetails(author)" class="obsidian-cover__author-details">
              {{ formatAuthorDetails(author) }}
            </div>
          </div>
        </div>
      </div>
    </ObsidianFrame>
  </div>
</template>
