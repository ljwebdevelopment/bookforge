'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OutlineNodeItem } from './outline-node'
import type { OutlineNode } from '@/lib/types'
import { createOutlineNode, reorderOutlineNodes } from '@/actions/outline-actions'
import { useTransition } from 'react'

interface OutlineTreeProps {
  projectId: string
  nodes: OutlineNode[]
  onRefresh: () => void
}

function flattenTree(nodes: OutlineNode[]): string[] {
  const ids: string[] = []
  const traverse = (items: OutlineNode[]) => {
    items.forEach((item) => {
      ids.push(item.id)
      if (item.children) traverse(item.children)
    })
  }
  traverse(nodes)
  return ids
}

function flattenNodes(nodes: OutlineNode[]): OutlineNode[] {
  const flat: OutlineNode[] = []
  const traverse = (items: OutlineNode[]) => {
    items.forEach((item) => {
      flat.push(item)
      if (item.children) traverse(item.children)
    })
  }
  traverse(nodes)
  return flat
}

export function OutlineTree({ projectId, nodes, onRefresh }: OutlineTreeProps) {
  const [items, setItems] = useState(nodes)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const flatIds = flattenTree(items)
  const flatAll = flattenNodes(items)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = flatAll.findIndex((n) => n.id === active.id)
    const newIndex = flatAll.findIndex((n) => n.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(flatAll, oldIndex, newIndex)
    const updates = reordered.map((node, i) => ({
      id: node.id,
      order: i,
      parent_id: node.parent_id,
    }))

    startTransition(async () => {
      await reorderOutlineNodes(updates)
      onRefresh()
    })
  }

  const handleAddRoot = () => {
    startTransition(async () => {
      await createOutlineNode(projectId, 'New section', null, 0, items.length)
      onRefresh()
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-medium text-sm">Outline</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddRoot}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
            {items.map((node) => (
              <OutlineNodeItem
                key={node.id}
                node={node}
                projectId={projectId}
                depth={0}
                onRefresh={onRefresh}
              />
            ))}
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No outline yet.</p>
            <Button variant="link" className="text-sm mt-1" onClick={handleAddRoot}>
              Add your first section
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
