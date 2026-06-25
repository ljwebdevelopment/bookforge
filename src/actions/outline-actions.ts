'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createOutlineNode(
  projectId: string,
  title: string,
  parentId: string | null,
  level: number,
  order: number
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('outlines')
    .insert({ project_id: projectId, title, parent_id: parentId, level, order })
    .select('id')
    .single()

  if (error) throw error
  revalidatePath(`/projects/${projectId}/outline`)
  return data.id
}

export async function updateOutlineNode(
  nodeId: string,
  projectId: string,
  updates: { title?: string; completion_status?: 'not_started' | 'in_progress' | 'complete'; notes?: string; linked_chapter_id?: string | null }
) {
  const supabase = await createClient()
  await supabase.from('outlines').update(updates).eq('id', nodeId)
  revalidatePath(`/projects/${projectId}/outline`)
}

export async function deleteOutlineNode(nodeId: string, projectId: string) {
  const supabase = await createClient()
  await supabase.from('outlines').delete().eq('id', nodeId)
  revalidatePath(`/projects/${projectId}/outline`)
}

export async function reorderOutlineNodes(
  updates: { id: string; order: number; parent_id: string | null }[]
) {
  const supabase = await createClient()
  await Promise.all(
    updates.map(({ id, order, parent_id }) =>
      supabase.from('outlines').update({ order, parent_id }).eq('id', id)
    )
  )
}
