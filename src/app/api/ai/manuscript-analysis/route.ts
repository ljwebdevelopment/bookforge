import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { getAIProvider } from '@/lib/ai/provider'
import { buildProjectContext } from '@/lib/ai/context-builder'
import { buildManuscriptAnalysisSystemPrompt } from '@/lib/ai/system-prompts'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { projectId, text } = await req.json()
  if (!text) return new Response('Missing text', { status: 400 })

  const ctx = await buildProjectContext(supabase, projectId)

  const { text: analysis } = await generateText({
    model: getAIProvider(ctx.aiModel),
    system: buildManuscriptAnalysisSystemPrompt(ctx),
    prompt: text.slice(0, 8000),
    maxOutputTokens: 2000,
  })

  return Response.json({ analysis })
}
