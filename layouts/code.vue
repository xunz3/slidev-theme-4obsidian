<script setup lang="ts">
import { useAttrs } from 'vue'
import SlideFrame from '../components/SlideFrame.vue'
import type { PresentationChrome } from '../setup/presentation-config'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  chrome?: PresentationChrome | boolean
  subtitle?: string
  title?: string
}>()

const attrs = useAttrs()
</script>

<template>
  <SlideFrame
    :class="attrs.class"
    :chrome="props.chrome"
    :subtitle="props.subtitle"
    :title="props.title"
    variant="code"
  >
    <div class="presentation-code-layout">
      <slot />
    </div>
  </SlideFrame>
</template>

<style src="../styles/content-layouts.css"></style>
