import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectGrid } from '@/components/dashboard/project-grid'
import { NewProjectModal } from '@/components/dashboard/new-project-modal'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .eq('is_archived', false)
    .order('last_edited_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-muted-foreground mt-1">Start writing, continue a draft, or create something new.</p>
        </div>
        <NewProjectModal />
      </div>
      <ProjectGrid projects={projects ?? []} />
    </div>
  )
}
