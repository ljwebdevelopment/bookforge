import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type MemoryType =
  | 'outline' | 'summary' | 'voice' | 'rules' | 'characters'
  | 'timeline' | 'themes' | 'research' | 'accepted_edits' | 'rejected_edits'

export async function upsertMemory(
  supabase: SupabaseClient<Database>,
  projectId: string,
  memoryType: MemoryType,
  content: string
) {
  return supabase.from('ai_memory').upsert(
    { project_id: projectId, memory_type: memoryType, content, updated_at: new Date().toISOString() },
    { onConflict: 'project_id,memory_type' }
  )
}

export async function appendToMemory(
  supabase: SupabaseClient<Database>,
  projectId: string,
  memoryType: MemoryType,
  newContent: string
) {
  const { data: existing } = await supabase
    .from('ai_memory')
    .select('content')
    .eq('project_id', projectId)
    .eq('memory_type', memoryType)
    .single()

  const combined = existing?.content
    ? `${existing.content}\n\n${newContent}`
    : newContent

  // Keep under ~8000 chars per memory entry
  const truncated = combined.length > 8000 ? combined.slice(-8000) : combined
  return upsertMemory(supabase, projectId, memoryType, truncated)
}

export async function logAcceptedEdit(
  supabase: SupabaseClient<Database>,
  projectId: string,
  original: string,
  revised: string
) {
  const entry = `ORIGINAL: ${original.slice(0, 200)}\nREVISED: ${revised.slice(0, 200)}`
  await appendToMemory(supabase, projectId, 'accepted_edits', entry)

  await supabase.from('activity_log').insert({
    project_id: projectId,
    action: 'accepted_edit',
    metadata: { original: original.slice(0, 500), revised: revised.slice(0, 500) },
  })
}

export async function logRejectedEdit(
  supabase: SupabaseClient<Database>,
  projectId: string,
  suggestion: string
) {
  const entry = `REJECTED: ${suggestion.slice(0, 200)}`
  await appendToMemory(supabase, projectId, 'rejected_edits', entry)
}
