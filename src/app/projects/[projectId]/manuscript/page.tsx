import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChapterListNav } from '@/components/editor/chapter-list-nav'
import { TipTapEditor } from '@/components/editor/tiptap-editor-client'

export default async function ManuscriptPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ chapter?: string }>
}) {
  const { projectId } = await params
  const { chapter: chapterParam } = await searchParams

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) redirect('/login')

  let { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  // If no chapters exist yet (e.g. race condition on creation), create one
  if (!chapters || chapters.length === 0) {
    const { data: newChapter } = await supabase
      .from('chapters')
      .insert({ project_id: projectId, title: 'Chapter 1', order: 0 })
      .select('*')
      .single()
    chapters = newChapter ? [newChapter] : []
  }

  if (!chapters || chapters.length === 0) redirect('/')

  const activeChapter = chapterParam
    ? chapters.find((c) => c.id === chapterParam) ?? chapters[0]
    : chapters[0]

  return (
    <div className="flex h-full">
      <div className="w-[220px] shrink-0 border-r h-full">
        <ChapterListNav
          projectId={projectId}
          chapters={chapters}
          currentChapterId={activeChapter.id}
        />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TipTapEditor
          key={activeChapter.id}
          projectId={projectId}
          chapterId={activeChapter.id}
          initialContent={activeChapter.content as object | null}
        />
      </div>
    </div>
  )
}
