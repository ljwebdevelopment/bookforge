'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NotesList } from './notes-list'
import { NoteEditor } from './note-editor'
import { TagFilter } from './tag-filter'
import { createNote } from '@/actions/note-actions'
import { Tables } from '@/lib/supabase/types'
import { toast } from 'sonner'

type Note = Tables<'notes'>

interface NotesPageClientProps {
  projectId: string
  initialNotes: Note[]
}

export function NotesPageClient({ projectId, initialNotes }: NotesPageClientProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [selected, setSelected] = useState<Note | null>(notes[0] ?? null)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const allTags = [...new Set(notes.flatMap((n) => (n.tags as string[]) ?? []))]

  const filtered = notes.filter((n) => {
    const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase())
    const matchTags = selectedTags.length === 0 || selectedTags.every((t) => (n.tags as string[])?.includes(t))
    return matchSearch && matchTags
  })

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const id = await createNote(projectId, 'New Note')
        router.refresh()
        toast.success('Note created')
      } catch {
        toast.error('Failed to create note')
      }
    })
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[260px] shrink-0 border-r flex flex-col h-full">
        <div className="flex items-center gap-2 p-3 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="pl-7 h-8 text-sm"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCreate} disabled={isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <TagFilter
          tags={allTags}
          selected={selectedTags}
          onToggle={(t) => setSelectedTags((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t])}
          onClear={() => setSelectedTags([])}
        />
        <NotesList
          notes={filtered}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          onDeleted={() => { router.refresh(); setSelected(null) }}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        {selected ? (
          <NoteEditor note={selected} onSaved={() => router.refresh()} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Select a note or create a new one</p>
              <Button variant="link" onClick={handleCreate} disabled={isPending}>
                Create note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
