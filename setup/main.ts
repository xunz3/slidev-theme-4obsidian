import { configs } from '@slidev/client'
import { defineAppSetup } from '@slidev/types'
import { watch } from 'vue'

type ObsidianPreset = 'clean' | 'scholarly'
type ObsidianDensity = 'compact' | 'normal' | 'relaxed'
type ObsidianChrome = 'auto' | 'on' | 'off'

type ObsidianThemeConfig = {
  preset?: ObsidianPreset
  accent?: string
  density?: ObsidianDensity
  chrome?: ObsidianChrome
  pageNumber?: boolean
}

const isPreset = (value: unknown): value is ObsidianPreset => {
  return value === 'clean' || value === 'scholarly'
}

const isDensity = (value: unknown): value is ObsidianDensity => {
  return value === 'compact' || value === 'normal' || value === 'relaxed'
}

const isChrome = (value: unknown): value is ObsidianChrome => {
  return value === 'auto' || value === 'on' || value === 'off'
}

const applyConfig = () => {
  if (typeof document === 'undefined') return

  const config = (((configs as any)?.themeConfig?.obsidian ?? {}) as ObsidianThemeConfig)
  const root = document.documentElement
  const preset = isPreset(config.preset) ? config.preset : 'clean'
  const density = isDensity(config.density) ? config.density : 'normal'
  const chrome = isChrome(config.chrome) ? config.chrome : 'auto'

  root.dataset.obsidianPreset = preset
  root.dataset.obsidianDensity = density
  root.dataset.obsidianChrome = chrome

  if (typeof config.accent === 'string' && config.accent.trim()) {
    root.style.setProperty('--obsidian-accent', config.accent.trim())
    root.style.setProperty('--slidev-theme-primary', config.accent.trim())
  } else {
    root.style.removeProperty('--obsidian-accent')
    root.style.removeProperty('--slidev-theme-primary')
  }
}

export default defineAppSetup(() => {
  applyConfig()

  watch(
    () => (configs as any)?.themeConfig?.obsidian,
    () => applyConfig(),
    { deep: true },
  )
})
