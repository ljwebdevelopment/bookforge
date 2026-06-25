import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotesPageClient } from '@/components/notes/notes-page-client'

export default async function NotesPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })

  return <NotesPageClient projectId={projectId} initialNotes={(notes ?? []) as never} />
}
