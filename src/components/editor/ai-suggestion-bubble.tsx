'use client'

import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Check, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores/editor-store'

interface AiSuggestionBubbleProps {
  editor: Editor
}

function getSuggestionIdAtPos(editor: Editor): string | null {
  const { from } = editor.state.selection
  const $pos = editor.state.doc.resolve(from)
  for (const mark of $pos.marks()) {
    if (
      (mark.type.name === 'aiInserted' || mark.type.name === 'aiDeleted') &&
      mark.attrs.suggestionId
    ) {
      return mark.attrs.suggestionId as string
    }
  }
  return null
}

export function AiSuggestionBubble({ editor }: AiSuggestionBubbleProps) {
  const { acceptAiSuggestion, rejectAiSuggestion } = useEditorStore()

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }) => {
        const { from, to } = state.selection
        const checkPos = to > from ? from + 1 : from
        if (checkPos > state.doc.content.size) return false
        try {
          const $pos = state.doc.resolve(checkPos)
          return $pos.marks().some(
            (m) => m.type.name === 'aiInserted' || m.type.name === 'aiDeleted'
          )
        } catch {
          return false
        }
      }}
      className="flex items-center gap-1 rounded-lg border bg-popover shadow-lg p-1"
    >
      <div className="flex items-center gap-1 px-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        <span>AI suggestion</span>
      </div>
      <div className="w-px h-5 bg-border mx-0.5" />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs gap-1 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
        onClick={() => {
          const id = getSuggestionIdAtPos(editor)
          if (id) acceptAiSuggestion?.(id)
        }}
      >
        <Check className="h-3 w-3" />
        Accept
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs gap-1 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
        onClick={() => {
          const id = getSuggestionIdAtPos(editor)
          if (id) rejectAiSuggestion?.(id)
        }}
      >
        <X className="h-3 w-3" />
        Reject
      </Button>
    </BubbleMenu>
  )
}
