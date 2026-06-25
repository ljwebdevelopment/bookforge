import { extractPlainText } from '@/lib/utils'

function toText(input: unknown): string {
  return typeof input === 'string' ? input : extractPlainText(input)
}

export function getWordCount(input: unknown): number {
  const text = toText(input)
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function getSentenceCount(input: unknown): number {
  const text = toText(input)
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
