<script setup lang="ts">
import { computed } from 'vue'
import {
  normalizeSemanticFamily,
} from '../setup/callouts'
import type { SemanticFamily } from '../setup/callouts'
import { normalizeBoolean } from '../setup/presentation-config'

const props = withDefaults(defineProps<{
  marker?: boolean | string
  tone?: SemanticFamily | string
}>(), {
  marker: false,
  tone: 'neutral',
})

const tone = computed(() => normalizeSemanticFamily(props.tone))
const marker = computed(() => normalizeBoolean(props.marker) ?? false)
const classes = computed(() => [
  'presentation-badge',
  `presentation-badge--${tone.value}`,
])
</script>

<template>
  <span
    :class="classes"
    :data-badge-marker="marker ? 'true' : 'false'"
    :data-badge-tone="tone"
  >
    <span
      v-if="marker"
      class="presentation-badge__marker"
      aria-hidden="true"
    />
    <span class="presentation-badge__content"><slot /></span>
  </span>
</template>
