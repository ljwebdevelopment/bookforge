'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tables } from '@/lib/supabase/types'
import { KNOWLEDGE_BASE_TYPES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { extractKnowledgeBaseEntities } from '@/actions/ai-actions'
import { useEditorStore } from '@/stores/editor-store'

type KBEntry = Tables<'knowledge_base'>

interface Chapter {
  id: string
  title: string
  order: number
}

interface KnowledgeBaseClientProps {
  projectId: string
  initialEntries: KBEntry[]
  chapters?: Chapter[]
}

export function KnowledgeBaseClient({ projectId, initialEntries, chapters }: KnowledgeBaseClientProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [creating, setCreating] = useState(false)
  const [newEntry, setNewEntry] = useState({ type: 'person', name: '', description: '' })
  const [isPending, startTransition] = useTransition()
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const { currentChapterId } = useEditorStore()

  const targetChapterId = currentChapterId ?? selectedChapterId
  const showChapterPicker = !currentChapterId && chapters && chapters.length > 0

  const filtered = entries.filter((e) => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || e.type === filterType
    return matchSearch && matchType
  })

  const handleCreate = async () => {
    if (!newEntry.name.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('knowledge_base')
      .insert({ project_id: projectId, ...newEntry, type: newEntry.type as KBEntry['type'], data: {} })
      .select()
      .single()
    if (data) setEntries([...entries, data])
    setCreating(false)
    setNewEntry({ type: 'person', name: '', description: '' })
    toast.success('Entry created')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    const supabase = createClient()
    await supabase.from('knowledge_base').delete().eq('id', id)
    setEntries(entries.filter((e) => e.id !== id))
    toast.success('Entry deleted')
  }

  const handleAutoExtract = async () => {
    if (!targetChapterId) { toast.error('Select a chapter first'); return }
    startTransition(async () => {
      try {
        const added = await extractKnowledgeBaseEntities(projectId, targetChapterId)
        const supabase = createClient()
        const { data } = await supabase.from('knowledge_base').select('*').eq('project_id', projectId)
        if (data) setEntries(data)
        if (added) {
          toast.success(`${added} new ${added === 1 ? 'entity' : 'entities'} added to knowledge base`)
        } else {
          toast.info('No new entities found — all are already in the knowledge base')
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Extraction failed. Please try again.')
      }
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">Knowledge Base</h1>
          <div className="flex gap-2">
            {showChapterPicker && (
              <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select chapter..." />
                </SelectTrigger>
                <SelectContent>
                  {chapters!.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={handleAutoExtract} disabled={isPending || !targetChapterId}>
              <Sparkles className="mr-2 h-4 w-4" />
              Auto-extract
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add entry
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-8" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {KNOWLEDGE_BASE_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.icon} {t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No entries found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => {
              const typeInfo = KNOWLEDGE_BASE_TYPES.find((t) => t.id === entry.type)
              return (
                <div key={entry.id} className="group relative rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg shrink-0">{typeInfo?.icon ?? '📌'}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{entry.name}</p>
                      <Badge variant="secondary" className="text-xs mt-0.5">{typeInfo?.label ?? entry.type}</Badge>
                    </div>
                  </div>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">{entry.description}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Knowledge Base Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KNOWLEDGE_BASE_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.icon} {t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={newEntry.name} onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })} placeholder="Name" className="mt-1.5" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} placeholder="Description..." className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newEntry.name.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
