'use client'

import { diffWords } from 'diff'
import { ScrollArea } from '@/components/ui/scroll-area'

interface VersionDiffProps {
  current: string
  previous: string
}

export function VersionDiff({ current, previous }: VersionDiffProps) {
  const diffs = diffWords(previous, current)

  return (
    <ScrollArea className="h-full">
      <div className="p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap">
        {diffs.map((part, i) => {
          if (part.added) {
            return (
              <span key={i} className="bg-green-200/70 dark:bg-green-900/40 text-green-900 dark:text-green-200 rounded-sm">
                {part.value}
              </span>
            )
          }
          if (part.removed) {
            return (
              <span key={i} className="bg-red-200/70 dark:bg-red-900/40 text-red-900 dark:text-red-200 line-through rounded-sm">
                {part.value}
              </span>
            )
          }
          return <span key={i}>{part.value}</span>
        })}
      </div>
    </ScrollArea>
  )
}
