'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronRight, ChevronDown, Plus, Trash2, Circle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { OutlineNode as OutlineNodeType } from '@/lib/types'
import { updateOutlineNode, deleteOutlineNode, createOutlineNode } from '@/actions/outline-actions'
import { useTransition } from 'react'
import { toast } from 'sonner'

const STATUS_ICONS = {
  not_started: <Circle className="h-3 w-3 text-muted-foreground" />,
  in_progress: <Clock className="h-3 w-3 text-blue-500" />,
  complete: <CheckCircle2 className="h-3 w-3 text-green-500" />,
}

interface OutlineNodeProps {
  node: OutlineNodeType
  projectId: string
  depth: number
  onRefresh: () => void
}

export function OutlineNodeItem({ node, projectId, depth, onRefresh }: OutlineNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(node.title)
  const [isPending, startTransition] = useTransition()

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleRename = () => {
    if (!title.trim() || title === node.title) { setEditing(false); return }
    startTransition(async () => {
      await updateOutlineNode(node.id, projectId, { title: title.trim() })
      onRefresh()
      setEditing(false)
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${node.title}"?`)) return
    startTransition(async () => {
      await deleteOutlineNode(node.id, projectId)
      onRefresh()
    })
  }

  const handleAddChild = () => {
    startTransition(async () => {
      await createOutlineNode(projectId, 'New item', node.id, depth + 1, (node.children?.length ?? 0))
      onRefresh()
    })
  }

  const cycleStatus = () => {
    const statuses = ['not_started', 'in_progress', 'complete'] as const
    const current = statuses.indexOf(node.completion_status)
    const next = statuses[(current + 1) % 3]
    startTransition(async () => {
      await updateOutlineNode(node.id, projectId, { completion_status: next })
      onRefresh()
    })
  }

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1.5 rounded-md py-1 pr-1 text-sm transition-colors hover:bg-accent',
          isDragging && 'bg-accent'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground shrink-0"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground/60 shrink-0"
        >
          {node.children && node.children.length > 0 ? (
            expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <span className="w-3.5 h-3.5 block" />
          )}
        </button>

        <button onClick={cycleStatus} className="shrink-0" title="Toggle status">
          {STATUS_ICONS[node.completion_status]}
        </button>

        {editing ? (
          <input
            className="flex-1 bg-transparent outline-none border-b border-primary text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setTitle(node.title); setEditing(false) }
            }}
            autoFocus
          />
        ) : (
          <span
            className="flex-1 truncate cursor-default"
            onDoubleClick={() => setEditing(true)}
          >
            {node.title}
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleAddChild}
            title="Add child"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <OutlineNodeItem
              key={child.id}
              node={child}
              projectId={projectId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}
