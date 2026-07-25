import { writeFile } from 'node:fs/promises'

export const MINIMUM_NAVIGATION_SAMPLES = 20
export const NAVIGATION_ABSOLUTE_MAXIMUM_MS = 100
export const NAVIGATION_RELATIVE_RATIO = 1.10
export const navigationScenarioDefinitions = Object.freeze([
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 2,
    id: 'us1-callout',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us1-callouts-info"]',
    targetSlide: 3,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 10,
    id: 'us1-figure',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us1-figures-alternatives"]',
    targetSlide: 11,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 12,
    id: 'us1-authors',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us1-authors-mixed"]',
    targetSlide: 13,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 15,
    id: 'us2-closing-media',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us2-closing-metadata"]',
    targetSlide: 16,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 19,
    id: 'us2-image-left',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us2-image-left"]',
    targetSlide: 20,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 20,
    id: 'us2-image-right',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us2-image-right"]',
    targetSlide: 21,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 23,
    id: 'us2-image-failed',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us2-image-failed"]',
    targetSlide: 24,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 26,
    id: 'us3-local-to-fallback',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us3-accent-unaccented"]',
    targetSlide: 27,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 29,
    id: 'us3-invalid-to-local',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us3-accent-local-b"]',
    targetSlide: 30,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 31,
    id: 'us4-code',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us4-code-titled"]',
    targetSlide: 32,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 35,
    id: 'us4-steps',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us4-steps-many"]',
    targetSlide: 36,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 38,
    id: 'us4-timeline',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us4-timeline-many"]',
    targetSlide: 39,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 39,
    id: 'us4-status',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us4-status-labels"]',
    targetSlide: 40,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 40,
    id: 'us4-keyboard',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us4-keyboard"]',
    targetSlide: 41,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 41,
    id: 'us5-tasks',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us5-tasks-native"]',
    targetSlide: 42,
  }),
  Object.freeze({
    buildId: 'expanded-default',
    fromSlide: 43,
    id: 'us5-highlights',
    mode: 'light',
    preset: 'default',
    targetSelector: '[data-quality-case="us5-highlights"]',
    targetSlide: 44,
  }),
])

const numericAscending = (left, right) => left - right

export const nearestRankPercentile = (values, percentile) => {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Percentile input must contain samples')
  }
  if (!(percentile > 0 && percentile <= 1)) {
    throw new Error('Percentile must be greater than zero and at most one')
  }
  const sorted = [...values].sort(numericAscending)
  return sorted[Math.ceil(percentile * sorted.length) - 1]
}

export const summarizeNavigationSamples = (values) => {
  if (!Array.isArray(values) || values.length < MINIMUM_NAVIGATION_SAMPLES) {
    throw new Error(
      `Navigation evidence requires at least ${MINIMUM_NAVIGATION_SAMPLES} samples`,
    )
  }
  if (values.some(value => !Number.isFinite(value) || value < 0)) {
    throw new Error('Navigation samples must be finite non-negative numbers')
  }
  const samplesMs = values.map(value => Math.round(value * 1000) / 1000)
  const sorted = [...samplesMs].sort(numericAscending)
  const middle = Math.floor(sorted.length / 2)
  const medianMs = sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
  return {
    maximumMs: sorted.at(-1),
    medianMs,
    p95Ms: nearestRankPercentile(sorted, 0.95),
    samplesMs,
  }
}

