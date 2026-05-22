export type ObsidianAuthor = {
  name: string
  institution?: string
  email?: string
}

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeAuthor = (value: unknown): ObsidianAuthor | null => {
  if (typeof value === 'string') {
    const name = normalizeText(value)
    return name ? { name } : null
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
  }
}

export const normalizeAuthors = (value: unknown): ObsidianAuthor[] => {
  if (Array.isArray(value)) {
    return value.map(normalizeAuthor).filter((author): author is ObsidianAuthor => author !== null)
  }

  const author = normalizeAuthor(value)
  return author ? [author] : []
}

export const formatAuthorNames = (authors: ObsidianAuthor[]): string => {
  return authors.map((author) => author.name).filter(Boolean).join(', ')
}

export const formatAuthorDetails = (author: ObsidianAuthor): string => {
  return [author.institution, author.email].filter(Boolean).join(' · ')
}
