'use client'

import { useState, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { updateWritingGuidelines } from '@/actions/ai-actions'
import { formatDate } from '@/lib/utils'
import { Check, Brain } from 'lucide-react'
import { toast } from 'sonner'

interface GuidelinesClientProps {
  projectId: string
  initialGuidelines: string
  memory: { memory_type: string; content: string; updated_at: string }[]
}

const MEMORY_TYPE_LABELS: Record<string, string> = {
  voice: '🎙️ Voice & Style',
  outline: '📋 Outline Understanding',
  summary: '📝 Project Summary',
  characters: '👤 Characters',
  themes: '🎯 Themes',
  research: '🔬 Research',
  timeline: '📅 Timeline',
  rules: '📏 Rules & Constraints',
  accepted_edits: '✅ Accepted Edits',
  rejected_edits: '❌ Rejected Edits',
}

export function GuidelinesClient({ projectId, initialGuidelines, memory }: GuidelinesClientProps) {
  const [guidelines, setGuidelines] = useState(initialGuidelines)
  const [saved, setSaved] = useState(true)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (value: string) => {
    setGuidelines(value)
    setSaved(false)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      await updateWritingGuidelines(projectId, value)
      setSaved(true)
    }, 1500)
  }

  const handleBlur = async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    await updateWritingGuidelines(projectId, guidelines)
    setSaved(true)
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Writing Guidelines</h1>
          {saved ? (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          These guidelines are included in every AI request. Be specific about your voice, style, and what to avoid.
        </p>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <Textarea
          value={guidelines}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Describe your writing voice, style preferences, and what AI should always do or avoid...

Examples:
- Write in first person, present tense
- Avoid passive voice
- Use short, punchy sentences for tension
- Never use em-dashes
- My voice is conversational but precise"
          className="min-h-[300px] resize-none text-sm leading-relaxed"
        />

        {memory.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="font-medium">AI Memory</h2>
              <Badge variant="secondary">{memory.length} entries</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI learns from your writing over time. These memories are automatically updated based on your accepted edits and project activity.
            </p>
            <div className="space-y-4">
              {memory.map((m) => (
                <div key={m.memory_type} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {MEMORY_TYPE_LABELS[m.memory_type] ?? m.memory_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDate(m.updated_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
