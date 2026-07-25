<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type FigureFit = 'contain' | 'cover'
type LoadState = 'missing' | 'pending' | 'ready' | 'failed'

const props = defineProps<{
  alt?: string
  caption?: string
  fit?: FigureFit
  src?: string
}>()

const source = computed(() => (
  typeof props.src === 'string' ? props.src.trim() : ''
))
const caption = computed(() => (
  typeof props.caption === 'string' ? props.caption.trim() : ''
))
const decorative = computed(() => (
  props.alt !== undefined && props.alt.trim() === ''
))
const resolvedAlt = computed(() => {
  if (props.alt !== undefined) return props.alt.trim()
  return caption.value || 'Figure'
})
const resolvedFit = computed<FigureFit>(() => (
  props.fit === 'cover' ? 'cover' : 'contain'
))
const loadState = ref<LoadState>('missing')

watch(source, (value) => {
  loadState.value = value ? 'pending' : 'missing'
}, { immediate: true })

const onLoad = () => {
  loadState.value = 'ready'
}
const onError = () => {
  loadState.value = 'failed'
}
const showImage = computed(() => (
  Boolean(source.value) && loadState.value !== 'failed'
))
const showFallback = computed(() => (
  !decorative.value
  && (loadState.value === 'missing' || loadState.value === 'failed')
))
</script>

<template>
  <figure
    class="obsidian-slidev-media obsidian-slidev-media--image"
    :data-media-state="loadState"
  >
    <div
      class="obsidian-slidev-media__viewport"
      :data-media-fit="resolvedFit"
    >
      <img
        v-if="showImage"
        :key="source"
        class="obsidian-slidev-media__image obsidian-slidev-media__asset"
        :src="source"
        :alt="resolvedAlt"
        :aria-hidden="decorative ? 'true' : undefined"
        decoding="async"
        loading="eager"
        :style="{ objectFit: resolvedFit }"
        @load="onLoad"
        @error="onError"
      >
      <div
        v-else-if="showFallback"
        class="obsidian-slidev-media__fallback"
        role="img"
        :aria-label="resolvedAlt"
      >
        {{ resolvedAlt }}
      </div>
    </div>
    <figcaption v-if="caption" class="obsidian-slidev-media__caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style src="../styles/components.css"></style>
