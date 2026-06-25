'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { BubbleMenu } from '@tiptap/react/menus'
import { useEffect, useCallback } from 'react'
import { AiSuggestion } from './extensions/ai-suggestion'
import { SlashCommands } from './slash-commands'
import { EditorToolbar } from './editor-toolbar'
import { EditorFooter } from './editor-footer'
import { EditorBubbleMenu } from './bubble-menu'
import { useEditorStore } from '@/stores/editor-store'
import { useEditorAutosave } from '@/hooks/use-editor-autosave'
import { getWordCount } from '@/lib/editor/word-count'

interface TipTapEditorProps {
  projectId: string
  chapterId: string
  initialContent: object | null
  onContentChange?: (content: object) => void
}

export function TipTapEditor({ projectId, chapterId, initialContent, onContentChange }: TipTapEditorProps) {
  const { setSaveStatus, setWordCount, setSelectedText, setCurrentChapter } = useEditorStore()
  const { debouncedSave } = useEditorAutosave(projectId, chapterId)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      CharacterCount,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading...'
          return 'Start writing, or type / for commands...'
        },
      }),
      Typography,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      AiSuggestion,
      SlashCommands,
    ],
    content: initialContent ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none px-8 py-6 min-h-full',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const text = editor.getText()
      const count = getWordCount(text)
      setWordCount(count)
      setSaveStatus('saving')
      debouncedSave(json, count)
      onContentChange?.(json)
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const selected = from !== to ? editor.state.doc.textBetween(from, to, ' ') : null
      setSelectedText(selected)
    },
  })

  useEffect(() => {
    setCurrentChapter(chapterId)
    return () => setCurrentChapter(null)
  }, [chapterId, setCurrentChapter])

  useEffect(() => {
    if (!editor) return
    // When switching chapters: set the new content, or clear to blank if new chapter
    const newContent = initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] }
    editor.commands.setContent(newContent, false) // false = don't emit update (avoid triggering save)
    setWordCount(editor.getText().split(/\s+/).filter(Boolean).length)
  }, [chapterId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-auto">
        <EditorBubbleMenu editor={editor} />
        <EditorContent editor={editor} className="h-full" />
      </div>
      <EditorFooter editor={editor} />
    </div>
  )
}
