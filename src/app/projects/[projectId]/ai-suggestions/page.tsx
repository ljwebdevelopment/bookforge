import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AiSuggestionsClient } from '@/components/ai/ai-suggestions-client'

export default async function AiSuggestionsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: suggestions } = await supabase
    .from('ai_suggestions')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return <AiSuggestionsClient suggestions={(suggestions ?? []) as never} projectId={projectId} />
}
