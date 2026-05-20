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
  <div class="slidev-layout references">
    <ObsidianFrame variant="references" :title="title" :subtitle="subtitle" :chrome="chrome">
      <div class="obsidian-layout-references">
        <slot />
      </div>
    </ObsidianFrame>
  </div>
</template>
