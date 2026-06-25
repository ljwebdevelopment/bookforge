'use client'

import { useCallback, useEffect, useRef } from 'react'
import { saveChapter } from '@/actions/chapter-actions'
import { useEditorStore } from '@/stores/editor-store'
import { AUTOSAVE_DELAY_MS } from '@/lib/constants'

export function useEditorAutosave(projectId: string, chapterId: string) {
  const { setSaveStatus } = useEditorStore()

  // Capture chapterId at schedule time, not at fire time
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cancel any pending save when the hook unmounts (chapter switch)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const debouncedSave = useCallback(
    (content: object, wordCount: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)

      // Capture the chapterId NOW so the timer fires against the chapter
      // that was active when the user typed — not whichever is active later
      const capturedChapterId = chapterId
      const capturedProjectId = projectId

      timerRef.current = setTimeout(async () => {
        timerRef.current = null
        try {
          await saveChapter(capturedChapterId, capturedProjectId, content, wordCount)
          setSaveStatus('saved')
        } catch {
          setSaveStatus('error')
        }
      }, AUTOSAVE_DELAY_MS)
    },
    [chapterId, projectId, setSaveStatus]
  )

  return { debouncedSave }
}
