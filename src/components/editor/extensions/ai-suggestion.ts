import { Extension, Mark, mergeAttributes } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'

// ─── Type augmentation ───────────────────────────────────────────────────────

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiInserted: {
      setAiInserted: (suggestionId: string) => ReturnType
    }
    aiDeleted: {
      setAiDeleted: (suggestionId: string) => ReturnType
    }
    trackChanges: {
      insertAiSuggestion: (options: InsertAiSuggestionOptions) => ReturnType
      acceptAiSuggestion: (suggestionId: string) => ReturnType
      rejectAiSuggestion: (suggestionId: string) => ReturnType
      acceptAllAiSuggestions: () => ReturnType
      rejectAllAiSuggestions: () => ReturnType
    }
  }
}

export interface InsertAiSuggestionOptions {
  text: string
  suggestionId?: string
  selectionFrom?: number
  selectionTo?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function findRangesWithMark(
  doc: ProsemirrorNode,
  markTypeName: string,
  suggestionId?: string
): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = []

  doc.nodesBetween(0, doc.content.size, (node, pos) => {
    if (!node.isText) return true
    const hasMark = node.marks.some(
      (m) =>
        m.type.name === markTypeName &&
        (suggestionId === undefined || m.attrs.suggestionId === suggestionId)
    )
    if (hasMark) {
      const last = ranges[ranges.length - 1]
      if (last && last.to === pos) {
        last.to = pos + node.nodeSize
      } else {
        ranges.push({ from: pos, to: pos + node.nodeSize })
      }
    }
    return false
  })

  return ranges
}

function buildMarkedParagraphs(
  text: string,
  markName: string,
  markAttrs: Record<string, unknown>
): object[] {
  const lines = text.split('\n')
  const result: object[] = []
  for (const line of lines) {
    result.push({
      type: 'paragraph',
      content: line.trim()
        ? [{ type: 'text', text: line, marks: [{ type: markName, attrs: markAttrs }] }]
        : [],
    })
  }
  return result
}

// ─── aiInserted mark (green) ─────────────────────────────────────────────────

export const AiInsertedMark = Mark.create({
  name: 'aiInserted',

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-ai-inserted-id'),
        renderHTML: (attrs) => ({ 'data-ai-inserted-id': attrs.suggestionId }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-ai-inserted-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'ai-inserted' }),
      0,
    ]
  },

  addCommands() {
    return {
      setAiInserted: (suggestionId: string) => ({ commands }) =>
        commands.setMark(this.name, { suggestionId }),
    }
  },
})

// ─── aiDeleted mark (red strikethrough) ──────────────────────────────────────

export const AiDeletedMark = Mark.create({
  name: 'aiDeleted',

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-ai-deleted-id'),
        renderHTML: (attrs) => ({ 'data-ai-deleted-id': attrs.suggestionId }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-ai-deleted-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'ai-deleted' }),
      0,
    ]
  },

  addCommands() {
    return {
      setAiDeleted: (suggestionId: string) => ({ commands }) =>
        commands.setMark(this.name, { suggestionId }),
    }
  },
})

// ─── TrackChanges extension (commands) ───────────────────────────────────────

