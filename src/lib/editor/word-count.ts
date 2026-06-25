import { extractPlainText } from '@/lib/utils'

export function getWordCount(json: unknown): number {
  const text = extractPlainText(json)
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function getSentenceCount(json: unknown): number {
  const text = extractPlainText(json)
  const matches = text.match(/[.!?]+/g)
  return matches ? matches.length : 0
}

export function getParagraphCount(json: unknown): number {
  const node = json as { content?: unknown[] }
  if (!node?.content) return 0
  return node.content.filter((n: unknown) => {
    const item = n as { type?: string }
    return item.type === 'paragraph'
  }).length
}

export function getCharacterCount(json: unknown): number {
  return extractPlainText(json).length
}

export function estimatePages(wordCount: number): number {
  return Math.ceil(wordCount / 250)
}
