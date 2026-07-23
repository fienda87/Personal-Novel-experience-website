import Mention from '@tiptap/extension-mention'

export const CustomMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      entityType: {
        default: 'character',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-entity-type') || 'character',
        renderHTML: (attrs) => ({ 'data-entity-type': attrs.entityType }),
      },
    }
  },
})