export const TrackChanges = Extension.create({
  name: 'trackChanges',

  addCommands() {
    return {
      insertAiSuggestion:
        (options: InsertAiSuggestionOptions) =>
        ({ state, dispatch, editor }) => {
          const { text, selectionFrom, selectionTo } = options
          const id = options.suggestionId ?? generateId()
          const schema = state.schema
          const aiInsertedType = schema.marks.aiInserted
          const aiDeletedType = schema.marks.aiDeleted

          if (
            selectionFrom !== undefined &&
            selectionTo !== undefined &&
            selectionFrom !== selectionTo
          ) {
            // Inline replacement: mark original as deleted, insert new text after
            const tr = state.tr

            // 1. Mark the original text as deleted
            const deletedMark = aiDeletedType.create({ suggestionId: id })
            tr.addMark(selectionFrom, selectionTo, deletedMark)

            // 2. Insert new text with aiInserted mark after the deleted range
            const insertedMark = aiInsertedType.create({ suggestionId: id })
            const textNode = schema.text(text, [insertedMark])
            tr.insert(selectionTo, textNode)

            // Move cursor after the inserted text
            tr.setSelection(
              (state.selection.constructor as typeof import('@tiptap/pm/state').TextSelection).create(
                tr.doc,
                selectionTo + text.length
              )
            )

            if (dispatch) dispatch(tr)
          } else {
            // Multi-paragraph insertion at cursor
            const insertPos = state.selection.from
            const content = buildMarkedParagraphs(text, 'aiInserted', { suggestionId: id })
            editor.commands.insertContentAt(insertPos, content)
          }

          return true
        },

      acceptAiSuggestion:
        (suggestionId: string) =>
        ({ state, dispatch }) => {
          const tr = state.tr
          const schema = state.schema
          const aiInsertedType = schema.marks.aiInserted
          const aiDeletedType = schema.marks.aiDeleted

          const insertedRanges = findRangesWithMark(state.doc, 'aiInserted', suggestionId)
          const deletedRanges = findRangesWithMark(state.doc, 'aiDeleted', suggestionId)

          if (!insertedRanges.length && !deletedRanges.length) return false

          // Remove the aiInserted marks (keep text, just remove highlighting)
          for (const r of insertedRanges) {
            tr.removeMark(r.from, r.to, aiInsertedType)
          }

          // Delete the aiDeleted text (right to left so positions stay valid)
          const sortedDeleted = [...deletedRanges].sort((a, b) => b.from - a.from)
          for (const r of sortedDeleted) {
            tr.delete(r.from, r.to)
          }

          if (dispatch) dispatch(tr)
          return true
        },

      rejectAiSuggestion:
        (suggestionId: string) =>
        ({ state, dispatch }) => {
          const tr = state.tr
          const schema = state.schema
          const aiInsertedType = schema.marks.aiInserted
          const aiDeletedType = schema.marks.aiDeleted

          const insertedRanges = findRangesWithMark(state.doc, 'aiInserted', suggestionId)
          const deletedRanges = findRangesWithMark(state.doc, 'aiDeleted', suggestionId)

          if (!insertedRanges.length && !deletedRanges.length) return false

          // Delete the aiInserted text (right to left)
          const sortedInserted = [...insertedRanges].sort((a, b) => b.from - a.from)
          for (const r of sortedInserted) {
            tr.delete(r.from, r.to)
          }

          // Remove the aiDeleted marks (restore original text, just remove mark)
          for (const r of deletedRanges) {
            tr.removeMark(r.from, r.to, aiDeletedType)
          }

          if (dispatch) dispatch(tr)
          return true
        },

      acceptAllAiSuggestions:
        () =>
        ({ state, dispatch }) => {
          const tr = state.tr
          const schema = state.schema
          const aiInsertedType = schema.marks.aiInserted
          const aiDeletedType = schema.marks.aiDeleted

          const insertedRanges = findRangesWithMark(state.doc, 'aiInserted')
          const deletedRanges = findRangesWithMark(state.doc, 'aiDeleted')

          for (const r of insertedRanges) {
            tr.removeMark(r.from, r.to, aiInsertedType)
          }

          const sortedDeleted = [...deletedRanges].sort((a, b) => b.from - a.from)
          for (const r of sortedDeleted) {
            tr.delete(r.from, r.to)
          }

          if (dispatch) dispatch(tr)
          return true
        },

      rejectAllAiSuggestions:
        () =>
        ({ state, dispatch }) => {
          const tr = state.tr
          const schema = state.schema
          const aiInsertedType = schema.marks.aiInserted
          const aiDeletedType = schema.marks.aiDeleted

          const insertedRanges = findRangesWithMark(state.doc, 'aiInserted')
          const deletedRanges = findRangesWithMark(state.doc, 'aiDeleted')

          const sortedInserted = [...insertedRanges].sort((a, b) => b.from - a.from)
          for (const r of sortedInserted) {
            tr.delete(r.from, r.to)
          }

          for (const r of deletedRanges) {
            tr.removeMark(r.from, r.to, aiDeletedType)
          }

          if (dispatch) dispatch(tr)
          return true
        },
    }
  },
})
