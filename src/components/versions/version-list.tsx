'use client'

import { Tables } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Clock, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Version = Tables<'versions'>

interface VersionListProps {
  versions: Version[]
  selectedId: string | null
  onSelect: (version: Version) => void
}

export function VersionList({ versions, selectedId, onSelect }: VersionListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h2 className="text-sm font-medium">Version History</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{versions.length} saved versions</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No versions yet</div>
        ) : (
          versions.map((v) => (
            <div
              key={v.id}
              onClick={() => onSelect(v)}
              className={cn(
                'cursor-pointer border-b p-3 transition-colors hover:bg-accent/50',
                selectedId === v.id && 'bg-accent'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {v.label && (
                    <div className="flex items-center gap-1 mb-1">
                      <Tag className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary truncate">{v.label}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(v.created_at ?? '')}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {(v.word_count ?? 0).toLocaleString()} words
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
