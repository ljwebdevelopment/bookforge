import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWordCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

export function estimateReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200)
  if (minutes < 1) return '< 1 min'
  if (minutes === 1) return '1 min'
  return `${minutes} min`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function extractPlainText(json: unknown): string {
  if (!json || typeof json !== 'object') return ''
  const node = json as { type?: string; text?: string; content?: unknown[] }
  if (node.type === 'text') return node.text ?? ''
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractPlainText).join(' ')
  }
  return ''
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

export function getProgressColor(percent: number): string {
  if (percent >= 100) return 'text-green-600 dark:text-green-400'
  if (percent >= 75) return 'text-blue-600 dark:text-blue-400'
  if (percent >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-muted-foreground'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    complete: 'Complete',
    published: 'Published',
  }
  return labels[status] ?? status
}
