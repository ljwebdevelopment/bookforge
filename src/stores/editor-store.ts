import { create } from 'zustand'
import type { SaveStatus } from '@/lib/types'

interface EditorState {
  currentChapterId: string | null
  currentProjectId: string | null
  saveStatus: SaveStatus
  wordCount: number
  selectedText: string | null
  setCurrentChapter: (id: string | null) => void
  setCurrentProject: (id: string | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setWordCount: (count: number) => void
  setSelectedText: (text: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  currentChapterId: null,
  currentProjectId: null,
  saveStatus: 'saved',
  wordCount: 0,
  selectedText: null,
  setCurrentChapter: (id) => set({ currentChapterId: id }),
  setCurrentProject: (id) => set({ currentProjectId: id }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setWordCount: (count) => set({ wordCount: count }),
  setSelectedText: (text) => set({ selectedText: text }),
}))
