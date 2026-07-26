<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'
import type { PresentationChrome } from '../setup/presentation-config'

withDefaults(defineProps<{
  title?: string
  subtitle?: string
  chrome?: PresentationChrome | boolean
}>(), {
  chrome: undefined,
})
</script>

<template>
  <SlideFrame variant="statement" :title="title" :subtitle="subtitle" :chrome="chrome">
    <div class="slide-layout-statement">
      <slot />
    </div>
  </SlideFrame>
</template>
