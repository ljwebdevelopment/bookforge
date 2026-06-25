'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { shouldCreateSnapshot, markSnapshotCreated } from '@/lib/editor/autosave'

export async function saveChapter(
  chapterId: string,
  projectId: string,
  content: unknown,
  wordCount: number
) {
  const supabase = await createClient()

  // Save chapter content
  const { error } = await supabase
    .from('chapters')
    .update({ content: content as never, word_count: wordCount, updated_at: new Date().toISOString() })
    .eq('id', chapterId)

  if (error) throw error

  // Update project word count (aggregate across all chapters)
  const { data: chapters } = await supabase
    .from('chapters')
    .select('word_count')
    .eq('project_id', projectId)

  const totalWords = chapters?.reduce((sum, c) => sum + (c.word_count ?? 0), 0) ?? 0

  await supabase
    .from('projects')
    .update({ word_count: totalWords, last_edited_at: new Date().toISOString() })
    .eq('id', projectId)

  // Create version snapshot if threshold met
  if (shouldCreateSnapshot(wordCount)) {
    await supabase.from('versions').insert({
      project_id: projectId,
      chapter_id: chapterId,
      content: content as never,
      word_count: wordCount,
    })
    markSnapshotCreated(wordCount)
  }

  await supabase.from('activity_log').insert({
    project_id: projectId,
    action: 'save_chapter',
    metadata: { chapter_id: chapterId, word_count: wordCount },
  })
}

export async function createChapter(projectId: string, title?: string) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('chapters')
    .select('order')
    .eq('project_id', projectId)
    .order('order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.order ?? -1) + 1

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      project_id: projectId,
      title: title ?? `Chapter ${nextOrder + 1}`,
      order: nextOrder,
    })
    .select('id')
    .single()

  if (error) throw error
  revalidatePath(`/projects/${projectId}/manuscript`)
  return data.id
}

export async function updateChapterTitle(chapterId: string, title: string, projectId: string) {
  const supabase = await createClient()
  await supabase.from('chapters').update({ title }).eq('id', chapterId)
  revalidatePath(`/projects/${projectId}/manuscript`)
}

export async function deleteChapter(chapterId: string, projectId: string) {
  const supabase = await createClient()
  await supabase.from('chapters').delete().eq('id', chapterId)
  revalidatePath(`/projects/${projectId}/manuscript`)
}

export async function reorderChapters(projectId: string, orderedIds: string[]) {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('chapters').update({ order: index }).eq('id', id)
    )
  )
  revalidatePath(`/projects/${projectId}/manuscript`)
}
