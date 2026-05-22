<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import ObsidianFrame from '../components/ObsidianFrame.vue'

type ChromeSetting = 'auto' | 'on' | 'off'
type TocSectionInput = string | { title?: string; subtitle?: string; slideNo?: number }

const props = withDefaults(defineProps<{
  title?: string | false
  subtitle?: string
  sections?: TocSectionInput[]
  showNumbers?: boolean
  chrome?: ChromeSetting
}>(), {
  showNumbers: true,
})

const { $slidev } = useSlideContext()

const slides = computed(() => (($slidev.nav as any)?.slides ?? []) as any[])

const getFrontmatter = (slide: any): Record<string, any> => {
  return slide?.meta?.slide?.frontmatter ?? slide?.slide?.frontmatter ?? slide?.frontmatter ?? {}
}

const getContent = (slide: any): string => {
  return slide?.meta?.slide?.content ?? slide?.slide?.content ?? slide?.content ?? ''
}

const getTitle = (slide: any, fallback: string): string => {
  const frontmatter = getFrontmatter(slide)
  const title = slide?.meta?.slide?.title ?? slide?.slide?.title ?? slide?.title ?? frontmatter.title
  if (typeof title === 'string' && title.trim()) return title.trim()

  const match = getContent(slide).match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || fallback
}

const tocTitle = computed(() => {
  if (props.title === false) return ''
  return typeof props.title === 'string' && props.title.trim() ? props.title.trim() : 'Outline'
})

const tocSections = computed(() => {
  if (props.sections?.length) {
    return props.sections.map((section, index) => {
      if (typeof section === 'string') return { title: section, subtitle: '', slideNo: undefined, index: index + 1 }

      return {
        title: section.title || `Section ${index + 1}`,
        subtitle: section.subtitle || '',
        slideNo: section.slideNo,
        index: index + 1,
      }
    })
  }

  return slides.value
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => getFrontmatter(slide).layout === 'section')
    .map(({ slide, index }, sectionIndex) => {
      const frontmatter = getFrontmatter(slide)

      return {
        title: getTitle(slide, `Section ${sectionIndex + 1}`),
        subtitle: typeof frontmatter.subtitle === 'string' ? frontmatter.subtitle : '',
        slideNo: index + 1,
        index: sectionIndex + 1,
      }
    })
})

const goToSection = (slideNo?: number) => {
  if (slideNo) $slidev.nav.go(slideNo)
}
</script>

<template>
  <div class="slidev-layout toc">
    <ObsidianFrame variant="toc" :title="typeof title === 'string' ? title : undefined" :subtitle="subtitle" :chrome="chrome">
      <div class="obsidian-layout-toc">
        <h1 v-if="tocTitle">{{ tocTitle }}</h1>

        <div class="obsidian-layout-toc__list" role="list">
          <div v-for="section in tocSections" :key="`${section.index}-${section.title}`" class="obsidian-layout-toc__item" role="listitem">
            <button class="obsidian-layout-toc__button" type="button" @click="goToSection(section.slideNo)">
              <span v-if="showNumbers" class="obsidian-layout-toc__number">{{ section.index }}</span>
              <span class="obsidian-layout-toc__text">
                <span class="obsidian-layout-toc__title">{{ section.title }}</span>
                <span v-if="section.subtitle" class="obsidian-layout-toc__subtitle">{{ section.subtitle }}</span>
              </span>
            </button>
          </div>
        </div>

        <div class="obsidian-layout-toc__extra">
          <slot />
        </div>
      </div>
    </ObsidianFrame>
  </div>
</template>
