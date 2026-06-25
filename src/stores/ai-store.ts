import { create } from 'zustand'
import type { HumanPassSuggestion } from '@/lib/types'

type AiPanelMode = 'chat' | 'suggestion' | 'draft' | 'human-pass' | 'analysis'

interface AiState {
  panelMode: AiPanelMode
  pendingSuggestion: { original: string; suggestion: string; action: string } | null
  humanPassSuggestions: HumanPassSuggestion[]
  humanPassLoading: boolean
  setPanelMode: (mode: AiPanelMode) => void
  setPendingSuggestion: (s: AiState['pendingSuggestion']) => void
  setHumanPassSuggestions: (suggestions: HumanPassSuggestion[]) => void
  setHumanPassLoading: (loading: boolean) => void
  clearPendingSuggestion: () => void
}

export const useAIStore = create<AiState>((set) => ({
  panelMode: 'chat',
  pendingSuggestion: null,
  humanPassSuggestions: [],
  humanPassLoading: false,
  setPanelMode: (mode) => set({ panelMode: mode }),
  setPendingSuggestion: (s) => set({ pendingSuggestion: s, panelMode: 'suggestion' }),
  setHumanPassSuggestions: (suggestions) => set({ humanPassSuggestions: suggestions }),
  setHumanPassLoading: (loading) => set({ humanPassLoading: loading }),
  clearPendingSuggestion: () => set({ pendingSuggestion: null, panelMode: 'chat' }),
}))
