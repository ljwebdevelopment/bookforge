'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Tables } from '@/lib/supabase/types'
import { VersionList } from './version-list'
import { VersionDiff } from './version-diff'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { restoreVersion } from '@/actions/version-actions'
import { extractPlainText } from '@/lib/utils'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'

type Version = Tables<'versions'>
type Chapter = { id: string; title: string }

interface VersionsClientProps {
  projectId: string
  chapters: Chapter[]
  versions: Version[]
}

export function VersionsClient({ projectId, chapters, versions }: VersionsClientProps) {
  const router = useRouter()
  const [chapterId, setChapterId] = useState(chapters[0]?.id ?? '')
  const [selected, setSelected] = useState<Version | null>(null)
  const [isPending, startTransition] = useTransition()

  const chapterVersions = versions.filter((v) => v.chapter_id === chapterId)
  const currentVersion = chapterVersions[0]
  const selectedText = selected ? extractPlainText(selected.content) : ''
  const currentText = currentVersion ? extractPlainText(currentVersion.content) : ''

  const handleRestore = () => {
    if (!selected || !chapterId) return
    startTransition(async () => {
      await restoreVersion(selected.id, chapterId, projectId)
      router.refresh()
      toast.success('Version restored')
    })
  }

  return (
    <div className="flex h-full">
      <div className="w-[240px] shrink-0 border-r">
        {chapters.length > 1 && (
          <div className="p-3 border-b">
            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger>
                <SelectValue placeholder="Select chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <VersionList
          versions={chapterVersions}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
              <div>
                <span className="text-sm font-medium">Diff view</span>
                <span className="ml-2 text-xs text-muted-foreground">selected vs. next version</span>
              </div>
              <Button
                size="sm"
                onClick={handleRestore}
                disabled={isPending}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore this version
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <VersionDiff
                previous={selectedText}
                current={currentText}
              />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">Select a version to compare</p>
          </div>
        )}
      </div>
    </div>
  )
}
