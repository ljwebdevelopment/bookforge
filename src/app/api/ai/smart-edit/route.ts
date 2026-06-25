import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { getAIProvider } from '@/lib/ai/provider'
import { buildProjectContext } from '@/lib/ai/context-builder'
import { buildSmartEditSystemPrompt } from '@/lib/ai/system-prompts'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { selectedText, action, projectId, chapterId } = await req.json()
  if (!selectedText || !action) return new Response('Missing required fields', { status: 400 })

  const ctx = await buildProjectContext(supabase, projectId, chapterId ?? null)

  const { text } = await generateText({
    model: getAIProvider(ctx.aiModel),
    system: buildSmartEditSystemPrompt(action, ctx),
    prompt: selectedText,
    maxOutputTokens: 1500,
  })

  return Response.json({ result: text })
}
