<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { resolveDeckAuthors } from '../setup/authors'

const { $slidev } = useSlideContext()
const configs = computed(() => (($slidev.configs ?? {}) as Record<string, unknown>))
const authors = computed(() => resolveDeckAuthors(configs.value))
</script>

<template>
  <ul v-if="authors.length" class="presentation-authors">
    <li
      v-for="author in authors"
      :key="author.sourceIndex"
      class="presentation-author"
    >
      <div class="presentation-author__name">
        {{ author.name }}
      </div>
      <div v-if="author.institution" class="presentation-author__institution">
        {{ author.institution }}
      </div>
      <a
        v-if="author.emailHref"
        class="presentation-author__email"
        :href="author.emailHref"
      >
        {{ author.email }}
      </a>
      <div
        v-else-if="author.email"
        class="presentation-author__email presentation-author__email--invalid"
      >
        {{ author.email }}
      </div>
    </li>
  </ul>
</template>

<style src="../styles/components.css"></style>
