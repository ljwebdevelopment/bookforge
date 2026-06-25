'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const TipTapEditor = dynamic(
  () => import('@/components/editor/tiptap-editor').then((m) => m.TipTapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    ),
  }
)

export { TipTapEditor }
