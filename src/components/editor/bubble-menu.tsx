'use client'

import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Bold, Italic, Underline, Highlighter, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAIStore } from '@/stores/ai-store'
import { useEditorStore } from '@/stores/editor-store'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

interface EditorBubbleMenuProps {
  editor: Editor
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const { setPanelMode } = useAIStore()
  const { setSelectedText } = useEditorStore()
  const { setRightSidebarOpen } = useUIStore()

  const handleAIAction = () => {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    setSelectedText(text)
    setPanelMode('suggestion')
    setRightSidebarOpen(true)
  }

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-lg border bg-popover shadow-lg p-1"
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', editor.isActive('bold') && 'bg-accent')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', editor.isActive('italic') && 'bg-accent')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', editor.isActive('underline') && 'bg-accent')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <Underline className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', editor.isActive('highlight') && 'bg-accent')}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        title="Highlight"
      >
        <Highlighter className="h-3.5 w-3.5" />
      </Button>
      <Separator orientation="vertical" className="mx-0.5 h-5" />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-primary"
        onClick={handleAIAction}
        title="AI: Smart edit selected text"
      >
        <Sparkles className="h-3.5 w-3.5" />
      </Button>
    </BubbleMenu>
  )
}
