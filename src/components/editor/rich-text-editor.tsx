'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { CustomMention } from '@/components/editor/custom-mention'
import { AudioBlock } from '@/components/editor/audio-block'
import { GlassPanel } from '@/components/ui/glass-panel'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Music,
  AtSign,
  X,
  Upload,
} from 'lucide-react'

const suggestions = [
  { id: 'char-1', label: 'Baydar', type: 'character' },
  { id: 'char-2', label: 'Anisa', type: 'character' },
  { id: 'char-3', label: 'Rifki', type: 'character' },
  { id: 'char-4', label: 'Alfriza', type: 'character' },
  { id: 'loc-1', label: 'ITK', type: 'location' },
  { id: 'item-1', label: 'Loli Hunter', type: 'item' },
]

function MentionList({ items, command }: { items: typeof suggestions; command: (item: { id: string; label: string; entityType: string }) => void }) {
  return (
    <div className="glass-panel-strong fixed z-50 w-56 max-h-48 overflow-y-auto p-2 space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => command({ id: item.id, label: item.label, entityType: item.type })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-moonstone-blue to-ethereal-teal text-xs font-bold text-white">
            {item.label[0]}
          </span>
          {item.label}
          <span className="ml-auto text-xs text-on-surface-variant">{item.type}</span>
        </button>
      ))}
    </div>
  )
}

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
}

