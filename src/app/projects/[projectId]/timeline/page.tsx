import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimelineClient } from '@/components/timeline/timeline-client'

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('timeline')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  return <TimelineClient projectId={projectId} initialEvents={(events ?? []) as never} />
}
