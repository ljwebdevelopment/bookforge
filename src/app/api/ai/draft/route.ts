import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
import { getAIProvider } from '@/lib/ai/provider'
import { buildProjectContext } from '@/lib/ai/context-builder'
import { buildDraftSystemPrompt } from '@/lib/ai/system-prompts'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { projectId, outlineNode, instructions } = await req.json()

  const ctx = await buildProjectContext(supabase, projectId)

  const result = streamText({
    model: getAIProvider(ctx.aiModel),
    system: buildDraftSystemPrompt({ ...ctx, outlineContext: outlineNode ?? '' }),
    prompt: `Write a complete draft for this section.${instructions ? `\n\nAdditional instructions: ${instructions}` : ''}`,
    maxOutputTokens: 3000,
  })

  return result.toTextStreamResponse()
}
