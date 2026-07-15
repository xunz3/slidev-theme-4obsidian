<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'

defineProps<{
  title?: string
  subtitle?: string
  chrome?: ChromeSetting
}>()
</script>

<template>
  <div class="slidev-layout default">
    <SlideFrame variant="default" :title="title" :subtitle="subtitle" :chrome="chrome">
      <slot />
    </SlideFrame>
  </div>
</template>
