import { Node, mergeAttributes } from '@tiptap/core'

export const AudioBlock = Node.create({
  name: 'audioBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-audio-src'),
        renderHTML: (attrs) => ({ 'data-audio-src': attrs.src }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-audio-src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'audio-block flex items-center gap-3 p-3 my-4 rounded-xl bg-white/5 border border-white/10',
      }),
      ['span', { class: 'audio-block-icon text-moonstone-blue' }, '🎵'],
      ['span', { class: 'audio-block-label text-sm text-on-surface font-medium' }, 'Audio'],
      ['span', { class: 'audio-block-src text-xs text-on-surface-variant ml-auto truncate max-w-[200px]' }, HTMLAttributes['data-audio-src'] || ''],
    ]
  },
})