export const createNavigationTimingScript = () => function installNavigationTiming({
  targetSelector,
  timeoutMs,
}) {
  const existing = window.__presentationNavigationTiming
  existing?.cleanup?.()

  let inputAt = null
  let target = null
  let targetVisibleAt = null
  let signalVersion = 0
  let lastSignalAt = performance.now()
  let resizeObserver
  let mutationObserver
  let shiftObserver
  let timeout
  let settled = false
  let stableFrames = 0
  let previousGeometry = ''
  const layoutShiftEntries = []
  const visibilitySamples = []
  const geometrySamples = []
  const initialPath = location.pathname

  const recordSignal = () => {
    signalVersion += 1
    lastSignalAt = performance.now()
    stableFrames = 0
  }
  const isVisible = (element) => {
    if (!(element instanceof Element)) return false
    if (typeof element.checkVisibility === 'function'
      && !element.checkVisibility({
        checkOpacity: true,
        checkVisibilityCSS: true,
        contentVisibilityAuto: true,
      })) {
      return false
    }
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return style.display !== 'none'
      && style.visibility !== 'hidden'
      && rect.width > 0
      && rect.height > 0
      && rect.right > 0
      && rect.bottom > 0
      && rect.left < innerWidth
      && rect.top < innerHeight
  }
  const geometry = (element) => {
    const elements = [
      element.closest('.slidev-layout') ?? element,
      element,
      ...element.querySelectorAll(
        'img, figure, figcaption, .obsidian-slidev-media__viewport, [data-stability-region]',
      ),
    ]
    return elements.map((node) => {
      const rect = node.getBoundingClientRect()
      return {
        height: Math.round(rect.height * 1000) / 1000,
        left: Math.round(rect.left * 1000) / 1000,
        top: Math.round(rect.top * 1000) / 1000,
        width: Math.round(rect.width * 1000) / 1000,
      }
    })
  }
  const relevantShift = (entry) => {
    if (!targetVisibleAt || entry.startTime < targetVisibleAt) return false
    if (!entry.sources?.length) return true
    return entry.sources.some((source) => {
      const node = source.node
      return node instanceof Node
        && (target === node || target?.contains(node) || node.contains?.(target))
    })
  }
  const cleanup = () => {
    clearTimeout(timeout)
    document.removeEventListener('keydown', onKeydown, true)
    mutationObserver?.disconnect()
    resizeObserver?.disconnect()
    shiftObserver?.disconnect()
  }
  const finish = (result, error) => {
    if (settled) return
    settled = true
    cleanup()
    window.__presentationNavigationTiming.result = result
    window.__presentationNavigationTiming.error = error
  }
  const waitForImages = async (element) => {
    const images = [...element.querySelectorAll('img')].filter(isVisible)
    await Promise.all(images.map(async (image) => {
      if (!image.complete) {
        await new Promise((resolveImage) => {
          image.addEventListener('load', resolveImage, { once: true })
          image.addEventListener('error', resolveImage, { once: true })
        })
      }
      try {
        await image.decode()
      } catch {
        // Failure-state geometry is still measured and reported.
      }
    }))
  }
  const waitForTarget = () => new Promise((resolveTarget) => {
    const find = () => {
      const candidate = location.pathname === initialPath
        ? null
        : [...document.querySelectorAll(targetSelector)].find(isVisible)
      visibilitySamples.push({
        at: performance.now(),
        visible: isVisible(candidate),
      })
      if (isVisible(candidate)) {
        resolveTarget(candidate)
        return
      }
      requestAnimationFrame(find)
    }
    find()
  })
  const waitForStableGeometry = () => new Promise((resolveStable) => {
    let observedSignalVersion = signalVersion
    const inspect = () => {
      const currentGeometry = JSON.stringify(geometry(target))
      const unchanged = currentGeometry === previousGeometry
        && observedSignalVersion === signalVersion
      geometrySamples.push({
        at: performance.now(),
        geometry: JSON.parse(currentGeometry),
        signalVersion,
      })
      stableFrames = unchanged ? stableFrames + 1 : 0
      previousGeometry = currentGeometry
      observedSignalVersion = signalVersion
      if (stableFrames >= 2) {
        resolveStable(performance.now())
        return
      }
      requestAnimationFrame(inspect)
    }
    requestAnimationFrame(inspect)
  })
  const beginMeasurement = async () => {
    try {
      target = await waitForTarget()
      targetVisibleAt = performance.now()
      resizeObserver.observe(target)
      await document.fonts?.ready
      await waitForImages(target)
      const stableAt = await waitForStableGeometry()
      finish({
        geometry: geometry(target),
        geometrySamples,
        inputAt,
        lastSignalAt,
        layoutShiftEntries,
        signalCount: signalVersion,
        stabilityMs: stableAt - targetVisibleAt,
        stableAt,
        totalMs: stableAt - inputAt,
        visibilityMs: targetVisibleAt - inputAt,
        visibilitySamples,
      })
    } catch (error) {
      finish(null, error instanceof Error ? error.message : String(error))
    }
  }
  const onKeydown = (event) => {
    if (event.key !== 'ArrowRight' || inputAt !== null) return
    inputAt = performance.now()
    void beginMeasurement()
  }

  mutationObserver = new MutationObserver(recordSignal)
  mutationObserver.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
  })
  resizeObserver = new ResizeObserver(recordSignal)
  resizeObserver.observe(document.documentElement)
  if (typeof PerformanceObserver === 'function'
    && PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
    shiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (relevantShift(entry)) {
          layoutShiftEntries.push({
            startTime: entry.startTime,
            value: entry.value,
          })
          recordSignal()
        }
      }
    })
    shiftObserver.observe({ buffered: true, type: 'layout-shift' })
  }
  document.addEventListener('keydown', onKeydown, true)
  timeout = setTimeout(
    () => finish(
      null,
      `Navigation timing exceeded ${timeoutMs} ms (path=${location.pathname}, initialPath=${initialPath}, target=${Boolean(target)}, candidates=${document.querySelectorAll(targetSelector).length}, signals=${signalVersion}, stableFrames=${stableFrames}, lastSignalAgo=${Math.round(performance.now() - lastSignalAt)} ms)`,
    ),
    timeoutMs,
  )
  window.__presentationNavigationTiming = {
    cleanup,
    error: null,
    result: null,
  }
  return true
}

