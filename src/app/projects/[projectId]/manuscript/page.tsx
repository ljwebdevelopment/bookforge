import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (!chapters || chapters.length === 0) notFound()

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
          projectId={projectId}
          chapterId={activeChapter.id}
          initialContent={activeChapter.content as object | null}
        />
      </div>
    </div>
  )
}
