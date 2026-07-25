<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Authors from '../components/Authors.vue'
import Figure from '../components/Figure.vue'
import SlideFrame from '../components/SlideFrame.vue'
import {
  isActionableEmail,
  resolveDeckAuthors,
} from '../setup/authors'
import type { PresentationChrome } from '../setup/presentation-config'

const props = withDefaults(defineProps<{
  chrome?: PresentationChrome | boolean
  contact?: string
  logo?: string
  logoAlt?: string
  showAuthors?: boolean
  subtitle?: string
  title?: string
}>(), {
  showAuthors: false,
})

const { $slidev } = useSlideContext()
const configs = computed(() => (($slidev.configs ?? {}) as Record<string, unknown>))
const contact = computed(() => (
  typeof props.contact === 'string' ? props.contact.trim() : ''
))
const contactHref = computed(() => (
  isActionableEmail(contact.value) ? `mailto:${contact.value}` : null
))
const logo = computed(() => (
  typeof props.logo === 'string' ? props.logo.trim() : ''
))
const logoAlt = computed(() => (
  props.logoAlt === undefined ? 'Presentation logo' : props.logoAlt.trim()
))
const showAuthorCollection = computed(() => (
  props.showAuthors && resolveDeckAuthors(configs.value).length > 0
))
</script>

<template>
  <SlideFrame
    :chrome="props.chrome"
    :subtitle="props.subtitle"
    :title="props.title"
    variant="closing"
  >
    <div class="presentation-closing">
      <div class="presentation-closing__message">
        <slot />
      </div>
      <a
        v-if="contact && contactHref"
        class="presentation-closing__contact"
        :href="contactHref"
      >
        {{ contact }}
      </a>
      <div v-else-if="contact" class="presentation-closing__contact">
        {{ contact }}
      </div>
      <div
        v-if="showAuthorCollection"
        class="presentation-closing__authors"
      >
        <Authors />
      </div>
      <Figure
        v-if="logo"
        class="presentation-closing__logo"
        :src="logo"
        :alt="logoAlt"
        fit="contain"
      />
    </div>
  </SlideFrame>
</template>

<style src="../styles/content-layouts.css"></style>
