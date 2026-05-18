<script setup lang="ts">
import ObsidianFrame from '../components/ObsidianFrame.vue'
import { computed } from 'vue'

type ChromeSetting = 'auto' | 'on' | 'off'

const props = defineProps({
  background: {
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
  <div class="slidev-layout cover" :style="style">
    <ObsidianFrame variant="cover" :chrome="chrome">
      <slot />
    </ObsidianFrame>
  </div>
</template>
