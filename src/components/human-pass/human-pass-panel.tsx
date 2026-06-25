'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Check, X, UserCheck } from 'lucide-react'
import { SuggestionDiff } from './suggestion-diff'
import { useAIStore } from '@/stores/ai-store'
import { useEditorStore } from '@/stores/editor-store'
import { updateAiSuggestionStatus } from '@/actions/ai-actions'
import { logAcceptedEdit, logRejectedEdit } from '@/lib/ai/memory'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface HumanPassPanelProps {
  projectId: string
}

const TYPE_COLORS: Record<string, string> = {
  generic: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  robotic: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  passive: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  weak: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  repetitive: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  unclear: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}

export function HumanPassPanel({ projectId }: HumanPassPanelProps) {
  const { humanPassSuggestions, humanPassLoading, setHumanPassSuggestions, setHumanPassLoading } = useAIStore()
  const { currentChapterId } = useEditorStore()
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  const runHumanPass = async () => {
    if (!currentChapterId) {
      toast.error('No chapter selected')
      return
    }

    setHumanPassLoading(true)

    try {
      // Get chapter text from the editor store or fetch it
      const supabase = createClient()
      const { data: chapter } = await supabase
        .from('chapters')
        .select('content')
        .eq('id', currentChapterId)
        .single()

      if (!chapter?.content) {
        toast.error('No content to analyze')
        return
      }

      const { extractPlainText } = await import('@/lib/utils')
      const text = extractPlainText(chapter.content)

      const res = await fetch('/api/ai/human-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, chapterId: currentChapterId, text }),
      })

      const data = await res.json()
      setHumanPassSuggestions(data.suggestions ?? [])
      setDismissed(new Set())
    } catch {
      toast.error('Human Pass failed. Please try again.')
    } finally {
      setHumanPassLoading(false)
    }
  }

  const handleAccept = async (index: number, suggestion: (typeof humanPassSuggestions)[number]) => {
    setDismissed((d) => new Set([...d, index]))
    const supabase = createClient()
    await logAcceptedEdit(supabase, projectId, suggestion.original ?? '', suggestion.suggestion)
    toast.success('Suggestion accepted')
  }

  const handleReject = async (index: number, suggestion: (typeof humanPassSuggestions)[number]) => {
    setDismissed((d) => new Set([...d, index]))
    const supabase = createClient()
    await logRejectedEdit(supabase, projectId, suggestion.suggestion ?? '')
  }

  const visible = humanPassSuggestions.filter((_, i) => !dismissed.has(i))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <p className="text-xs text-muted-foreground mb-3">
          Detect generic, robotic, or weak writing and get specific suggestions to strengthen your voice.
        </p>
        <Button
          onClick={runHumanPass}
          disabled={humanPassLoading || !currentChapterId}
          className="w-full gap-2"
        >
          {humanPassLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              Run Human Pass
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {visible.length === 0 && !humanPassLoading && humanPassSuggestions.length > 0 && (
          <div className="text-center py-8">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">All suggestions reviewed!</p>
          </div>
        )}

        {humanPassSuggestions.length === 0 && !humanPassLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Run Human Pass to detect writing issues.</p>
          </div>
        )}

        <div className="space-y-4">
          {humanPassSuggestions.map((s, i) => {
            if (dismissed.has(i)) return null
            const typeClass = TYPE_COLORS[s.type] ?? TYPE_COLORS.other
            return (
              <div key={i} className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeClass}`}>
                    {s.type}
                  </span>
                  <span className="text-sm font-medium flex-1">{s.problem}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.explanation}</p>
                <SuggestionDiff original={s.original} suggestion={s.suggestion} />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => handleAccept(i, s)}>
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => handleReject(i, s)}>
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
