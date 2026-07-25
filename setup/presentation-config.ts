export const PRESENTATION_PRESETS = Object.freeze([
  'default',
  'ucas',
  'ict',
] as const)

export const PRESENTATION_DENSITIES = Object.freeze([
  'compact',
  'normal',
  'relaxed',
] as const)

export const PRESENTATION_CHROME_VALUES = Object.freeze([
  'auto',
  'on',
  'off',
] as const)

export const FRAME_VARIANTS = Object.freeze([
  'default',
  'cover',
  'intro',
  'section',
  'toc',
  'center',
  'two-cols',
  'statement',
  'quote',
  'figure',
  'references',
  'closing',
  'image-text',
  'code',
] as const)

const BOOLEAN_TEXT_VALUES = Object.freeze([
  'true',
  'on',
  'false',
  'off',
] as const)

type TupleValue<T extends readonly unknown[]> = T[number]

export type PresentationPreset = TupleValue<typeof PRESENTATION_PRESETS>
export type PresentationDensity = TupleValue<typeof PRESENTATION_DENSITIES>
export type PresentationChrome = TupleValue<typeof PRESENTATION_CHROME_VALUES>
export type FrameVariant = TupleValue<typeof FRAME_VARIANTS>
export type CssColorSupport = (value: string) => boolean

export type DeckPresentationState = Readonly<{
  preset: PresentationPreset
  density: PresentationDensity
  chrome: PresentationChrome
  header: boolean
  footerAuthors: boolean
  pageNumber: boolean
  accent: string | null
}>

export type ResolvedPresentationState = DeckPresentationState & Readonly<{
  variant: FrameVariant
  showChrome: boolean
  showHeader: boolean
}>

type OptionScope = 'deck-and-slide' | 'deck-only'

type PresentationOptionDefinition<T> = Readonly<{
  key: string
  deckKey: string
  slideKeys: readonly string[]
  acceptedValues: readonly unknown[] | 'css-color'
  defaultValue: T
  normalize: (value: unknown, supportsColor?: CssColorSupport) => T | undefined
  scope: OptionScope
}>

const normalizeEnum = <T extends string>(
  value: unknown,
  acceptedValues: readonly T[],
): T | undefined => {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return acceptedValues.includes(normalized as T) ? normalized as T : undefined
}

export const normalizePreset = (value: unknown): PresentationPreset | undefined => {
  return normalizeEnum(value, PRESENTATION_PRESETS)
}

export const normalizeDensity = (value: unknown): PresentationDensity | undefined => {
  return normalizeEnum(value, PRESENTATION_DENSITIES)
}

export const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === false) return value
  if (typeof value !== 'string') return undefined

  const normalized = value.trim()
  if (normalized === 'true' || normalized === 'on') return true
  if (normalized === 'false' || normalized === 'off') return false
  return undefined
}

export const normalizeChrome = (value: unknown): PresentationChrome | undefined => {
  const enumValue = normalizeEnum(value, PRESENTATION_CHROME_VALUES)
  if (enumValue) return enumValue

  const booleanValue = normalizeBoolean(value)
  if (booleanValue === true) return 'on'
  if (booleanValue === false) return 'off'
  return undefined
}

