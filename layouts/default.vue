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
  <SlideFrame variant="default" :title="title" :subtitle="subtitle" :chrome="chrome">
    <slot />
  </SlideFrame>
</template>
