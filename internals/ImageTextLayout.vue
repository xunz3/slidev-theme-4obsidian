<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import Figure from '../components/Figure.vue'
import SlideFrame from '../components/SlideFrame.vue'
import type { PresentationChrome } from '../setup/presentation-config'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  backgroundSize?: string
  caption?: string
  chrome?: PresentationChrome | boolean
  image?: string
  imageAlt?: string
  orientation: 'left' | 'right'
  subtitle?: string
  title?: string
}>(), {
  backgroundSize: 'cover',
})

const attrs = useAttrs()
const image = computed(() => (
  typeof props.image === 'string' ? props.image.trim() : ''
))
const fit = computed(() => (
  props.backgroundSize?.trim() === 'contain' ? 'contain' : 'cover'
))
</script>

<template>
  <SlideFrame
    :class="attrs.class"
    :chrome="props.chrome"
    :subtitle="props.subtitle"
    :title="props.title"
    variant="image-text"
  >
    <div
      class="presentation-image-text"
      :class="[
        `presentation-image-text--${props.orientation}`,
        { 'presentation-image-text--narrative-only': !image },
      ]"
      :data-background-size="props.backgroundSize"
      :data-orientation="props.orientation"
    >
      <div class="presentation-image-text__narrative">
        <slot />
      </div>
      <Figure
        v-if="image"
        class="presentation-image-text__figure"
        :src="image"
        :alt="props.imageAlt"
        :caption="props.caption"
        :fit="fit"
      />
    </div>
  </SlideFrame>
</template>

<style src="../styles/content-layouts.css"></style>
