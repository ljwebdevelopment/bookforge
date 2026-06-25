'use client'

import type { UIMessage } from 'ai'
import { cn } from '@/lib/utils'
import { Bot, User, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AiMessageProps {
  message: UIMessage
  onSuggestionClick?: (text: string) => void
}

export function AiMessage({ message, onSuggestionClick }: AiMessageProps) {
  const isAssistant = message.role === 'assistant'

  const rawText = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')

  // Extract <options> suggestion chips from the response
  const optionsMatch = rawText.match(/<options>([\s\S]*?)<\/options>/)
  const displayText = rawText.replace(/<options>[\s\S]*?<\/options>/, '').trim()
  let suggestions: string[] = []
  if (optionsMatch) {
    try {
      suggestions = JSON.parse(optionsMatch[1])
    } catch {
      suggestions = []
    }
  }

  // Collect tool invocations that completed
  type ToolInvocationPart = { type: 'tool-invocation'; toolInvocation: { state: string; toolName: string; result?: { title?: string } } }
  const savedItems = message.parts
    .filter((p) => p.type === 'tool-invocation')
    .map((p) => (p as unknown as ToolInvocationPart).toolInvocation)
    .filter((t) => t.state === 'result' && t.result?.title)

  return (
    <div className={cn('flex gap-3 py-3', isAssistant ? '' : 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
          isAssistant
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      <div className={cn('flex flex-col gap-2', isAssistant ? 'max-w-[85%]' : 'max-w-[85%] items-end')}>
        {displayText && (
          <div
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              isAssistant
                ? 'bg-muted text-foreground'
                : 'bg-primary text-primary-foreground ml-auto'
            )}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{displayText}</p>
          </div>
        )}

        {/* Auto-saved notes/timeline indicators */}
        {savedItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {savedItems.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 text-xs"
              >
                {item.toolName === 'saveNote' ? (
                  <FileText className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {item.toolName === 'saveNote' ? 'Note saved' : 'Timeline entry added'}: {item.result?.title}
              </span>
            ))}
          </div>
        )}

        {/* Suggestion chips */}
        {suggestions.length > 0 && onSuggestionClick && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {suggestions.map((s, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => onSuggestionClick(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
