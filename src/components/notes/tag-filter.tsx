'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface TagFilterProps {
  tags: string[]
  selected: string[]
  onToggle: (tag: string) => void
  onClear: () => void
}

export function TagFilter({ tags, selected, onToggle, onClear }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b">
      <span className="text-xs text-muted-foreground">Filter:</span>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs transition-colors border',
            selected.includes(tag)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:bg-accent'
          )}
        >
          {tag}
        </button>
      ))}
      {selected.length > 0 && (
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  )
}
