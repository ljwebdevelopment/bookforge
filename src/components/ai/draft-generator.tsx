'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Check, X, RefreshCw } from 'lucide-react'

interface DraftGeneratorProps {
  projectId: string
}

export function DraftGenerator({ projectId }: DraftGeneratorProps) {
  const [outlineNode, setOutlineNode] = useState('')
  const [instructions, setInstructions] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!outlineNode.trim()) return
    setLoading(true)
    setDraft('')

    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, outlineNode, instructions }),
      })

      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setDraft(text)
      }
    } catch {
      setDraft('Failed to generate draft. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft)
  }

  return (
    <div className="flex h-full flex-col p-4 gap-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Draft Generator</h3>
        <p className="text-xs text-muted-foreground">Describe what section to draft and AI will write it in your voice.</p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="outline-node" className="text-xs">Section or outline node</Label>
          <Input
            id="outline-node"
            placeholder="e.g. Chapter 3: The turning point"
            value={outlineNode}
            onChange={(e) => setOutlineNode(e.target.value)}
            className="mt-1.5 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="instructions" className="text-xs">Additional instructions (optional)</Label>
          <Textarea
            id="instructions"
            placeholder="e.g. Start in media res, focus on the emotional conflict..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1.5 text-sm min-h-[70px] resize-none"
          />
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={!outlineNode.trim() || loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Drafting...
          </>
        ) : (
          'Generate draft'
        )}
      </Button>

      {draft && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Draft</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleCopy} className="h-6 text-xs px-2">
                Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={handleGenerate} className="h-6 text-xs px-2" disabled={loading}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-3">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{draft}</p>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
