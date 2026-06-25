'use client'

import { ProjectCard } from './project-card'
import { Tables } from '@/lib/supabase/types'
import { BookOpen } from 'lucide-react'

type Project = Tables<'projects'>

export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20 text-center">
        <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="mb-1 font-semibold text-lg">No projects yet</h3>
        <p className="text-muted-foreground text-sm">Create your first project to get started.</p>
      </div>
    )
  }

  const favorites = projects.filter((p) => p.is_favorite)
  const recent = projects.filter((p) => !p.is_favorite).slice(0, 8)

  return (
    <div className="space-y-8">
      {favorites.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Favorites</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {favorites.length > 0 ? 'Recently Edited' : 'All Projects'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recent.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
