<script setup lang="ts">
import ObsidianFrame from '../components/ObsidianFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'

withDefaults(defineProps<{
  title?: string
  subtitle?: string
  chrome?: ChromeSetting
  gap?: string
  reverse?: boolean
}>(), {
  gap: '2.5rem',
  reverse: false,
})
</script>

<template>
  <div class="slidev-layout two-cols">
    <ObsidianFrame variant="two-cols" :title="title" :subtitle="subtitle" :chrome="chrome">
      <div
        class="obsidian-layout-two-cols"
        :class="{ 'obsidian-layout-two-cols--reverse': reverse }"
        :style="{ '--obsidian-two-cols-gap': gap }"
      >
        <div class="obsidian-layout-two-cols__pane">
          <slot />
        </div>
        <div class="obsidian-layout-two-cols__pane">
          <slot name="right" />
        </div>
      </div>
    </ObsidianFrame>
  </div>
</template>
