'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createChapter, deleteChapter, updateChapterTitle, reorderChapters } from '@/actions/chapter-actions'
import { Tables } from '@/lib/supabase/types'
import { toast } from 'sonner'

type Chapter = Tables<'chapters'>

interface ChapterListProps {
  projectId: string
  chapters: Chapter[]
  currentChapterId: string | null
  onSelectChapter: (chapter: Chapter) => void
}

export function ChapterList({ projectId, chapters, currentChapterId, onSelectChapter }: ChapterListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const id = await createChapter(projectId)
        toast.success('Chapter created')
      } catch {
        toast.error('Failed to create chapter')
      }
    })
  }

  const handleDelete = (chapter: Chapter) => {
    if (chapters.length <= 1) {
      toast.error('Cannot delete the only chapter')
      return
    }
    if (!confirm(`Delete "${chapter.title}"?`)) return
    startTransition(async () => {
      try {
        await deleteChapter(chapter.id, projectId)
      } catch {
        toast.error('Failed to delete chapter')
      }
    })
  }

  const handleRename = (chapter: Chapter) => {
    setEditingId(chapter.id)
    setEditingTitle(chapter.title)
  }

  const handleRenameSubmit = (chapter: Chapter) => {
    if (!editingTitle.trim()) return
    startTransition(async () => {
      await updateChapterTitle(chapter.id, editingTitle.trim(), projectId)
    })
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Chapters</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCreate}
          disabled={isPending}
          title="Add chapter"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            className={cn(
              'group flex items-center gap-1 px-2 py-1.5 mx-1 rounded-md cursor-pointer transition-colors text-sm',
              chapter.id === currentChapterId
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent text-foreground'
            )}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            {editingId === chapter.id ? (
              <input
                className="flex-1 bg-transparent text-sm outline-none border-b border-primary"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleRenameSubmit(chapter)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit(chapter)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                autoFocus
              />
            ) : (
              <span
                className="flex-1 truncate"
                onClick={() => onSelectChapter(chapter)}
                onDoubleClick={() => handleRename(chapter)}
                title={chapter.title}
              >
                {chapter.title}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
              onClick={() => handleDelete(chapter)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
