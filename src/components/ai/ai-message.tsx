'use client'

import type { UIMessage } from 'ai'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface AiMessageProps {
  message: UIMessage
}

export function AiMessage({ message }: AiMessageProps) {
  const isAssistant = message.role === 'assistant'
  const text = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')

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
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isAssistant
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground ml-auto'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
