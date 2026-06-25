'use server'

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'
import { upsertMemory, appendToMemory } from '@/lib/ai/memory'
import { generateText } from 'ai'
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

export async function extractKnowledgeBaseEntities(projectId: string, chapterId: string) {
  const supabase = await createClient()

  const { data: rawChapter } = await supabase
    .from('chapters')
    .select('content')
    .eq('id', chapterId)
    .single()

  const chapter = rawChapter as { content: unknown } | null
  if (!chapter?.content) return

  const { extractPlainText } = await import('@/lib/utils')
  const text = extractPlainText(chapter.content).slice(0, 4000)

  const { text: result } = await generateText({
    model: getAIProvider(),
    system: buildKnowledgeBaseExtractionPrompt(),
    prompt: text,
    maxOutputTokens: 1000,
  })

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return

    type KBType = 'person' | 'place' | 'event' | 'organization' | 'argument' | 'quote' | 'theme' | 'other'
    const entities = JSON.parse(jsonMatch[0]) as Array<{ type: KBType; name: string; description: string; data: unknown }>
    await Promise.all(
      entities.map((entity) =>
        supabase.from('knowledge_base').upsert(
          {
            project_id: projectId,
            type: entity.type,
            name: entity.name,
            description: entity.description,
            data: (entity.data ?? {}) as Json,
          },
          { onConflict: 'project_id,name,type' }
        )
      )
    )
  } catch {
    // JSON parse failed — skip silently
  }
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
