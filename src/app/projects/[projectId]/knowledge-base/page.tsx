import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KnowledgeBaseClient } from '@/components/knowledge-base/knowledge-base-client'

export default async function KnowledgeBasePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [entriesRes, chaptersRes] = await Promise.all([
    supabase
      .from('knowledge_base')
      .select('*')
      .eq('project_id', projectId)
      .order('type', { ascending: true }),
    supabase
      .from('chapters')
      .select('id, title, order')
      .eq('project_id', projectId)
      .order('order', { ascending: true }),
  ])

  return (
    <KnowledgeBaseClient
      projectId={projectId}
      initialEntries={(entriesRes.data ?? []) as never}
      chapters={chaptersRes.data ?? []}
    />
  )
}
