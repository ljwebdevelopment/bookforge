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
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, owner_id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (!project) notFound()

  return (
    <WorkspaceLayout projectId={projectId} projectTitle={project.title}>
      {children}
    </WorkspaceLayout>
  )
}
