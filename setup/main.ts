import { configs } from '@slidev/client'
import { defineAppSetup } from '@slidev/types'
import { watch } from 'vue'

type PresentationPreset = 'scholarly' | 'ucas' | 'ict'
type PresentationDensity = 'compact' | 'normal' | 'relaxed'
type PresentationChrome = 'auto' | 'on' | 'off'

type PresentationThemeConfig = {
  preset?: PresentationPreset
  accent?: string
  density?: PresentationDensity
  chrome?: PresentationChrome
  header?: boolean
  footerAuthors?: boolean
  pageNumber?: boolean
}

const isPreset = (value: unknown): value is PresentationPreset => {
  return value === 'scholarly' || value === 'ucas' || value === 'ict'
}

const isDensity = (value: unknown): value is PresentationDensity => {
  return value === 'compact' || value === 'normal' || value === 'relaxed'
}

const isChrome = (value: unknown): value is PresentationChrome => {
  return value === 'auto' || value === 'on' || value === 'off'
}

const applyConfig = () => {
  if (typeof document === 'undefined') return

  const config = (((configs as any)?.themeConfig?.presentation ?? {}) as PresentationThemeConfig)
  const root = document.documentElement
  const preset = isPreset(config.preset) ? config.preset : 'scholarly'
  const density = isDensity(config.density) ? config.density : 'normal'
  const chrome = isChrome(config.chrome) ? config.chrome : 'auto'

  root.dataset.presentationPreset = preset
  root.dataset.presentationDensity = density
  root.dataset.presentationChrome = chrome

  if (typeof config.accent === 'string' && config.accent.trim()) {
    root.style.setProperty('--presentation-accent', config.accent.trim())
    root.style.setProperty('--slidev-theme-primary', config.accent.trim())
  } else {
    root.style.removeProperty('--presentation-accent')
    root.style.removeProperty('--slidev-theme-primary')
  }
}

export default defineAppSetup(() => {
  applyConfig()

  watch(
    () => (configs as any)?.themeConfig?.presentation,
    () => applyConfig(),
    { deep: true },
  )
})
