import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiSuggestion: {
      setAiSuggestion: (id: string) => ReturnType
      unsetAiSuggestion: () => ReturnType
    }
  }
}

export const AiSuggestion = Mark.create({
  name: 'aiSuggestion',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-suggestion-id'),
        renderHTML: (attrs) => ({ 'data-suggestion-id': attrs.id }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-suggestion-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'ai-suggestion bg-yellow-200/60 dark:bg-yellow-800/40 rounded px-0.5 cursor-pointer underline decoration-yellow-500/60 decoration-dashed',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setAiSuggestion:
        (id: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { id })
        },
      unsetAiSuggestion:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})
