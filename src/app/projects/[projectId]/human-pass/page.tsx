import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HumanPassPageClient } from '@/components/human-pass/human-pass-page-client'

export default async function HumanPassPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) redirect('/login')

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, order')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  return <HumanPassPageClient projectId={projectId} chapters={chapters ?? []} />
}
