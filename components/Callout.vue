<script setup lang="ts">
import { computed, useId } from 'vue'
import { resolveCallout } from '../setup/callouts'

const props = defineProps<{
  title?: string
  type?: string
}>()

const resolved = computed(() => resolveCallout(props.type, props.title))
const titleId = `presentation-callout-${useId().replaceAll(':', '')}`
const classes = computed(() => [
  'obsidian-slidev-callout',
  resolved.value.type
    ? `obsidian-slidev-callout--${resolved.value.type}`
    : null,
])
</script>

<template>
  <aside
    :class="classes"
    :data-callout="resolved.type ?? 'neutral'"
    :data-callout-family="resolved.family"
    role="note"
    :aria-labelledby="titleId"
  >
    <div :id="titleId" class="obsidian-slidev-callout__title">
      {{ resolved.title }}
    </div>
    <div class="obsidian-slidev-callout__content">
      <slot />
    </div>
  </aside>
</template>

<style src="../styles/components.css"></style>
