'use client'

import { useCallback, useRef } from 'react'
import { saveChapter } from '@/actions/chapter-actions'
import { createDebouncedSave } from '@/lib/editor/autosave'
import { useEditorStore } from '@/stores/editor-store'

export function useEditorAutosave(projectId: string, chapterId: string) {
  const { setSaveStatus } = useEditorStore()
  const chapterIdRef = useRef(chapterId)
  chapterIdRef.current = chapterId

  const savedFn = useRef<((content: unknown) => void) | null>(null)

  if (!savedFn.current) {
    savedFn.current = createDebouncedSave(async (content: unknown, wordCount: number) => {
      try {
        await saveChapter(chapterIdRef.current, projectId, content, wordCount)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    })
  }

  const debouncedSave = useCallback(
    (content: object, _wordCount: number) => {
      savedFn.current?.(content)
    },
    []
  )

  return { debouncedSave }
}
