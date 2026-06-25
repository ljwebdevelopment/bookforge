'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { WORKSPACE_NAV_ITEMS } from '@/lib/constants'
import { useUIStore } from '@/stores/ui-store'
import {
  ChevronLeft, ChevronRight, Home, FileText, List, StickyNote,
  Search, Clock, BookOpen, ScrollText, Sparkles, UserCheck, History, Settings,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const NAV_ICONS: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-4 w-4" />,
  List: <List className="h-4 w-4" />,
  StickyNote: <StickyNote className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  ScrollText: <ScrollText className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  UserCheck: <UserCheck className="h-4 w-4" />,
  History: <History className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
}

interface LeftSidebarProps {
  projectId: string
  projectTitle: string
}

export function LeftSidebar({ projectId, projectTitle }: LeftSidebarProps) {
  const pathname = usePathname()
  const { leftSidebarOpen, toggleLeftSidebar } = useUIStore()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex h-full flex-col border-r bg-background transition-all duration-300',
          leftSidebarOpen ? 'w-[240px]' : 'w-[52px]'
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-3 gap-2 shrink-0">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          {leftSidebarOpen && (
            <span className="truncate text-sm font-medium flex-1 min-w-0">{projectTitle}</span>
          )}
          <button
            onClick={toggleLeftSidebar}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {WORKSPACE_NAV_ITEMS.map((item) => {
            const href = `/projects/${projectId}/${item.href}`
            const isActive = pathname === href || pathname.startsWith(href + '/')

            if (!leftSidebarOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        'flex h-9 items-center justify-center mx-1.5 my-0.5 rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {NAV_ICONS[item.icon] ?? <FileText className="h-4 w-4" />}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex h-9 items-center gap-3 rounded-md mx-2 my-0.5 px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {NAV_ICONS[item.icon] ?? <FileText className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
