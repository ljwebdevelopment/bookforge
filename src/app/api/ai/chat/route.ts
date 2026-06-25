import { createClient } from '@/lib/supabase/server'
import { streamText, tool } from 'ai'
import { z } from 'zod'
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
    maxOutputTokens: 3000,
    tools: {
      saveNote: tool({
        description: 'Save an important note about the project — character details, plot decisions, research findings, writing ideas, or anything worth tracking across the manuscript.',
        inputSchema: z.object({
          title: z.string().describe('Short, descriptive note title'),
          content: z.string().describe('Full note content'),
          tags: z.array(z.string()).optional().describe('Relevant tags, e.g. character names, themes, chapter numbers'),
        }),
        execute: async (args) => {
          await supabase.from('notes').insert({
            project_id: projectId,
            title: args.title,
            content: args.content,
            tags: args.tags ?? [],
          })
          return { saved: true, title: args.title }
        },
      }),
      saveTimelineEntry: tool({
        description: 'Add a chronological event to the project timeline — story events, character milestones, historical dates, or any point in time mentioned in or relevant to the manuscript.',
        inputSchema: z.object({
          date: z.string().describe('Date or time label (e.g. "Chapter 3", "Summer 1985", "Day 7", "Age 12")'),
          title: z.string().describe('Short event title'),
          description: z.string().optional().describe('Brief description of what happened'),
        }),
        execute: async (args) => {
          const { data: existing } = await supabase
            .from('timeline')
            .select('order')
            .eq('project_id', projectId)
            .order('order', { ascending: false })
            .limit(1)
          const nextOrder = (existing?.[0]?.order ?? -1) + 1
          await supabase.from('timeline').insert({
            project_id: projectId,
            date: args.date,
            title: args.title,
            description: args.description ?? null,
            order: nextOrder,
          })
          return { saved: true, title: args.title }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
