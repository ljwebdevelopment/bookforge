'use client'

import { Lightbulb, PenLine, List, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores/editor-store'
import { toast } from 'sonner'
import { useState } from 'react'

const CHAT_ACTIONS = [
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb, prompt: 'Help me brainstorm ideas for this section.' },
  { id: 'issues', label: 'Find Issues', icon: AlertCircle, prompt: 'Analyze this section for clarity, flow, and consistency issues.' },
  { id: 'outline', label: 'Outline', icon: List, prompt: 'Create a detailed outline for the next section I should write.' },
]

const WRITE_ACTIONS = [
  { id: 'continue', label: 'Continue', icon: PenLine, prompt: 'Continue writing from exactly where the manuscript ends. Match the established voice precisely. Output only the new text.' },
  { id: 'draft', label: 'Draft next', icon: FileText, prompt: 'Looking at the outline, draft the next section that has not been written yet. Output only the draft text.' },
]

interface AiActionBarProps {
  onChatAction: (prompt: string) => void
  projectId: string
  chapterId?: string | null
}

export function AiActionBar({ onChatAction, projectId, chapterId }: AiActionBarProps) {
  const { insertAiSuggestion } = useEditorStore()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleWriteAction = async (actionId: string, prompt: string) => {
    if (!insertAiSuggestion) {
      toast.error('Open a chapter in the editor first')
      return
    }

    setLoadingAction(actionId)
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, chapterId, prompt }),
      })
      if (!res.ok) throw new Error('Request failed')
      const { text } = await res.json()
      if (text?.trim()) {
        insertAiSuggestion({ text })
        toast.success('AI writing inserted — review it in the document')
      }
    } catch {
      toast.error('Failed to generate. Please try again.')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="border-t bg-muted/20 px-3 py-2 space-y-1.5">
      {/* Chat actions */}
      <div className="grid grid-cols-3 gap-1">
        {CHAT_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 justify-start"
              onClick={() => onChatAction(action.prompt)}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span>{action.label}</span>
            </Button>
          )
        })}
      </div>
      {/* Write-to-editor actions */}
      <div className="grid grid-cols-2 gap-1">
        {WRITE_ACTIONS.map((action) => {
          const Icon = action.icon
          const isLoading = loadingAction === action.id
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 justify-start border-primary/20 text-primary hover:bg-primary/5"
              disabled={!!loadingAction}
              onClick={() => handleWriteAction(action.id, action.prompt)}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
              ) : (
                <Icon className="h-3 w-3 shrink-0" />
              )}
              <span>{isLoading ? 'Writing...' : action.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
