'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useEditorStore } from '@/stores/editor-store'
import { LeftSidebar } from './left-sidebar'
import { RightSidebar } from './right-sidebar'
import { GlobalSearch } from '@/components/search/global-search'

interface WorkspaceLayoutProps {
  projectId: string
  projectTitle: string
  children: React.ReactNode
}

export function WorkspaceLayout({ projectId, projectTitle, children }: WorkspaceLayoutProps) {
  const { focusMode, leftSidebarOpen, rightSidebarOpen, setCommandPaletteOpen, toggleFocusMode } = useUIStore()
  const { setCurrentProject } = useEditorStore()

  useEffect(() => {
    setCurrentProject(projectId)
  }, [projectId, setCurrentProject])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen, toggleFocusMode])

  if (focusMode) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">{children}</div>
        <GlobalSearch hideButton />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftSidebar projectId={projectId} projectTitle={projectTitle} />
      <main className="flex-1 overflow-auto">{children}</main>
      <RightSidebar projectId={projectId} />
      <GlobalSearch hideButton />
    </div>
  )
}
