'use server'

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'
import { upsertMemory } from '@/lib/ai/memory'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'
import { getAIProvider } from '@/lib/ai/provider'
import { buildProjectContext } from '@/lib/ai/context-builder'
import { buildKnowledgeBaseExtractionPrompt } from '@/lib/ai/system-prompts'

export async function updateAiMemoryFromEdits(projectId: string) {
  const supabase = await createClient()

  // Fetch recent accepted edits
  const { data: rawLogs } = await supabase
    .from('activity_log')
    .select('metadata')
    .eq('project_id', projectId)
    .eq('action', 'accepted_edit')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!rawLogs || rawLogs.length === 0) return

  const logs = rawLogs as Array<{ metadata: Record<string, string> }>
  const ctx = await buildProjectContext(supabase, projectId)

  const editExamples = logs
    .map((l) => `Original: ${l.metadata?.original ?? ''}\nRevised: ${l.metadata?.revised ?? ''}`)
    .join('\n\n')

  const { text } = await generateText({
    model: getAIProvider(ctx.aiModel),
    system: `Analyze these accepted edits from a writing project to understand the author's voice preferences and style. Summarize patterns you observe about what the author prefers in terms of word choice, sentence structure, tone, and style. Be specific and concise.`,
    prompt: editExamples,
    maxOutputTokens: 500,
  })

  await upsertMemory(supabase, projectId, 'voice', text)
}

const KB_ENTITY_SCHEMA = z.object({
  entities: z.array(
    z.object({
      type: z.enum(['person', 'place', 'event', 'organization', 'argument', 'quote', 'theme', 'other']),
      name: z.string().min(1),
      description: z.string(),
    })
  ),
})

export async function extractKnowledgeBaseEntities(projectId: string, chapterId: string) {
  const supabase = await createClient()

  const { data: rawChapter } = await supabase
    .from('chapters')
    .select('content')
    .eq('id', chapterId)
    .single()

  const chapter = rawChapter as { content: unknown } | null
  if (!chapter?.content) throw new Error('Chapter has no content')

  const { extractPlainText } = await import('@/lib/utils')
  const text = extractPlainText(chapter.content).trim().slice(0, 4000)
  if (!text) throw new Error('Chapter has no text to analyze')

  // Get project's AI model
  const ctx = await buildProjectContext(supabase, projectId)

  const { object } = await generateObject({
    model: getAIProvider(ctx.aiModel),
    system: buildKnowledgeBaseExtractionPrompt(),
    prompt: text,
    schema: KB_ENTITY_SCHEMA,
    maxOutputTokens: 1000,
  })

  if (!object.entities.length) return 0

  // Fetch existing entries to skip duplicates without relying on a DB constraint
  const { data: existing } = await supabase
    .from('knowledge_base')
    .select('name, type')
    .eq('project_id', projectId)

  const existingSet = new Set(
    (existing ?? []).map((e) => `${e.type}:${e.name.toLowerCase()}`)
  )

  const newEntities = object.entities.filter(
    (e) => !existingSet.has(`${e.type}:${e.name.toLowerCase()}`)
  )

  if (!newEntities.length) return 0

  const { error } = await supabase.from('knowledge_base').insert(
    newEntities.map((entity) => ({
      project_id: projectId,
      type: entity.type,
      name: entity.name,
      description: entity.description,
      data: {} as Json,
    }))
  )

  if (error) throw new Error(`Failed to save entities: ${error.message}`)

  return newEntities.length
}

export async function updateWritingGuidelines(projectId: string, guidelines: string) {
  const supabase = await createClient()
  await supabase
    .from('writing_guidelines')
    .upsert({ project_id: projectId, guidelines, updated_at: new Date().toISOString() }, { onConflict: 'project_id' })
}

export async function updateAiSuggestionStatus(
  suggestionId: string,
  status: 'accepted' | 'rejected' | 'ignored'
) {
  const supabase = await createClient()
  await supabase.from('ai_suggestions').update({ status }).eq('id', suggestionId)
}
