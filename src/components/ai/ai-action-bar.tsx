'use client'

import { Lightbulb, PenLine, List, FileText, AlertCircle, Telescope } from 'lucide-react'
import { Button } from '@/components/ui/button'

const QUICK_ACTIONS = [
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb, prompt: 'Help me brainstorm ideas for this section.' },
  { id: 'continue', label: 'Continue', icon: PenLine, prompt: 'Continue writing from where I left off, maintaining my voice and style.' },
  { id: 'outline', label: 'Outline', icon: List, prompt: 'Create a detailed outline for the next section.' },
  { id: 'draft', label: 'Draft', icon: FileText, prompt: 'Write a first draft for the next section.' },
  { id: 'issues', label: 'Issues', icon: AlertCircle, prompt: 'Analyze this section for any issues: clarity, flow, consistency, or style problems.' },
  { id: 'analyze', label: 'Analyze', icon: Telescope, prompt: 'Analyze the overall structure and effectiveness of what I\'ve written so far.' },
]

interface AiActionBarProps {
  onAction: (prompt: string) => void
}

export function AiActionBar({ onAction }: AiActionBarProps) {
  return (
    <div className="border-t bg-muted/20 px-3 py-2">
      <div className="grid grid-cols-3 gap-1">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 justify-start"
              onClick={() => onAction(action.prompt)}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span>{action.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
