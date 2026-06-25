'use client'

import { useRouter } from 'next/navigation'
import { ChapterList } from './chapter-list'
import { Tables } from '@/lib/supabase/types'

type Chapter = Tables<'chapters'>

interface ChapterListNavProps {
  projectId: string
  chapters: Chapter[]
  currentChapterId: string
}

export function ChapterListNav({ projectId, chapters, currentChapterId }: ChapterListNavProps) {
  const router = useRouter()

  return (
    <ChapterList
      projectId={projectId}
      chapters={chapters}
      currentChapterId={currentChapterId}
      onSelectChapter={(chapter) =>
        router.push(`/projects/${projectId}/manuscript?chapter=${chapter.id}`)
      }
    />
  )
}
