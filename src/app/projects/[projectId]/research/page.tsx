import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResearchLibrary } from '@/components/research/research-library'

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('research')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return <ResearchLibrary projectId={projectId} initialItems={(items ?? []) as never} />
}