const FALLBACK_COLOR_PATTERN = /^(?:#[\da-f]{3,8}|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|var)\(.+\)|(?:aliceblue|black|blue|currentcolor|gray|green|grey|inherit|initial|orange|purple|rebeccapurple|red|transparent|white|yellow))$/i

export const supportsCssColor: CssColorSupport = (value) => {
  if (typeof globalThis.CSS?.supports === 'function') {
    return globalThis.CSS.supports('color', value)
  }

  if (typeof document !== 'undefined') {
    const probe = document.createElement('span')
    probe.style.color = ''
    probe.style.color = value
    return probe.style.color !== ''
  }

  // Server rendering cannot query the browser parser. This conservative fallback covers the
  // documented/common CSS color forms; the client re-evaluates through CSS.supports.
  return FALLBACK_COLOR_PATTERN.test(value)
}

export const normalizeAccent = (
  value: unknown,
  supportsColor: CssColorSupport = supportsCssColor,
): string | undefined => {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  if (!normalized || !supportsColor(normalized)) return undefined
  return normalized
}

export const normalizeFrameVariant = (value: unknown): FrameVariant | undefined => {
  return normalizeEnum(value, FRAME_VARIANTS)
}

const freezeDefinition = <T>(
  definition: Omit<PresentationOptionDefinition<T>, 'slideKeys'> & { slideKeys: readonly string[] },
): PresentationOptionDefinition<T> => {
  return Object.freeze({
    ...definition,
    slideKeys: Object.freeze([...definition.slideKeys]),
  })
}

export const PRESENTATION_OPTIONS = Object.freeze({
  preset: freezeDefinition<PresentationPreset>({
    key: 'preset',
    deckKey: 'preset',
    slideKeys: ['presentationPreset'],
    acceptedValues: PRESENTATION_PRESETS,
    defaultValue: 'default',
    normalize: normalizePreset,
    scope: 'deck-and-slide',
  }),
  density: freezeDefinition<PresentationDensity>({
    key: 'density',
    deckKey: 'density',
    slideKeys: ['presentationDensity'],
    acceptedValues: PRESENTATION_DENSITIES,
    defaultValue: 'normal',
    normalize: normalizeDensity,
    scope: 'deck-and-slide',
  }),
  chrome: freezeDefinition<PresentationChrome>({
    key: 'chrome',
    deckKey: 'chrome',
    slideKeys: ['presentationChrome', 'chrome'],
    acceptedValues: Object.freeze([
      ...PRESENTATION_CHROME_VALUES,
      ...BOOLEAN_TEXT_VALUES,
      true,
      false,
    ]),
    defaultValue: 'auto',
    normalize: normalizeChrome,
    scope: 'deck-and-slide',
  }),
  header: freezeDefinition<boolean>({
    key: 'header',
    deckKey: 'header',
    slideKeys: ['presentationHeader', 'header'],
    acceptedValues: Object.freeze([...BOOLEAN_TEXT_VALUES, true, false]),
    defaultValue: false,
    normalize: normalizeBoolean,
    scope: 'deck-and-slide',
  }),
  footerAuthors: freezeDefinition<boolean>({
    key: 'footerAuthors',
    deckKey: 'footerAuthors',
    slideKeys: ['footerAuthors'],
    acceptedValues: Object.freeze([...BOOLEAN_TEXT_VALUES, true, false]),
    defaultValue: true,
    normalize: normalizeBoolean,
    scope: 'deck-and-slide',
  }),
  pageNumber: freezeDefinition<boolean>({
    key: 'pageNumber',
    deckKey: 'pageNumber',
    slideKeys: ['pageNumber'],
    acceptedValues: Object.freeze([...BOOLEAN_TEXT_VALUES, true, false]),
    defaultValue: true,
    normalize: normalizeBoolean,
    scope: 'deck-and-slide',
  }),
  accent: freezeDefinition<string | null>({
    key: 'accent',
    deckKey: 'accent',
    slideKeys: ['accent'],
    acceptedValues: 'css-color',
    defaultValue: null,
    normalize: normalizeAccent,
    scope: 'deck-and-slide',
  }),
} satisfies Record<string, PresentationOptionDefinition<unknown>>)

export type PresentationOptionKey = keyof typeof PRESENTATION_OPTIONS

export const PRESENTATION_DEFAULTS: DeckPresentationState = Object.freeze({
  preset: PRESENTATION_OPTIONS.preset.defaultValue,
  density: PRESENTATION_OPTIONS.density.defaultValue,
  chrome: PRESENTATION_OPTIONS.chrome.defaultValue,
  header: PRESENTATION_OPTIONS.header.defaultValue,
  footerAuthors: PRESENTATION_OPTIONS.footerAuthors.defaultValue,
  pageNumber: PRESENTATION_OPTIONS.pageNumber.defaultValue,
  accent: PRESENTATION_OPTIONS.accent.defaultValue,
})

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

const firstValid = <T>(
  normalize: (value: unknown) => T | undefined,
  candidates: readonly unknown[],
  fallback: T,
): T => {
  for (const candidate of candidates) {
    const normalized = normalize(candidate)
    if (normalized !== undefined) return normalized
  }
  return fallback
}

export const resolveDeckPresentation = (
  rawPresentation?: unknown,
  options: Readonly<{ supportsColor?: CssColorSupport }> = {},
): DeckPresentationState => {
  const raw = asRecord(rawPresentation)
  const supportsColor = options.supportsColor ?? supportsCssColor

  return Object.freeze({
    preset: normalizePreset(raw.preset) ?? PRESENTATION_DEFAULTS.preset,
    density: normalizeDensity(raw.density) ?? PRESENTATION_DEFAULTS.density,
    chrome: normalizeChrome(raw.chrome) ?? PRESENTATION_DEFAULTS.chrome,
    header: normalizeBoolean(raw.header) ?? PRESENTATION_DEFAULTS.header,
    footerAuthors: normalizeBoolean(raw.footerAuthors) ?? PRESENTATION_DEFAULTS.footerAuthors,
    pageNumber: normalizeBoolean(raw.pageNumber) ?? PRESENTATION_DEFAULTS.pageNumber,
    accent: normalizeAccent(raw.accent, supportsColor) ?? PRESENTATION_DEFAULTS.accent,
  })
}

export const deriveChromeVisibility = (
  chrome: PresentationChrome,
  variant: FrameVariant,
): boolean => {
  if (chrome === 'on') return true
  if (chrome === 'off') return false
  return variant !== 'cover'
    && variant !== 'section'
    && variant !== 'closing'
}

export const deriveHeaderVisibility = (
  showChrome: boolean,
  header: boolean,
): boolean => {
  return showChrome && header
}

export const resolvePresentation = (
  input: Readonly<{
    deck?: unknown
    slide?: unknown
    chrome?: unknown
    variant?: unknown
    supportsColor?: CssColorSupport
  }> = {},
): ResolvedPresentationState => {
  const deck = resolveDeckPresentation(input.deck, {
    supportsColor: input.supportsColor,
  })
  const slide = asRecord(input.slide)
  const variant = normalizeFrameVariant(input.variant) ?? 'default'

  const preset = firstValid(
    normalizePreset,
    [slide.presentationPreset, deck.preset],
    PRESENTATION_DEFAULTS.preset,
  )
  const density = firstValid(
    normalizeDensity,
    [slide.presentationDensity, deck.density],
    PRESENTATION_DEFAULTS.density,
  )
  const chrome = firstValid(
    normalizeChrome,
    [input.chrome, slide.presentationChrome, slide.chrome, deck.chrome],
    PRESENTATION_DEFAULTS.chrome,
  )
  const header = firstValid(
    normalizeBoolean,
    [slide.presentationHeader, slide.header, deck.header],
    PRESENTATION_DEFAULTS.header,
  )
  const footerAuthors = firstValid(
    normalizeBoolean,
    [slide.footerAuthors, deck.footerAuthors],
    PRESENTATION_DEFAULTS.footerAuthors,
  )
  const pageNumber = firstValid(
    normalizeBoolean,
    [slide.pageNumber, deck.pageNumber],
    PRESENTATION_DEFAULTS.pageNumber,
  )
  const accent = firstValid(
    value => normalizeAccent(
      value,
      input.supportsColor ?? supportsCssColor,
    ),
    [slide.accent, deck.accent],
    PRESENTATION_DEFAULTS.accent,
  )
  const showChrome = deriveChromeVisibility(chrome, variant)

  return Object.freeze({
    preset,
    density,
    chrome,
    header,
    footerAuthors,
    pageNumber,
    accent,
    variant,
    showChrome,
    showHeader: deriveHeaderVisibility(showChrome, header),
  })
}
