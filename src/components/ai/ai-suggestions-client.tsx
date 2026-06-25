'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tables } from '@/lib/supabase/types'
import { updateAiSuggestionStatus } from '@/actions/ai-actions'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

type Suggestion = Tables<'ai_suggestions'>

interface AiSuggestionsClientProps {
  suggestions: Suggestion[]
  projectId: string
}

export function AiSuggestionsClient({ suggestions: initialSuggestions, projectId }: AiSuggestionsClientProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [isPending, startTransition] = useTransition()

  const handleStatus = (id: string, status: 'accepted' | 'rejected' | 'ignored') => {
    startTransition(async () => {
      await updateAiSuggestionStatus(id, status)
      setSuggestions((s) => s.filter((x) => x.id !== id))
      toast.success(status === 'accepted' ? 'Suggestion accepted' : 'Suggestion dismissed')
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">AI Suggestions</h1>
          <Badge variant="secondary">{suggestions.length} pending</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Review suggestions from Human Pass and other AI analyses.</p>
      </div>

      <ScrollArea className="flex-1 px-6 py-4">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mb-3 opacity-40" />
            <p className="font-medium">No pending suggestions</p>
            <p className="text-sm mt-1">Run Human Pass on a chapter to get suggestions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => (
              <div key={s.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{s.problem}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(s.created_at ?? '')}
                  </span>
                </div>
                {s.explanation && (
                  <p className="text-xs text-muted-foreground">{s.explanation}</p>
                )}
                {s.suggestion && (
                  <div className="rounded-md bg-muted/50 p-3 text-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Suggestion</p>
                    <p>{s.suggestion}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => handleStatus(s.id, 'accepted')}>
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => handleStatus(s.id, 'rejected')}>
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleStatus(s.id, 'ignored')}>
                    Ignore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
