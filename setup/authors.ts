export type ObsidianAuthor = {
  name: string
  institution?: string
  email?: string
  emailHref?: string
  sourceIndex: number
}

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

export const isActionableEmail = (value: unknown): value is string => {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+$/.test(value)
}

export const normalizeAuthor = (
  value: unknown,
  sourceIndex = 0,
): ObsidianAuthor | null => {
  if (typeof value === 'string') {
    const name = normalizeText(value)
    return name ? { name, sourceIndex } : null
  }

  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const name = normalizeText(record.name)
  const institution = normalizeText(record.institution)
  const email = normalizeText(record.email)

  if (!name && !institution && !email) return null

  return {
    name: name || email || institution,
    institution: institution || undefined,
    email: email || undefined,
    emailHref: isActionableEmail(email) ? `mailto:${email}` : undefined,
    sourceIndex,
  }
}

export const normalizeAuthors = (value: unknown): ObsidianAuthor[] => {
  if (Array.isArray(value)) {
    return value
      .map((author, index) => normalizeAuthor(author, index))
      .filter((author): author is ObsidianAuthor => author !== null)
  }

  const author = normalizeAuthor(value, 0)
  return author ? [author] : []
}

export const resolveDeckAuthors = (
  configs: unknown,
): ObsidianAuthor[] => {
  if (!configs || typeof configs !== 'object' || Array.isArray(configs)) return []
  const record = configs as Record<string, unknown>
  const plural = normalizeAuthors(record.authors)
  return plural.length > 0 ? plural : normalizeAuthors(record.author)
}

export const formatAuthorNames = (authors: ObsidianAuthor[]): string => {
  return authors.map((author) => author.name).filter(Boolean).join(', ')
}

export const formatAuthorDetails = (author: ObsidianAuthor): string => {
  return [author.institution, author.email].filter(Boolean).join(' · ')
}
