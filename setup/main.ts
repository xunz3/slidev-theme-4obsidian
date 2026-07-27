import { configs } from '@slidev/client'
import { defineAppSetup } from '@slidev/types'
import { watch } from 'vue'
import packageMetadata from '../package.json'
import { resolveDeckPresentation } from './presentation-config'
import { assessProtocolCompatibility } from './protocol-compatibility'
import { installProtocolCompatibilityBridge } from './protocol-runtime'
import { observePresentationRendering } from './render-normalization'

const getRawPresentationConfig = (): unknown => {
  return (configs as any)?.themeConfig?.presentation
}

const getRawProtocolDeclaration = (): unknown => {
  return (configs as any)?.['obsidian-slidev-protocol']
}

const getRawProfileSelection = (): unknown => {
  return (configs as any)?.['obsidian-slidev-profile']
}

export const applyPresentationConfig = (rawPresentation = getRawPresentationConfig()) => {
  if (typeof document === 'undefined') return

  const accent = resolveDeckPresentation(rawPresentation).accent
  const root = document.documentElement

  if (accent) {
    root.style.setProperty('--slidev-theme-primary', accent)
  } else {
    root.style.removeProperty('--slidev-theme-primary')
  }
}

export default defineAppSetup(({ app }) => {
  applyPresentationConfig()
  const stopRenderNormalization = observePresentationRendering()
  const stopProtocolCompatibility = installProtocolCompatibilityBridge({
    assess: assessProtocolCompatibility,
    rawProfile: getRawProfileSelection(),
    rawProtocol: getRawProtocolDeclaration(),
    rawSupport: (packageMetadata as any).obsidianSlidev?.support,
  })

  const stopPresentationWatch = watch(
    () => resolveDeckPresentation(getRawPresentationConfig()).accent,
    () => applyPresentationConfig(),
  )
  app.onUnmount(() => {
    stopPresentationWatch()
    stopProtocolCompatibility()
    stopRenderNormalization()
  })
})
