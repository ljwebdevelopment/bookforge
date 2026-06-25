import { create } from 'zustand'
import type { SaveStatus } from '@/lib/types'
import type { InsertAiSuggestionOptions } from '@/components/editor/extensions/ai-suggestion'

interface EditorState {
  currentChapterId: string | null
  currentProjectId: string | null
  saveStatus: SaveStatus
  wordCount: number
  selectedText: string | null
  selectionFrom: number | null
  selectionTo: number | null
  hasPendingSuggestions: boolean
  // Registered by TipTapEditor when mounted; null when no editor is active
  insertAiSuggestion: ((options: InsertAiSuggestionOptions) => void) | null
  acceptAiSuggestion: ((id: string) => void) | null
  rejectAiSuggestion: ((id: string) => void) | null
  acceptAllAiSuggestions: (() => void) | null
  rejectAllAiSuggestions: (() => void) | null
  setCurrentChapter: (id: string | null) => void
  setCurrentProject: (id: string | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setWordCount: (count: number) => void
  setSelectedText: (text: string | null) => void
  setSelection: (from: number | null, to: number | null) => void
  setHasPendingSuggestions: (v: boolean) => void
  registerEditorCommands: (cmds: {
    insertAiSuggestion: (options: InsertAiSuggestionOptions) => void
    acceptAiSuggestion: (id: string) => void
    rejectAiSuggestion: (id: string) => void
    acceptAllAiSuggestions: () => void
    rejectAllAiSuggestions: () => void
  } | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  currentChapterId: null,
  currentProjectId: null,
  saveStatus: 'saved',
  wordCount: 0,
  selectedText: null,
  selectionFrom: null,
  selectionTo: null,
  hasPendingSuggestions: false,
  insertAiSuggestion: null,
  acceptAiSuggestion: null,
  rejectAiSuggestion: null,
  acceptAllAiSuggestions: null,
  rejectAllAiSuggestions: null,
  setCurrentChapter: (id) => set({ currentChapterId: id }),
  setCurrentProject: (id) => set({ currentProjectId: id }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setWordCount: (count) => set({ wordCount: count }),
  setSelectedText: (text) => set({ selectedText: text }),
  setSelection: (from, to) => set({ selectionFrom: from, selectionTo: to }),
  setHasPendingSuggestions: (v) => set({ hasPendingSuggestions: v }),
  registerEditorCommands: (cmds) =>
    set(
      cmds
        ? {
            insertAiSuggestion: cmds.insertAiSuggestion,
            acceptAiSuggestion: cmds.acceptAiSuggestion,
            rejectAiSuggestion: cmds.rejectAiSuggestion,
            acceptAllAiSuggestions: cmds.acceptAllAiSuggestions,
            rejectAllAiSuggestions: cmds.rejectAllAiSuggestions,
          }
        : {
            insertAiSuggestion: null,
            acceptAiSuggestion: null,
            rejectAiSuggestion: null,
            acceptAllAiSuggestions: null,
            rejectAllAiSuggestions: null,
          }
    ),
}))
