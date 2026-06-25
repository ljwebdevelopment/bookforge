import { create } from 'zustand'

interface UIState {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  focusMode: boolean
  commandPaletteOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  setRightSidebarOpen: (open: boolean) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setFocusMode: (on: boolean) => void
  toggleFocusMode: () => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  focusMode: false,
  commandPaletteOpen: false,
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  setFocusMode: (on) => set({ focusMode: on, leftSidebarOpen: !on, rightSidebarOpen: !on }),
  toggleFocusMode: () =>
    set((s) => ({
      focusMode: !s.focusMode,
      leftSidebarOpen: s.focusMode,
      rightSidebarOpen: s.focusMode,
    })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}))