const installTiming = async (page, targetSelector, timeoutMs) => {
  await page.evaluate(createNavigationTimingScript(), {
    targetSelector,
    timeoutMs,
  })
}

const readTiming = async (page) => {
  await page.waitForFunction(
    () => Boolean(
      window.__presentationNavigationTiming?.result
      || window.__presentationNavigationTiming?.error,
    ),
  )
  const state = await page.evaluate(() => ({
    error: window.__presentationNavigationTiming?.error,
    result: window.__presentationNavigationTiming?.result,
  }))
  if (state.error) throw new Error(state.error)
  return state.result
}

export const measureNavigationScenario = async ({
  baseUrl,
  fromSlide,
  mode = 'light',
  page,
  samples = MINIMUM_NAVIGATION_SAMPLES,
  targetSelector,
  timeoutMs = 5_000,
  warmups = 2,
}) => {
  if (samples < MINIMUM_NAVIGATION_SAMPLES) {
    throw new Error(
      `Navigation scenario requires at least ${MINIMUM_NAVIGATION_SAMPLES} samples`,
    )
  }
  const rawSamples = []
  const iterations = warmups + samples
  for (let index = 0; index < iterations; index += 1) {
    await page.goto(`${baseUrl}/${fromSlide}`, { waitUntil: 'domcontentloaded' })
    await page.locator(`.slidev-page-${fromSlide} .slidev-layout`).waitFor({
      state: 'visible',
    })
    await page.evaluate(async (dark) => {
      document.documentElement.classList.toggle('dark', dark)
      await document.fonts?.ready
      await new Promise(resolveFrame => requestAnimationFrame(
        () => requestAnimationFrame(resolveFrame),
      ))
    }, mode === 'dark')
    await installTiming(page, targetSelector, timeoutMs)
    await page.keyboard.press('ArrowRight')
    const result = await readTiming(page)
    if (index >= warmups) rawSamples.push(result)
  }
  const summary = summarizeNavigationSamples(
    rawSamples.map(sample => sample.totalMs),
  )
  return {
    ...summary,
    layoutShiftEntries: rawSamples.flatMap(sample => sample.layoutShiftEntries),
    rawSamples,
  }
}

export const writeNavigationEvidence = async (path, evidence) => {
  await writeFile(path, `${JSON.stringify(evidence, null, 2)}\n`)
}
