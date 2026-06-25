import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { getAIProvider } from '@/lib/ai/provider'
import { buildProjectContext } from '@/lib/ai/context-builder'
import { buildHumanPassSystemPrompt } from '@/lib/ai/system-prompts'
import { z } from 'zod'

const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z.string(),
      problem: z.string(),
      explanation: z.string(),
      original: z.string(),
      suggestion: z.string(),
      type: z.enum(['generic', 'robotic', 'passive', 'weak', 'repetitive', 'unclear', 'other']),
    })
  ),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { projectId, chapterId, text } = await req.json()
  if (!text) return new Response('Missing text', { status: 400 })

  const ctx = await buildProjectContext(supabase, projectId)

  const { object } = await generateObject({
    model: getAIProvider(ctx.aiModel),
    system: buildHumanPassSystemPrompt(ctx),
    prompt: text.slice(0, 6000),
    schema: suggestionSchema,
  })

  // Store suggestions in DB
  if (object.suggestions.length > 0 && chapterId) {
    await Promise.all(
      object.suggestions.map((s) =>
        supabase.from('ai_suggestions').insert({
          project_id: projectId,
          chapter_id: chapterId,
          problem: s.problem,
          explanation: s.explanation,
          suggestion: s.suggestion,
          status: 'pending',
        })
      )
    )
  }

  return Response.json(object)
}
