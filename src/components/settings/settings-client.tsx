'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GENRES, DEFAULT_AI_MODEL } from '@/lib/constants'
import { updateProject, deleteProject } from '@/actions/project-actions'
import { Tables } from '@/lib/supabase/types'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

type Project = Tables<'projects'>
type ProjectSettings = Tables<'project_settings'>

interface SettingsClientProps {
  project: Project
  settings: ProjectSettings | null
}

const AI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Most capable)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Fast)' },
]

export function SettingsClient({ project, settings }: SettingsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(project.title)
  const [subtitle, setSubtitle] = useState(project.subtitle ?? '')
  const [genre, setGenre] = useState(project.genre ?? '')
  const [targetWordCount, setTargetWordCount] = useState(project.target_word_count?.toString() ?? '')
  const [aiModel, setAiModel] = useState(settings?.ai_model ?? DEFAULT_AI_MODEL)

  const handleSave = () => {
    startTransition(async () => {
      await updateProject(project.id, {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        genre: genre || null,
        target_word_count: targetWordCount ? parseInt(targetWordCount) : null,
      })
      // Update project settings
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('project_settings').upsert({ project_id: project.id, ai_model: aiModel }, { onConflict: 'project_id' })
      toast.success('Settings saved')
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return
    startTransition(async () => {
      await deleteProject(project.id)
      router.push('/')
    })
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Project Settings</h1>
      </div>

      <div className="flex-1 p-6 max-w-2xl space-y-8">
        {/* Basic info */}
        <section className="space-y-4">
          <h2 className="font-medium">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Project subtitle" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="genre">Genre (optional)</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre" className="mt-1.5">
                  <SelectValue placeholder="Select genre..." />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target">Target word count</Label>
              <Input
                id="target"
                type="number"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(e.target.value)}
                placeholder="e.g. 80000"
                className="mt-1.5"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* AI settings */}
        <section className="space-y-4">
          <h2 className="font-medium">AI Settings</h2>
          <div>
            <Label htmlFor="ai-model">AI Model</Label>
            <Select value={aiModel} onValueChange={setAiModel}>
              <SelectTrigger id="ai-model" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending || !title.trim()}>
            {isPending ? 'Saving...' : 'Save settings'}
          </Button>
        </div>

        <Separator />

        {/* Danger zone */}
        <section className="space-y-4">
          <h2 className="font-medium text-destructive">Danger Zone</h2>
          <div className="rounded-lg border border-destructive/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Delete project</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete this project and all its content. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
