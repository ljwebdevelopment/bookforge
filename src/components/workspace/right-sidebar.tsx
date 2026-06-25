'use client'

import { useUIStore } from '@/stores/ui-store'
import { useAIStore } from '@/stores/ai-store'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import { AiChatPanel } from '@/components/ai/ai-chat-panel'
import { InlineSuggestion } from '@/components/ai/inline-suggestion'
import { DraftGenerator } from '@/components/ai/draft-generator'
import { HumanPassPanel } from '@/components/human-pass/human-pass-panel'

interface RightSidebarProps {
  projectId: string
}

export function RightSidebar({ projectId }: RightSidebarProps) {
  const { rightSidebarOpen, toggleRightSidebar } = useUIStore()
  const { panelMode } = useAIStore()

  if (!rightSidebarOpen) {
    return (
      <aside className="flex h-full w-[52px] flex-col items-center border-l bg-background pt-3">
        <button
          onClick={toggleRightSidebar}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Open AI panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-[340px] flex-col border-l bg-background">
      <div className="flex h-14 items-center justify-between border-b px-4 shrink-0">
        <span className="text-sm font-medium">
          {panelMode === 'chat' && 'AI Assistant'}
          {panelMode === 'suggestion' && 'Smart Edit'}
          {panelMode === 'draft' && 'Draft Generator'}
          {panelMode === 'human-pass' && 'Human Pass'}
          {panelMode === 'analysis' && 'Manuscript Analysis'}
        </span>
        <button
          onClick={toggleRightSidebar}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {panelMode === 'chat' && <AiChatPanel projectId={projectId} />}
        {panelMode === 'suggestion' && <InlineSuggestion />}
        {panelMode === 'draft' && <DraftGenerator projectId={projectId} />}
        {panelMode === 'human-pass' && <HumanPassPanel projectId={projectId} />}
      </div>
    </aside>
  )
}
