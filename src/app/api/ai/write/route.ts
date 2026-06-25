import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { getAIProvider } from '@/lib/ai/provider'
import { buildProjectContext } from '@/lib/ai/context-builder'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { projectId, chapterId, prompt, selectedText } = await req.json()

  const ctx = await buildProjectContext(supabase, projectId, chapterId ?? null)

  const systemPrompt = `You are a ghost-writer for "${ctx.projectTitle}". Your output is inserted DIRECTLY into the manuscript — never add meta-commentary, headings, or explanations. Write ONLY the requested content.

VOICE: Match the established manuscript voice exactly. No generic AI phrasing.
${ctx.guidelines ? `GUIDELINES: ${ctx.guidelines}` : ''}
${ctx.memory ? `PROJECT MEMORY: ${ctx.memory}` : ''}
${ctx.outlineContext ? `OUTLINE (use to know what comes next): ${ctx.outlineContext}` : ''}
${ctx.manuscriptExcerpt ? `CURRENT CHAPTER (continue naturally from here): ${ctx.manuscriptExcerpt}` : ''}`

  const userPrompt = selectedText
    ? `${prompt}\n\nSelected text to work with:\n"${selectedText}"`
    : prompt

  const { text } = await generateText({
    model: getAIProvider(ctx.aiModel),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 2000,
  })

  return Response.json({ text: text.trim() })
}
