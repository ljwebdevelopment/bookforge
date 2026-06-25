'use client'

import { PROJECT_TEMPLATES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { BookOpen, FileText, Mic, Music, BookMarked, FlaskConical, Newspaper, PenLine, LayoutTemplate } from 'lucide-react'

const ICONS: Record<string, React.ReactNode> = {
  memoir: <BookMarked className="h-6 w-6" />,
  book: <BookOpen className="h-6 w-6" />,
  nonfiction: <FlaskConical className="h-6 w-6" />,
  novel: <PenLine className="h-6 w-6" />,
  article: <Newspaper className="h-6 w-6" />,
  'research-paper': <FileText className="h-6 w-6" />,
  speech: <Mic className="h-6 w-6" />,
  song: <Music className="h-6 w-6" />,
  blank: <LayoutTemplate className="h-6 w-6" />,
}

interface TemplatePickerProps {
  selected: string
  onSelect: (id: string) => void
}

export function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PROJECT_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template.id)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors hover:bg-accent',
            selected === template.id
              ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-1'
              : 'border-border'
          )}
        >
          <div className="text-muted-foreground">{ICONS[template.id]}</div>
          <span className="text-xs font-medium leading-tight">{template.label}</span>
        </button>
      ))}
    </div>
  )
}
