'use client'

import { useState } from 'react'
import { useAIStore } from '@/stores/ai-store'
import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, X, RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logAcceptedEdit, logRejectedEdit } from '@/lib/ai/memory'

const SMART_EDIT_ACTIONS = [
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'expand', label: 'Expand' },
  { id: 'shorten', label: 'Shorten' },
  { id: 'clarify', label: 'Clarify' },
  { id: 'strengthen', label: 'Strengthen' },
  { id: 'persuasive', label: 'Persuasive' },
  { id: 'formal', label: 'Formal' },
  { id: 'natural', label: 'Natural' },
  { id: 'voice', label: 'My Voice' },
]

export function InlineSuggestion() {
  const { setPanelMode } = useAIStore()
  const { selectedText, currentProjectId, currentChapterId } = useEditorStore()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState('rewrite')
  const [result, setResult] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedText) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai/smart-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText,
          action,
          projectId: currentProjectId,
          chapterId: currentChapterId,
        }),
      })
      const data = await res.json()
      setResult(data.result)
    } catch {
      setResult('Failed to generate suggestion. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!result || !currentProjectId) return
    // Log the accepted edit for AI learning
    // Note: Editor integration would use document.execCommand or a callback
    // For now, copy to clipboard so user can paste
    await navigator.clipboard.writeText(result)
    if (currentProjectId) {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await logAcceptedEdit(supabase, currentProjectId, selectedText ?? '', result)
    }
    setResult(null)
    setPanelMode('chat')
  }

  const handleReject = async () => {
    if (!result || !currentProjectId) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await logRejectedEdit(supabase, currentProjectId, result)
    setResult(null)
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Smart Edit</h3>
        <p className="text-xs text-muted-foreground">Select text in the editor, then choose an action.</p>
      </div>

      {selectedText ? (
        <div className="mb-4 rounded-md bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Selected text</p>
          <p className="text-sm line-clamp-4">{selectedText}</p>
        </div>
      ) : (
        <div className="mb-4 rounded-md border-2 border-dashed p-4 text-center">
          <p className="text-xs text-muted-foreground">Select text in the editor to edit</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Action</p>
        <div className="flex flex-wrap gap-1.5">
          {SMART_EDIT_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAction(a.id)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors border',
                action === a.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!selectedText || loading}
        className="mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate suggestion'
        )}
      </Button>

      {result && (
        <div className="flex-1 flex flex-col">
          <div className="rounded-md border bg-muted/30 p-3 mb-3 flex-1 overflow-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">Suggestion</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{result}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept} className="flex-1 gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Accept (copies to clipboard)
            </Button>
            <Button size="sm" variant="outline" onClick={handleReject} className="gap-1.5">
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
            <Button size="sm" variant="ghost" onClick={handleGenerate} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
