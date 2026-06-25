import { countWords, extractPlainText } from '@/lib/utils'
import { AUTOSAVE_DELAY_MS, VERSION_SNAPSHOT_INTERVAL_MS, VERSION_SNAPSHOT_WORD_THRESHOLD } from '@/lib/constants'

interface AutosaveState {
  lastSaveTime: number
  lastSaveWordCount: number
  debounceTimer: ReturnType<typeof setTimeout> | null
  lastSnapshotTime: number
}

export const autosaveState: AutosaveState = {
  lastSaveTime: 0,
  lastSaveWordCount: 0,
  debounceTimer: null,
  lastSnapshotTime: Date.now(),
}

export function shouldCreateSnapshot(currentWordCount: number): boolean {
  const now = Date.now()
  const timeSinceSnapshot = now - autosaveState.lastSnapshotTime
  const wordDelta = Math.abs(currentWordCount - autosaveState.lastSaveWordCount)

  return (
    timeSinceSnapshot >= VERSION_SNAPSHOT_INTERVAL_MS ||
    wordDelta >= VERSION_SNAPSHOT_WORD_THRESHOLD
  )
}

export function markSnapshotCreated(wordCount: number) {
  autosaveState.lastSnapshotTime = Date.now()
  autosaveState.lastSaveWordCount = wordCount
}

export function createDebouncedSave(
  saveFn: (content: unknown, wordCount: number) => Promise<void>,
  delay = AUTOSAVE_DELAY_MS
) {
  return (content: unknown) => {
    if (autosaveState.debounceTimer) {
      clearTimeout(autosaveState.debounceTimer)
    }
    const wordCount = countWords(extractPlainText(content))
    autosaveState.debounceTimer = setTimeout(() => {
      saveFn(content, wordCount)
    }, delay)
  }
}
