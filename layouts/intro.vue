<script setup lang="ts">
import SlideFrame from '../components/SlideFrame.vue'
import { computed } from 'vue'

type ChromeSetting = 'auto' | 'on' | 'off'

const props = defineProps({
  background: {
    type: String,
    default: undefined,
  },
  title: {
    type: String,
    default: undefined,
  },
  subtitle: {
    type: String,
    default: undefined,
  },
  chrome: {
    type: String as () => ChromeSetting,
    default: undefined,
  },
})

const style = computed(() => {
  if (!props.background) return undefined

  return {
    background: `center / cover no-repeat url("${props.background}")`,
  }
})
</script>

<template>
  <div class="slidev-layout intro" :style="style">
    <SlideFrame variant="intro" :title="title" :subtitle="subtitle" :chrome="chrome">
      <slot />
    </SlideFrame>
  </div>
</template>
