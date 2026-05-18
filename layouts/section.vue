<script setup lang="ts">
import ObsidianFrame from '../components/ObsidianFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'

defineProps<{
  title?: string
  subtitle?: string
  chrome?: ChromeSetting
}>()
</script>

<template>
  <div class="slidev-layout section">
    <ObsidianFrame variant="section" :title="title" :subtitle="subtitle" :chrome="chrome">
      <div class="obsidian-layout-section">
        <slot />
      </div>
    </ObsidianFrame>
  </div>
</template>
