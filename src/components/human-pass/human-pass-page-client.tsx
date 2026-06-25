'use client'

import { HumanPassPanel } from './human-pass-panel'

interface Chapter {
  id: string
  title: string
  order: number
}

interface HumanPassPageClientProps {
  projectId: string
  chapters: Chapter[]
}

export function HumanPassPageClient({ projectId, chapters }: HumanPassPageClientProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Human Pass</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detect and fix generic, robotic, or AI-sounding writing. Select a chapter below to analyze.
        </p>
      </div>
      <div className="flex-1 overflow-hidden max-w-2xl mx-auto w-full py-6 px-4">
        <HumanPassPanel projectId={projectId} chapters={chapters} />
      </div>
    </div>
  )
}
