<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'
import type { PresentationChrome } from '../setup/presentation-config'

defineProps<{
  title?: string
  subtitle?: string
  author?: string
  source?: string
  cite?: string
  chrome?: PresentationChrome
}>()
</script>

<template>
  <SlideFrame variant="quote" :title="title" :subtitle="subtitle" :chrome="chrome">
    <figure class="slide-layout-quote">
      <div class="slide-layout-quote__content">
        <slot />
      </div>
      <figcaption v-if="author || source || cite" class="slide-layout-quote__meta">
        <cite v-if="author || cite" class="slide-layout-quote__author">{{ author ?? cite }}</cite>
        <span v-if="source" class="slide-layout-quote__source">{{ source }}</span>
      </figcaption>
    </figure>
  </SlideFrame>
</template>
