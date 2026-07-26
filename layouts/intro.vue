<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'
import { computed } from 'vue'
import type { PresentationChrome } from '../setup/presentation-config'

const props = withDefaults(defineProps<{
  background?: string
  chrome?: PresentationChrome | boolean
  subtitle?: string
  title?: string
}>(), {
  chrome: undefined,
})

const style = computed(() => {
  if (!props.background) return undefined

  return {
    background: `center / cover no-repeat url("${props.background}")`,
  }
})
</script>

<template>
  <SlideFrame
    variant="intro"
    :title="title"
    :subtitle="subtitle"
    :chrome="chrome"
    :canvas-style="style"
  >
    <slot />
  </SlideFrame>
</template>
