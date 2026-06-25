import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GuidelinesClient } from '@/components/guidelines/guidelines-client'

export default async function GuidelinesPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: guidelines } = await supabase
    .from('writing_guidelines')
    .select('guidelines')
    .eq('project_id', projectId)
    .single()

  const { data: memory } = await supabase
    .from('ai_memory')
    .select('memory_type, content, updated_at')
    .eq('project_id', projectId)

  return (
    <GuidelinesClient
      projectId={projectId}
      initialGuidelines={guidelines?.guidelines ?? ''}
      memory={memory ?? []}
    />
  )
}
