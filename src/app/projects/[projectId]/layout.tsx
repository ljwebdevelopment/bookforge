import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { WorkspaceLayout } from '@/components/workspace/workspace-layout'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  let supabase
  try {
    supabase = await createClient()
  } catch {
    redirect('/login')
  }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) redirect('/login')

  const user = authData.user

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, owner_id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !project) notFound()

  return (
    <WorkspaceLayout projectId={projectId} projectTitle={project.title}>
      {children}
    </WorkspaceLayout>
  )
}
