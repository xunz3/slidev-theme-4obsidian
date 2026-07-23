import { configs } from '@slidev/client'
import { defineAppSetup } from '@slidev/types'
import { watch } from 'vue'
import { resolveDeckPresentation } from './presentation-config'

const getRawPresentationConfig = (): unknown => {
  return (configs as any)?.themeConfig?.presentation
}

export const applyPresentationConfig = (rawPresentation = getRawPresentationConfig()) => {
  if (typeof document === 'undefined') return

  const config = resolveDeckPresentation(rawPresentation)
  const root = document.documentElement

  root.dataset.presentationPreset = config.preset
  root.dataset.presentationDensity = config.density
  root.dataset.presentationChrome = config.chrome

  if (config.accent) {
    root.style.setProperty('--presentation-accent', config.accent)
    root.style.setProperty('--slidev-theme-primary', config.accent)
  } else {
    root.style.removeProperty('--presentation-accent')
    root.style.removeProperty('--slidev-theme-primary')
  }
}

export default defineAppSetup(() => {
  applyPresentationConfig()

  watch(
    () => getRawPresentationConfig(),
    value => applyPresentationConfig(value),
    { deep: true },
  )
})
