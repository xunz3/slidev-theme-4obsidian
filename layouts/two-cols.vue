<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'

withDefaults(defineProps<{
  title?: string
  subtitle?: string
  chrome?: ChromeSetting
  gap?: string
  reverse?: boolean
}>(), {
  gap: '2.5rem',
  reverse: false,
})
</script>

<template>
  <div class="slidev-layout two-cols">
    <SlideFrame variant="two-cols" :title="title" :subtitle="subtitle" :chrome="chrome">
      <div
        class="slide-layout-two-cols"
        :class="{ 'slide-layout-two-cols--reverse': reverse }"
        :style="{ '--presentation-two-cols-gap': gap }"
      >
        <div class="slide-layout-two-cols__pane">
          <slot />
        </div>
        <div class="slide-layout-two-cols__pane">
          <slot name="right" />
        </div>
      </div>
    </SlideFrame>
  </div>
</template>
