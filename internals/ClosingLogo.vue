<script setup lang="ts">
import { useMediaLoadState } from '../setup/media'

const props = defineProps<{
  alt?: string
  src?: string
}>()

const {
  alternative,
  loadState,
  onError,
  onLoad,
  showFallback,
  showImage,
  source,
} = useMediaLoadState({
  alt: () => props.alt,
  fallback: () => 'Presentation logo',
  source: () => props.src,
})
</script>

<template>
  <div
    class="presentation-closing-logo"
    :data-logo-decorative="alternative.decorative ? 'true' : 'false'"
    :data-logo-state="loadState"
    data-stability-region="closing-logo"
  >
    <img
      v-if="showImage"
      :key="source"
      class="presentation-closing-logo__image"
      :src="source"
      :alt="alternative.resolvedAlt"
      :aria-hidden="alternative.decorative ? 'true' : undefined"
      decoding="async"
      loading="eager"
      @load="onLoad"
      @error="onError"
    >
    <div
      v-else-if="showFallback"
      class="presentation-closing-logo__fallback"
      role="img"
      :aria-label="alternative.resolvedAlt"
    >
      {{ alternative.resolvedAlt }}
    </div>
  </div>
</template>
