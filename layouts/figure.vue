<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'
import type { PresentationChrome } from '../setup/presentation-config'

defineProps<{
  title?: string
  subtitle?: string
  chrome?: PresentationChrome
}>()
</script>

<template>
  <SlideFrame variant="figure" :title="title" :subtitle="subtitle" :chrome="chrome">
    <div class="slide-layout-figure">
      <slot />
    </div>
  </SlideFrame>
</template>
