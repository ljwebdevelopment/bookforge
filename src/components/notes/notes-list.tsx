'use client'

import { cn, formatDate } from '@/lib/utils'
import { Tables } from '@/lib/supabase/types'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteNote } from '@/actions/note-actions'
import { useTransition } from 'react'
import { toast } from 'sonner'

type Note = Tables<'notes'>

interface NotesListProps {
  notes: Note[]
  selectedId: string | null
  onSelect: (note: Note) => void
  onDeleted: () => void
}

export function NotesList({ notes, selectedId, onSelect, onDeleted }: NotesListProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${note.title}"?`)) return
    startTransition(async () => {
      await deleteNote(note.id, note.project_id!)
      onDeleted()
      toast.success('Note deleted')
    })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {notes.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground">No notes yet</div>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelect(note)}
            className={cn(
              'group cursor-pointer border-b p-3 transition-colors hover:bg-accent/50',
              selectedId === note.id && 'bg-accent'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{note.title ?? 'Untitled'}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {note.content ? note.content.slice(0, 60) : 'Empty'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(note.updated_at ?? note.created_at ?? '')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => handleDelete(note, e)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {note.tags && note.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {(note.tags as string[]).map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
