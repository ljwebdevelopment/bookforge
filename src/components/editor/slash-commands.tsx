'use client'

import { Extension, Editor } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const COMMANDS = [
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: 'H1' },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: 'H2' },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: 'H3' },
  { id: 'bullet', label: 'Bullet list', description: 'Unordered list', icon: '•' },
  { id: 'ordered', label: 'Numbered list', description: 'Ordered list', icon: '1.' },
  { id: 'blockquote', label: 'Quote', description: 'Block quotation', icon: '"' },
  { id: 'hr', label: 'Divider', description: 'Horizontal rule', icon: '—' },
]

interface CommandListProps {
  items: typeof COMMANDS
  command: (item: (typeof COMMANDS)[number]) => void
}

const CommandList = forwardRef<{ onKeyDown: (e: KeyboardEvent) => boolean }, CommandListProps>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0)

    useEffect(() => setSelected(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowUp') {
          setSelected((s) => (s - 1 + items.length) % items.length)
          return true
        }
        if (e.key === 'ArrowDown') {
          setSelected((s) => (s + 1) % items.length)
          return true
        }
        if (e.key === 'Enter') {
          command(items[selected])
          return true
        }
        return false
      },
    }))

    if (!items.length) return null

    return (
      <div className="z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover shadow-md p-1">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => command(item)}
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors',
              i === selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
            )}
          >
            <span className="w-5 text-center font-mono text-xs text-muted-foreground">{item.icon}</span>
            <div className="text-left">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    )
  }
)
CommandList.displayName = 'CommandList'

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: (typeof COMMANDS)[number] }) => {
          const { id } = props
          editor.chain().focus().deleteRange(range as never).run()

          if (id === 'h1') editor.chain().toggleHeading({ level: 1 }).run()
          else if (id === 'h2') editor.chain().toggleHeading({ level: 2 }).run()
          else if (id === 'h3') editor.chain().toggleHeading({ level: 3 }).run()
          else if (id === 'bullet') editor.chain().toggleBulletList().run()
          else if (id === 'ordered') editor.chain().toggleOrderedList().run()
          else if (id === 'blockquote') editor.chain().toggleBlockquote().run()
          else if (id === 'hr') editor.chain().setHorizontalRule().run()
        },
        items: ({ query }: { query: string }) =>
          COMMANDS.filter(
            (c) =>
              c.label.toLowerCase().includes(query.toLowerCase()) ||
              c.description.toLowerCase().includes(query.toLowerCase())
          ),
        render: () => {
          let component: ReactRenderer
          let popup: HTMLElement

          return {
            onStart: (props: object) => {
              popup = document.createElement('div')
              popup.style.position = 'absolute'
              document.body.appendChild(popup)

              component = new ReactRenderer(CommandList, {
                props,
                editor: (props as { editor: Editor }).editor,
              })

              popup.appendChild(component.element as HTMLElement)
            },
            onUpdate(props: object) {
              component.updateProps(props)
              const rect = (props as { clientRect: (() => DOMRect | null) | null }).clientRect?.()
              if (rect) {
                popup.style.top = `${rect.bottom + window.scrollY + 8}px`
                popup.style.left = `${rect.left + window.scrollX}px`
              }
            },
            onKeyDown(props: { event: KeyboardEvent }) {
              return (component.ref as { onKeyDown: (e: KeyboardEvent) => boolean } | null)?.onKeyDown(props.event) ?? false
            },
            onExit() {
              popup.remove()
              component.destroy()
            },
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
