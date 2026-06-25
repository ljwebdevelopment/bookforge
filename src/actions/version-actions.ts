'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createVersion(
  projectId: string,
  chapterId: string,
  content: unknown,
  wordCount: number,
  label?: string
) {
  const supabase = await createClient()
  const { error } = await supabase.from('versions').insert({
    project_id: projectId,
    chapter_id: chapterId,
    content: content as never,
    word_count: wordCount,
    label: label ?? null,
  })
  if (error) throw error
  revalidatePath(`/projects/${projectId}/versions`)
}

export async function restoreVersion(
  versionId: string,
  chapterId: string,
  projectId: string
) {
  const supabase = await createClient()

  const { data: version, error } = await supabase
    .from('versions')
    .select('content, word_count')
    .eq('id', versionId)
    .single()

  if (error || !version) throw new Error('Version not found')

  // Snapshot current state before restoring
  const { data: current } = await supabase
    .from('chapters')
    .select('content, word_count')
    .eq('id', chapterId)
    .single()

  if (current) {
    await supabase.from('versions').insert({
      project_id: projectId,
      chapter_id: chapterId,
      content: current.content as never,
      word_count: current.word_count,
      label: 'Before restore',
    })
  }

  // Restore
  await supabase
    .from('chapters')
    .update({ content: version.content as never, word_count: version.word_count })
    .eq('id', chapterId)

  revalidatePath(`/projects/${projectId}/versions`)
  revalidatePath(`/projects/${projectId}/manuscript`)
  return { content: version.content, wordCount: version.word_count }
}
