'use client'

import Link from 'next/link'
import { BookOpen, Heart, MoreVertical, Archive, Trash2, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toggleFavorite, archiveProject, deleteProject } from '@/actions/project-actions'
import { formatDate, getProgressColor, getStatusLabel } from '@/lib/utils'
import { Tables } from '@/lib/supabase/types'
import { useTransition } from 'react'
import { toast } from 'sonner'

type Project = Tables<'projects'>

export function ProjectCard({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition()

  const progress = project.target_word_count
    ? Math.min(100, Math.round(((project.word_count ?? 0) / project.target_word_count) * 100))
    : 0

  const handleToggleFavorite = () => {
    startTransition(async () => {
      await toggleFavorite(project.id, !project.is_favorite)
    })
  }

  const handleArchive = () => {
    startTransition(async () => {
      await archiveProject(project.id)
      toast.success('Project archived')
    })
  }

  const handleDelete = () => {
    if (!confirm('Delete this project permanently? This cannot be undone.')) return
    startTransition(async () => {
      await deleteProject(project.id)
      toast.success('Project deleted')
    })
  }

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      {project.cover_image ? (
        <div className="h-32 overflow-hidden">
          <img
            src={project.cover_image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
        </div>
      )}

      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold leading-tight">{project.title}</h3>
            {project.subtitle && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{project.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleToggleFavorite}
              disabled={isPending}
              className="rounded p-1 text-muted-foreground hover:text-yellow-500 transition-colors"
            >
              <Star className={`h-3.5 w-3.5 ${project.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleFavorite}>
                  <Star className="mr-2 h-4 w-4" />
                  {project.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {project.genre && (
            <Badge variant="secondary" className="text-xs">{project.genre}</Badge>
          )}
          <Badge variant="outline" className="text-xs">{getStatusLabel(project.status ?? 'draft')}</Badge>
        </div>

        {project.target_word_count && (
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{(project.word_count ?? 0).toLocaleString()} words</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className={`h-1.5 ${getProgressColor(progress)}`} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDate(project.last_edited_at ?? project.created_at ?? '')}
          </span>
          <Link href={`/projects/${project.id}/manuscript`}>
            <Button size="sm" variant="default" className="h-7 text-xs">
              Continue writing
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
