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
  <div class="slidev-layout center">
    <SlideFrame variant="center" :title="title" :subtitle="subtitle" :chrome="chrome">
      <div class="slide-layout-center">
        <slot />
      </div>
    </SlideFrame>
  </div>
</template>
