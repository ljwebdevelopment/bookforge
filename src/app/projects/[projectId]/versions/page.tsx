import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VersionsClient } from '@/components/versions/versions-client'

export default async function VersionsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title')
    .eq('project_id', projectId)
    .order('order')

  const { data: versions } = await supabase
    .from('versions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return (
    <VersionsClient
      projectId={projectId}
      chapters={(chapters ?? []) as never}
      versions={(versions ?? []) as never}
    />
  )
}
