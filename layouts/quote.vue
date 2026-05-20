<script setup lang="ts">
import ObsidianFrame from '../components/ObsidianFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'

defineProps<{
  title?: string
  subtitle?: string
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
        <figcaption v-if="cite">{{ cite }}</figcaption>
      </figure>
    </ObsidianFrame>
  </div>
</template>
