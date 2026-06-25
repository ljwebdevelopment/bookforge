'use client'

import type { Editor } from '@tiptap/react'
import { useEditorStore } from '@/stores/editor-store'
import { useUIStore } from '@/stores/ui-store'
import { getWordCount, getSentenceCount, getParagraphCount, estimatePages } from '@/lib/editor/word-count'
import { Focus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorFooterProps {
  editor: Editor
}

const SAVE_LABELS: Record<string, string> = {
  saved: 'Saved',
  saving: 'Saving...',
  error: 'Save error',
  unsaved: 'Unsaved changes',
}

export function EditorFooter({ editor }: EditorFooterProps) {
  const { saveStatus } = useEditorStore()
  const { focusMode, toggleFocusMode } = useUIStore()

  const json = editor.getJSON()
  const words = getWordCount(json)
  const sentences = getSentenceCount(json)
  const paragraphs = getParagraphCount(json)
  const pages = estimatePages(words)
  const readingTime = Math.max(1, Math.round(words / 250))

  return (
    <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-4">
        <span>{words.toLocaleString()} words</span>
        <span>{sentences} sentences</span>
        <span>{paragraphs} paragraphs</span>
        <span>~{pages} {pages === 1 ? 'page' : 'pages'}</span>
        <span>{readingTime} min read</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          saveStatus === 'error' ? 'text-destructive' : '',
          saveStatus === 'saved' ? 'text-green-600 dark:text-green-500' : ''
        )}>
          {SAVE_LABELS[saveStatus]}
        </span>
        <button
          onClick={toggleFocusMode}
          className={cn(
            'flex items-center gap-1 transition-colors hover:text-foreground',
            focusMode && 'text-primary'
          )}
          title="Focus mode (⌘⇧F)"
        >
          <Focus className="h-3.5 w-3.5" />
          {focusMode ? 'Exit focus' : 'Focus mode'}
        </button>
      </div>
    </div>
  )
}
