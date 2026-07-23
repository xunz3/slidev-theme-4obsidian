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
  <SlideFrame variant="section" :title="title" :subtitle="subtitle" :chrome="chrome">
    <div class="slide-layout-section">
      <slot />
    </div>
  </SlideFrame>
</template>
