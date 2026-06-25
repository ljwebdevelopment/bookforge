import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { extractPlainText, estimateTokenCount, truncateText } from '@/lib/utils'
import {
  GUIDELINES_TOKEN_BUDGET,
  MEMORY_TOKEN_BUDGET,
  MANUSCRIPT_TOKEN_BUDGET,
} from '@/lib/constants'

export interface ProjectContext {
  projectTitle: string
  genre: string | null
  template: string
  guidelines: string
  memory: string
  manuscriptExcerpt: string
  aiModel: string
}

export async function buildProjectContext(
  supabase: SupabaseClient<Database>,
  projectId: string,
  chapterId?: string | null
): Promise<ProjectContext> {
  // Fetch in parallel
  const [projectRes, guidelinesRes, memoryRes, chapterRes] = await Promise.all([
    supabase
      .from('projects')
      .select('title, genre, template, project_settings(ai_model)')
      .eq('id', projectId)
      .single(),
    supabase
      .from('writing_guidelines')
      .select('guidelines')
      .eq('project_id', projectId)
      .single(),
    supabase
      .from('ai_memory')
      .select('memory_type, content')
      .eq('project_id', projectId)
      .order('memory_type'),
    chapterId
      ? supabase
          .from('chapters')
          .select('content')
          .eq('id', chapterId)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const project = projectRes.data
  const guidelinesRaw = guidelinesRes.data?.guidelines ?? ''
  const memoryEntries = memoryRes.data ?? []

  // Build guidelines string (truncate if needed)
  const guidelines = truncateToTokenBudget(guidelinesRaw, GUIDELINES_TOKEN_BUDGET)

  // Build memory string
  const memoryParts = memoryEntries.map(
    (e) => `[${e.memory_type.toUpperCase()}]\n${e.content}`
  )
  const memoryFull = memoryParts.join('\n\n')
  const memory = truncateToTokenBudget(memoryFull, MEMORY_TOKEN_BUDGET)

  // Build manuscript excerpt from current chapter
  let manuscriptExcerpt = ''
  if (chapterRes.data?.content) {
    const plainText = extractPlainText(chapterRes.data.content)
    manuscriptExcerpt = truncateToTokenBudget(plainText, MANUSCRIPT_TOKEN_BUDGET)
  }

  // Get AI model from project settings
  const rawSettings = (project as unknown as { project_settings?: { ai_model?: string } | { ai_model?: string }[] | null })?.project_settings
  const settings = Array.isArray(rawSettings) ? rawSettings[0] : rawSettings
  const aiModel = settings?.ai_model ?? 'claude-sonnet-4-6'

  return {
    projectTitle: project?.title ?? 'Untitled Project',
    genre: project?.genre ?? null,
    template: project?.template ?? 'blank',
    guidelines,
    memory,
    manuscriptExcerpt,
    aiModel,
  }
}

function truncateToTokenBudget(text: string, budgetTokens: number): string {
  const maxChars = budgetTokens * 4
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).trim() + '\n[...truncated for context window]'
}

export function getManuscriptExcerpt(content: unknown, maxTokens = MANUSCRIPT_TOKEN_BUDGET): string {
  const plainText = extractPlainText(content)
  const maxChars = maxTokens * 4
  if (plainText.length <= maxChars) return plainText
  // Take the last portion for best context
  return '...' + plainText.slice(-maxChars).trim()
}
