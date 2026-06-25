'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PROJECT_TEMPLATES } from '@/lib/constants'

export async function createProject(
  title: string,
  template: string = 'blank',
  genre?: string,
  subtitle?: string,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ensure owner record exists
  await supabase.from('owner').upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })

  const targetWordCount = 80000

  const templateConfig = PROJECT_TEMPLATES.find((t) => t.id === template)

  // Create project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      title,
      subtitle: subtitle ?? null,
      genre: genre ?? null,
      template,
      target_word_count: targetWordCount,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error || !project) throw new Error('Failed to create project')

  const projectId = project.id

  // Create related records in parallel
  await Promise.all([
    supabase.from('project_settings').insert({
      project_id: projectId,
      ai_model: 'gemini-2.5-flash',
    }),
    supabase.from('writing_guidelines').insert({
      project_id: projectId,
      guidelines: templateConfig?.defaultGuidelines ?? '',
    }),
    supabase.from('chapters').insert({
      project_id: projectId,
      title: 'Chapter 1',
      order: 0,
    }),
    supabase.from('outlines').insert({
      project_id: projectId,
      title: title,
      level: 1,
      order: 0,
    }),
  ])

  revalidatePath('/')
  redirect(`/projects/${projectId}/manuscript`)
}

export async function updateProject(projectId: string, updates: {
  title?: string
  subtitle?: string | null
  genre?: string | null
  status?: 'draft' | 'in_progress' | 'complete' | 'published'
  target_word_count?: number | null
  cover_image?: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .update({ ...updates, last_edited_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) throw error
  revalidatePath('/')
  revalidatePath(`/projects/${projectId}`)
}

export async function toggleFavorite(projectId: string, isFavorite: boolean) {
  const supabase = await createClient()
  await supabase.from('projects').update({ is_favorite: isFavorite }).eq('id', projectId)
  revalidatePath('/')
}

export async function archiveProject(projectId: string) {
  const supabase = await createClient()
  await supabase.from('projects').update({ is_archived: true }).eq('id', projectId)
  revalidatePath('/')
  redirect('/')
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  await supabase.from('projects').delete().eq('id', projectId)
  revalidatePath('/')
  redirect('/')
}