export function RichTextEditor({ content = '', onChange }: RichTextEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPos, setSlashMenuPos] = useState({ x: 0, y: 0 })
  const [liveSuggestions, setLiveSuggestions] = useState<{ id: string; label: string; type: string }[]>(suggestions)
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [audioUrlInput, setAudioUrlInput] = useState('')
  const [audioTab, setAudioTab] = useState<'url' | 'upload'>('url')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const slashMenuRef = useRef<HTMLDivElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/entities')
      .then((r) => r.json())
      .then((list: { id: string; name: string; type: string }[]) => {
        if (Array.isArray(list)) {
          setLiveSuggestions(list.map((e) => ({ id: e.id, label: e.name, type: e.type })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false)
      }
    }
    if (showSlashMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSlashMenu])

  useEffect(() => {
    if (showAudioModal && audioInputRef.current) {
      audioInputRef.current.focus()
    }
  }, [showAudioModal])

  const editor = useEditor({
    extensions: [
      StarterKit,
      AudioBlock,
      Placeholder.configure({
        placeholder: 'Start writing... Type / for commands, @ to mention characters...',
      }),
      CustomMention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }: { query: string }) =>
            liveSuggestions.filter((s) =>
              s.label.toLowerCase().includes(query.toLowerCase())
            ),
          render: () => {
            let dom: HTMLDivElement | null = null
            let root: Root | null = null
            return {
              onStart: (props) => {
                dom = document.createElement('div')
                const rect = props.clientRect?.()
                dom.style.left = `${rect?.left ?? 0}px`
                dom.style.top = `${(rect?.top ?? 0) + 24}px`
                dom.style.position = 'fixed'
                dom.style.zIndex = '50'
                document.body.appendChild(dom)
                root = createRoot(dom)
                root.render(
                  <MentionList
                    items={props.items as { id: string; label: string; type: string }[]}
                    command={(item) => props.command(item)}
                  />
                )
              },
              onUpdate: (props) => {
                if (!dom || !root) return
                root.render(
                  <MentionList
                    items={props.items as { id: string; label: string; type: string }[]}
                    command={(item) => props.command(item)}
                  />
                )
              },
              onExit: () => {
                if (root) {
                  root.unmount()
                  root = null
                }
                if (dom) {
                  dom.remove()
                  dom = null
                }
              },
              onKeyDown: () => true,
            }
          },
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-6 py-4 text-on-surface-variant leading-relaxed',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === '/') {
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            setSlashMenuPos({ x: rect.left, y: rect.bottom })
            setTimeout(() => setShowSlashMenu(true), 0)
          }
        }
        if (event.key === 'Escape') {
          setShowSlashMenu(false)
        }
        return false
      },
    },
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === content) return
    editor.commands.setContent(content)
  }, [content, editor])

  const insertAudioBlock = useCallback((url: string) => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .insertContent(`<div data-audio-src="${url.replace(/"/g, '&quot;')}"></div>`)
      .run()
  }, [editor])

  const handleOpenAudioModal = useCallback(() => {
    setShowSlashMenu(false)
    setAudioUrlInput('')
    setAudioFile(null)
    setAudioTab('url')
    setShowAudioModal(true)
  }, [])

  const handleAudioConfirm = useCallback(async () => {
    if (audioTab === 'upload' && audioFile) {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', audioFile)
        const res = await fetch('/api/uploads/audio', { method: 'POST', body: formData })
        if (res.ok) {
          const { url } = await res.json()
          insertAudioBlock(url)
        }
      } catch {
        // fail silently
      }
      setIsUploading(false)
    } else {
      const url = audioUrlInput.trim()
      if (url) {
        insertAudioBlock(url)
      }
    }
    setShowAudioModal(false)
  }, [audioUrlInput, audioFile, audioTab, insertAudioBlock])

  if (!editor) return null

  return (
    <div className="relative">
      <GlassPanel variant="strong" className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-1 border-b border-white/5 px-4 py-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded-lg p-1.5 transition-colors ${
              editor.isActive('bold') ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded-lg p-1.5 transition-colors ${
              editor.isActive('italic') ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
          >
            <Italic size={16} />
          </button>
          <div className="mx-1 h-5 w-px bg-white/10" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`rounded-lg p-1.5 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`rounded-lg p-1.5 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
          >
            <Heading2 size={16} />
          </button>
          <div className="mx-1 h-5 w-px bg-white/10" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded-lg p-1.5 transition-colors ${
              editor.isActive('bulletList') ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded-lg p-1.5 transition-colors ${
              editor.isActive('orderedList') ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`rounded-lg p-1.5 transition-colors ${
              editor.isActive('blockquote') ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
            }`}
          >
            <Quote size={16} />
          </button>
          <div className="mx-1 h-5 w-px bg-white/10" />
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
          >
            <Redo size={16} />
          </button>
          <div className="ml-auto flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <AtSign size={12} /> @mention
            </span>
            <span className="mx-1">|</span>
            <span className="flex items-center gap-1">
              / commands
            </span>
          </div>
        </div>
        <EditorContent editor={editor} />
      </GlassPanel>

      {showSlashMenu && (
        <div
          ref={slashMenuRef}
          className="glass-panel-strong fixed z-50 w-56 space-y-1 p-2"
          style={{ left: slashMenuPos.x, top: slashMenuPos.y }}
        >
          <button
            onClick={handleOpenAudioModal}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
          >
            <Music size={16} className="text-moonstone-blue" />
            Audio Block
            <span className="ml-auto text-xs text-on-surface-variant">Insert audio</span>
          </button>
          <button
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run()
              setShowSlashMenu(false)
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
          >
            <span className="text-lg leading-none text-ethereal-teal">—</span>
            Divider
          </button>
        </div>
      )}

      {showAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-on-surface">Insert Audio</h3>
              <button
                onClick={() => setShowAudioModal(false)}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setAudioTab('url')}
                className={`flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  audioTab === 'url' ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                URL
              </button>
              <button
                onClick={() => setAudioTab('upload')}
                className={`flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  audioTab === 'upload' ? 'bg-moonstone-blue/20 text-moonstone-blue' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Upload
              </button>
            </div>

            {audioTab === 'url' ? (
              <input
                ref={audioInputRef}
                type="url"
                value={audioUrlInput}
                onChange={(e) => setAudioUrlInput(e.target.value)}
                placeholder="https://example.com/audio.mp3"
                className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-moonstone-blue/50"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAudioConfirm(); if (e.key === 'Escape') setShowAudioModal(false) }}
              />
            ) : (
              <label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center transition-colors hover:border-white/30 hover:bg-white/[0.06]">
                <Upload size={24} className="text-moonstone-blue" />
                <span className="text-sm text-on-surface-variant">
                  {audioFile ? audioFile.name : 'Drop audio file or click to upload'}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                  MP3, WAV, OGG, M4A
                </span>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/webm"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setAudioFile(f) }}
                />
              </label>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAudioModal(false)}
                className="rounded-xl px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleAudioConfirm}
                disabled={isUploading || (audioTab === 'upload' && !audioFile)}
                className="rounded-xl bg-moonstone-blue/20 px-4 py-2 text-sm font-medium text-moonstone-blue transition-colors hover:bg-moonstone-blue/30 disabled:opacity-40"
              >
                {isUploading ? 'Uploading...' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
