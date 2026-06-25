'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Image, Link, Quote, StickyNote, Camera, ExternalLink, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResearchUpload } from './research-upload'
import { deleteResearchItem } from '@/actions/research-actions'
import { Tables } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Research = Tables<'research'>

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
  screenshot: <Camera className="h-5 w-5" />,
  link: <Link className="h-5 w-5" />,
  quote: <Quote className="h-5 w-5" />,
  note: <StickyNote className="h-5 w-5" />,
}

const TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  image: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  screenshot: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  link: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  quote: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  note: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

interface ResearchLibraryProps {
  projectId: string
  initialItems: Research[]
}

type FilterType = 'all' | Research['type']

export function ResearchLibrary({ projectId, initialItems }: ResearchLibraryProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterType>('all')
  const [isPending, startTransition] = useTransition()

  const filtered = filter === 'all' ? initialItems : initialItems.filter((i) => i.type === filter)
  const types = ['all', ...new Set(initialItems.map((i) => i.type))] as FilterType[]

  const handleDelete = (item: Research) => {
    if (!confirm('Delete this research item?')) return
    startTransition(async () => {
      await deleteResearchItem(item.id, projectId)
      router.refresh()
      toast.success('Deleted')
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Research Library</h1>
          <Badge variant="secondary">{initialItems.length}</Badge>
        </div>
        <ResearchUpload projectId={projectId} onCreated={() => router.refresh()} />
      </div>

      {types.length > 1 && (
        <div className="flex gap-2 border-b px-6 py-2.5 overflow-x-auto">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize border',
                filter === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <p className="text-sm">No research items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div key={item.id} className="group relative rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={cn('rounded-md p-2', TYPE_COLORS[item.type])}>
                    {TYPE_ICONS[item.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.title ?? 'Untitled'}</p>
                    {item.content && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{item.url}</span>
                      </a>
                    )}
                    {item.file_url && item.type === 'image' && (
                      <img src={item.file_url} alt={item.title ?? ''} className="mt-2 rounded max-h-24 object-cover" />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(item.created_at ?? '')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
