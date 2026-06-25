import { google } from '@ai-sdk/google'

export function getAIProvider(modelId?: string) {
  const model = modelId ?? process.env.DEFAULT_AI_MODEL ?? 'gemini-2.5-flash'
  return google(model)
}

export const DEFAULT_MODEL = 'gemini-2.5-flash'
export const FAST_MODEL = 'gemini-2.0-flash'
