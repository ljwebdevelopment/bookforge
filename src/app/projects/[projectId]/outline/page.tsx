import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OutlineTreeClient } from '@/components/outline/outline-tree-client'

export default async function OutlinePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: outlines } = await supabase
    .from('outlines')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  return <OutlineTreeClient projectId={projectId} flatNodes={(outlines ?? []) as never} />
}
