import { anthropic } from '@ai-sdk/anthropic'

export function getAIProvider(modelId?: string) {
  const model = modelId ?? process.env.DEFAULT_AI_MODEL ?? 'claude-sonnet-4-6'
  return anthropic(model)
}

export const DEFAULT_MODEL = 'claude-sonnet-4-6'
export const FAST_MODEL = 'claude-haiku-4-5-20251001'
