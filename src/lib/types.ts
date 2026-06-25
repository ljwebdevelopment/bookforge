export type ProjectTemplate =
  | 'memoir' | 'book' | 'nonfiction' | 'novel' | 'article'
  | 'research-paper' | 'speech' | 'song' | 'blank'

export type ProjectStatus = 'draft' | 'in_progress' | 'complete' | 'published'

export interface ProjectWithStats {
  id: string
  title: string
  subtitle: string | null
  genre: string | null
  status: ProjectStatus
  cover_image: string | null
  target_word_count: number | null
  word_count: number
  is_favorite: boolean
  is_archived: boolean
  template: string
  last_edited_at: string
  created_at: string
}

export interface ChapterData {
  id: string
  project_id: string
  title: string
  order: number
  content: unknown
  word_count: number
  created_at: string
  updated_at: string
}

export interface OutlineNode {
  id: string
  project_id: string
  title: string
  level: number
  order: number
  parent_id: string | null
  completion_status: 'not_started' | 'in_progress' | 'complete'
  notes: string | null
  linked_chapter_id: string | null
  children?: OutlineNode[]
}

export interface NoteData {
  id: string
  project_id: string
  title: string | null
  content: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ResearchItem {
  id: string
  project_id: string
  type: 'pdf' | 'image' | 'screenshot' | 'link' | 'quote' | 'note'
  title: string | null
  content: string | null
  url: string | null
  file_url: string | null
  created_at: string
}

export interface AiSuggestion {
  id: string
  problem: string
  explanation: string | null
  suggestion: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'ignored'
  original?: string
  startOffset?: number
  endOffset?: number
}

export interface HumanPassSuggestion {
  id: string
  problem: string
  explanation: string
  original: string
  suggestion: string
  type: 'generic' | 'robotic' | 'passive' | 'weak' | 'repetitive' | 'unclear' | 'other'
}

export interface VersionEntry {
  id: string
  project_id: string
  chapter_id: string | null
  content: unknown
  word_count: number
  label: string | null
  created_at: string
}

export interface KnowledgeBaseEntry {
  id: string
  project_id: string
  type: 'person' | 'place' | 'event' | 'organization' | 'argument' | 'quote' | 'theme' | 'other'
  name: string
  description: string | null
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  id: string
  project_id: string
  date: string | null
  title: string
  description: string | null
  order: number
  created_at: string
}

export interface AiMemoryEntry {
  id: string
  project_id: string
  memory_type: string
  content: string
  updated_at: string
}

export interface ProjectContext {
  project: ProjectWithStats
  guidelines: string
  memory: AiMemoryEntry[]
  manuscriptExcerpt: string
  aiModel: string
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

export interface WritingStats {
  totalWords: number
  totalPages: number
  avgWordsPerDay: number
  writingStreak: number
  chapterCompletion: number
  outlineCompletion: number
  estimatedCompletionDate: string | null
}
