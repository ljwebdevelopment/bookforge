'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createResearchItem(
  projectId: string,
  type: 'pdf' | 'image' | 'screenshot' | 'link' | 'quote' | 'note',
  data: { title?: string; content?: string; url?: string; file_url?: string }
) {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('research')
    .insert({ project_id: projectId, type, ...data })
    .select('id')
    .single()

  if (error) throw error
  revalidatePath(`/projects/${projectId}/research`)
  return item.id
}

export async function deleteResearchItem(itemId: string, projectId: string) {
  const supabase = await createClient()
  await supabase.from('research').delete().eq('id', itemId)
  revalidatePath(`/projects/${projectId}/research`)
}

export async function updateResearchItem(
  itemId: string,
  projectId: string,
  updates: { title?: string; content?: string }
) {
  const supabase = await createClient()
  await supabase.from('research').update(updates).eq('id', itemId)
  revalidatePath(`/projects/${projectId}/research`)
}
