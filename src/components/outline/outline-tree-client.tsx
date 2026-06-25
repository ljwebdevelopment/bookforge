'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { OutlineTree } from './outline-tree'
import { buildTree } from '@/lib/outline-utils'
import type { OutlineNode } from '@/lib/types'

interface OutlineTreeClientProps {
  projectId: string
  flatNodes: OutlineNode[]
}

export function OutlineTreeClient({ projectId, flatNodes }: OutlineTreeClientProps) {
  const router = useRouter()
  const tree = buildTree(flatNodes)

  const handleRefresh = () => router.refresh()

  return <OutlineTree projectId={projectId} nodes={tree} onRefresh={handleRefresh} />
}
