<script setup lang="ts">
import ObsidianFrame from '../components/ObsidianFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'

defineProps<{
  title?: string
  subtitle?: string
  author?: string
  source?: string
  cite?: string
  chrome?: ChromeSetting
}>()
</script>

<template>
  <div class="slidev-layout quote">
    <ObsidianFrame variant="quote" :title="title" :subtitle="subtitle" :chrome="chrome">
      <figure class="obsidian-layout-quote">
        <blockquote>
          <slot />
        </blockquote>
        <div v-if="author || source || cite" class="obsidian-layout-quote__meta">
          <div v-if="author || cite" class="obsidian-layout-quote__author">{{ author ?? cite }}</div>
          <div v-if="source" class="obsidian-layout-quote__source">{{ source }}</div>
        </div>
      </figure>
    </ObsidianFrame>
  </div>
</template>
