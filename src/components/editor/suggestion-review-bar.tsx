'use client'

import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores/editor-store'

export function SuggestionReviewBar() {
  const { acceptAllAiSuggestions, rejectAllAiSuggestions } = useEditorStore()

  return (
    <div className="flex items-center justify-between border-b bg-green-50 dark:bg-green-950/30 px-4 py-2 text-sm shrink-0">
      <span className="text-green-800 dark:text-green-300 font-medium text-xs">
        AI suggestions pending review
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
          onClick={() => rejectAllAiSuggestions?.()}
        >
          <X className="h-3 w-3" />
          Reject all
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => acceptAllAiSuggestions?.()}
        >
          <Check className="h-3 w-3" />
          Accept all
        </Button>
      </div>
    </div>
  )
}
