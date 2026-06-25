'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { updateNote } from '@/actions/note-actions'
import { Tables } from '@/lib/supabase/types'

type Note = Tables<'notes'>

interface NoteEditorProps {
  note: Note
  onSaved: () => void
}

export function NoteEditor({ note, onSaved }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title ?? '')
  const [content, setContent] = useState(note.content ?? '')
  const [tags, setTags] = useState<string[]>((note.tags as string[]) ?? [])
  const [newTag, setNewTag] = useState('')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle(note.title ?? '')
    setContent(note.content ?? '')
    setTags((note.tags as string[]) ?? [])
  }, [note.id])

  const triggerSave = (updates: { title?: string; content?: string; tags?: string[] }) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      await updateNote(note.id, note.project_id!, updates)
      onSaved()
    }, 1000)
  }

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (!tag || tags.includes(tag)) { setNewTag(''); return }
    const updated = [...tags, tag]
    setTags(updated)
    setNewTag('')
    triggerSave({ tags: updated })
  }

  const handleRemoveTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag)
    setTags(updated)
    triggerSave({ tags: updated })
  }

  return (
    <div className="flex h-full flex-col p-4 gap-3">
      <Input
        value={title}
        onChange={(e) => { setTitle(e.target.value); triggerSave({ title: e.target.value }) }}
        placeholder="Note title..."
        className="text-lg font-medium border-none px-0 shadow-none focus-visible:ring-0 text-foreground"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button onClick={() => handleRemoveTag(tag)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
            placeholder="Add tag..."
            className="h-6 w-20 text-xs border-dashed"
          />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddTag}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); triggerSave({ content: e.target.value }) }}
        placeholder="Start writing your note..."
        className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 p-0 text-sm leading-relaxed"
      />
    </div>
  )
}
