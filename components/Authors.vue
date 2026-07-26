<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { resolveDeckAuthors } from '../setup/authors'

const props = withDefaults(defineProps<{
  variant?: 'cards' | 'cover'
}>(), {
  variant: 'cards',
})

const { $slidev } = useSlideContext()
const configs = computed(() => (($slidev.configs ?? {}) as Record<string, unknown>))
const authors = computed(() => resolveDeckAuthors(configs.value))
const classes = computed(() => props.variant === 'cover'
  ? {
      collection: 'slide-cover__authors',
      email: 'slide-cover__author-email slide-cover__author-details',
      emailInvalid: 'slide-cover__author-email slide-cover__author-details',
      institution: 'slide-cover__author-institution slide-cover__author-details',
      item: 'slide-cover__author',
      primary: 'slide-cover__author-primary slide-cover__author-name',
    }
  : {
      collection: 'presentation-authors',
      email: 'presentation-author__email',
      emailInvalid: 'presentation-author__email presentation-author__email--invalid',
      institution: 'presentation-author__institution',
      item: 'presentation-author',
      primary: 'presentation-author__primary presentation-author__name',
    })
</script>

<template>
  <ul v-if="authors.length" :class="classes.collection">
    <li
      v-for="author in authors"
      :key="author.sourceIndex"
      :class="classes.item"
    >
      <a
        v-if="author.primaryHref"
        :class="classes.primary"
        :href="author.primaryHref"
      >
        {{ author.primary }}
      </a>
      <div
        v-else
        :class="classes.primary"
      >
        {{ author.primary }}
      </div>
      <div v-if="author.institution" :class="classes.institution">
        {{ author.institution }}
      </div>
      <a
        v-if="author.emailHref"
        :class="classes.email"
        :href="author.emailHref"
      >
        {{ author.email }}
      </a>
      <div
        v-else-if="author.email"
        :class="classes.emailInvalid"
      >
        {{ author.email }}
      </div>
    </li>
  </ul>
</template>
