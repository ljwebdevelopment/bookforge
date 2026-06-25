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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <HumanPassPageClient projectId={projectId} />
}
