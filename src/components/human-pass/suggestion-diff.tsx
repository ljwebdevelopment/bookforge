'use client'

import { diffWords } from 'diff'
import { cn } from '@/lib/utils'

interface SuggestionDiffProps {
  original: string
  suggestion: string
}

export function SuggestionDiff({ original, suggestion }: SuggestionDiffProps) {
  const diffs = diffWords(original, suggestion)

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Original</p>
        <div className="rounded-md bg-muted/30 border p-3 leading-relaxed min-h-[60px]">
          {diffs.map((part, i) => (
            part.removed ? (
              <span key={i} className="bg-red-200/70 dark:bg-red-900/40 text-red-800 dark:text-red-300 line-through rounded-sm px-0.5">
                {part.value}
              </span>
            ) : !part.added ? (
              <span key={i}>{part.value}</span>
            ) : null
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Suggested</p>
        <div className="rounded-md bg-muted/30 border p-3 leading-relaxed min-h-[60px]">
          {diffs.map((part, i) => (
            part.added ? (
              <span key={i} className="bg-green-200/70 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-sm px-0.5">
                {part.value}
              </span>
            ) : !part.removed ? (
              <span key={i}>{part.value}</span>
            ) : null
          ))}
        </div>
      </div>
    </div>
  )
}
