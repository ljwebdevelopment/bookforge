'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { toast } from 'sonner'

type TimelineEvent = Tables<'timeline'>

interface TimelineClientProps {
  projectId: string
  initialEvents: TimelineEvent[]
}

export function TimelineClient({ projectId, initialEvents }: TimelineClientProps) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('timeline')
      .insert({ project_id: projectId, title: 'New event', order: events.length })
      .select()
      .single()
    if (data) {
      setEvents([...events, data])
      setEditingId(data.id)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<TimelineEvent>) => {
    const supabase = createClient()
    await supabase.from('timeline').update(updates).eq('id', id)
    setEvents(events.map((e) => e.id === id ? { ...e, ...updates } : e))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    const supabase = createClient()
    await supabase.from('timeline').delete().eq('id', id)
    setEvents(events.filter((e) => e.id !== id))
    toast.success('Event deleted')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Timeline</h1>
        <Button onClick={handleCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add event
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No timeline events yet.</p>
            <Button variant="link" onClick={handleCreate}>Add your first event</Button>
          </div>
        ) : (
          <div className="relative space-y-4 pl-8 before:absolute before:left-3.5 before:top-0 before:bottom-0 before:w-0.5 before:bg-border">
            {events.map((event) => (
              <div key={event.id} className="group relative">
                <div className="absolute -left-[18px] top-3 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                {editingId === event.id ? (
                  <div className="rounded-lg border p-3 space-y-2">
                    <Input
                      defaultValue={event.title}
                      placeholder="Event title"
                      onBlur={(e) => handleUpdate(event.id, { title: e.target.value })}
                      className="font-medium"
                    />
                    <Input
                      defaultValue={event.date ?? ''}
                      placeholder="Date or timeframe (e.g. 1985, Summer 2020)"
                      onBlur={(e) => handleUpdate(event.id, { date: e.target.value || null })}
                      type="text"
                    />
                    <Textarea
                      defaultValue={event.description ?? ''}
                      placeholder="Description..."
                      onBlur={(e) => handleUpdate(event.id, { description: e.target.value || null })}
                      className="min-h-[60px] resize-none"
                    />
                    <Button size="sm" onClick={() => setEditingId(null)}>Done</Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer rounded-lg border p-3 hover:bg-accent/30 transition-colors"
                    onClick={() => setEditingId(event.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {event.date && <p className="text-xs text-muted-foreground mb-0.5">{event.date}</p>}
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={(e) => { e.stopPropagation(); handleDelete(event.id) }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
