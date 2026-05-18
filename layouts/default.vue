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
  <div class="slidev-layout default">
    <ObsidianFrame variant="default" :title="title" :subtitle="subtitle" :chrome="chrome">
      <slot />
    </ObsidianFrame>
  </div>
</template>
