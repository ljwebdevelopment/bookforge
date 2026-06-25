import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
import { getAIProvider } from '@/lib/ai/provider'
import { buildProjectContext } from '@/lib/ai/context-builder'
import { buildChatSystemPrompt } from '@/lib/ai/system-prompts'
import { convertToModelMessages } from 'ai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { messages, projectId, chapterId } = body

  const ctx = await buildProjectContext(supabase, projectId, chapterId ?? null)

  const result = streamText({
    model: getAIProvider(ctx.aiModel),
    system: buildChatSystemPrompt(ctx),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2000,
  })

  return result.toUIMessageStreamResponse()
}
