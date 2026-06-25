'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/ui-store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { createClient } from '@/lib/supabase/client'
import { FileText, StickyNote, Search, BookOpen, Plus } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'

interface SearchResult {
  id: string
  type: 'chapter' | 'note' | 'project'
  title: string
  subtitle?: string
  projectId: string
  href: string
}

export function GlobalSearch({ hideButton }: { hideButton?: boolean }) {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const { currentProjectId } = useEditorStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!commandPaletteOpen) { setQuery(''); setResults([]); return }
  }, [commandPaletteOpen])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return }

    const search = async () => {
      const supabase = createClient()
      const [chapters, notes, projects] = await Promise.all([
        supabase.from('chapters').select('id, title, project_id').ilike('title', `%${query}%`).limit(5),
        supabase.from('notes').select('id, title, project_id').ilike('title', `%${query}%`).limit(5),
        supabase.from('projects').select('id, title').ilike('title', `%${query}%`).limit(5),
      ])

      const r: SearchResult[] = [
        ...(chapters.data ?? []).map((c) => ({
          id: c.id, type: 'chapter' as const, title: c.title, projectId: c.project_id!,
          href: `/projects/${c.project_id}/manuscript?chapter=${c.id}`,
        })),
        ...(notes.data ?? []).map((n) => ({
          id: n.id, type: 'note' as const, title: n.title ?? 'Untitled', projectId: n.project_id!,
          href: `/projects/${n.project_id}/notes`,
        })),
        ...(projects.data ?? []).map((p) => ({
          id: p.id, type: 'project' as const, title: p.title, projectId: p.id,
          href: `/projects/${p.id}/manuscript`,
        })),
      ]
      setResults(r)
    }

    const t = setTimeout(search, 200)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = (href: string) => {
    router.push(href)
    setCommandPaletteOpen(false)
  }

  const TYPE_ICONS = {
    chapter: <FileText className="h-4 w-4" />,
    note: <StickyNote className="h-4 w-4" />,
    project: <BookOpen className="h-4 w-4" />,
  }

  const chapters = results.filter((r) => r.type === 'chapter')
  const notes = results.filter((r) => r.type === 'note')
  const projects = results.filter((r) => r.type === 'project')

  return (
    <>
      {!hideButton && (
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-2 rounded bg-background px-1.5 py-0.5 text-xs border">⌘K</kbd>
        </button>
      )}

      <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <CommandInput
          placeholder="Search chapters, notes, projects..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query.length < 2 ? 'Start typing to search...' : 'No results found.'}
          </CommandEmpty>

          {projects.length > 0 && (
            <CommandGroup heading="Projects">
              {projects.map((r) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                  {TYPE_ICONS[r.type]}
                  <span>{r.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {chapters.length > 0 && (
            <CommandGroup heading="Chapters">
              {chapters.map((r) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                  {TYPE_ICONS[r.type]}
                  <span>{r.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {notes.length > 0 && (
            <CommandGroup heading="Notes">
              {notes.map((r) => (
                <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                  {TYPE_ICONS[r.type]}
                  <span>{r.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {currentProjectId && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => handleSelect(`/projects/${currentProjectId}/notes`)}>
                  <Plus className="h-4 w-4" />
                  New note
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
