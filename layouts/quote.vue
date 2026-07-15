<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'

defineProps<{
  title?: string
  subtitle?: string
  author?: string
  source?: string
  cite?: string
  chrome?: ChromeSetting
}>()
</script>

<template>
  <div class="slidev-layout quote">
    <SlideFrame variant="quote" :title="title" :subtitle="subtitle" :chrome="chrome">
      <figure class="slide-layout-quote">
        <div class="slide-layout-quote__content">
          <slot />
        </div>
        <div v-if="author || source || cite" class="slide-layout-quote__meta">
          <div v-if="author || cite" class="slide-layout-quote__author">{{ author ?? cite }}</div>
          <div v-if="source" class="slide-layout-quote__source">{{ source }}</div>
        </div>
      </figure>
    </SlideFrame>
  </div>
</template>
