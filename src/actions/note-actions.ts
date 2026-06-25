'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createNote(projectId: string, title?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notes')
    .insert({ project_id: projectId, title: title ?? 'New Note', content: '', tags: [] })
    .select('id')
    .single()

  if (error) throw error
  revalidatePath(`/projects/${projectId}/notes`)
  return data.id
}

export async function updateNote(
  noteId: string,
  projectId: string,
  updates: { title?: string; content?: string; tags?: string[] }
) {
  const supabase = await createClient()
  await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', noteId)
  revalidatePath(`/projects/${projectId}/notes`)
}

export async function deleteNote(noteId: string, projectId: string) {
  const supabase = await createClient()
  await supabase.from('notes').delete().eq('id', noteId)
  revalidatePath(`/projects/${projectId}/notes`)
}
