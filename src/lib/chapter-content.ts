import type { Paragraph, EntityMention } from '@/lib/types'

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function cleanText(value: string) {
  return decodeHtmlEntities(value)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function extractTextAndMentions(el: Element): { text: string; mentions: EntityMention[] } {
  let text = ''
  let html = ''
  const mentions: EntityMention[] = []

  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = child.textContent ?? ''
      text += t
      html += t
    } else if (child instanceof HTMLElement) {
      if (child.getAttribute('data-type') === 'mention' || child.classList.contains('mention')) {
        const entityId = child.getAttribute('data-id') ?? ''
        const entityName = (child.textContent ?? '').replace(/^@/, '')
        const entityType = (child.getAttribute('data-entity-type') as 'character' | 'location' | 'item') || 'character'
        const mentionText = child.textContent ?? ''
        const startIndex = text.length
        text += mentionText
        html += child.outerHTML
        mentions.push({
          entityId,
          entityName,
          entityType,
          startIndex,
          endIndex: startIndex + mentionText.length,
        })
      } else if (child.tagName === 'BR') {
        text += '\n'
        html += '<br>'
      } else {
        const t = child.textContent ?? ''
        text += t
        html += t
      }
    }
  }

  return { text: cleanText(html), mentions }
}

export function paragraphsFromEditorHtml(value: string): Paragraph[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(value, 'text/html')
  const paragraphs: Paragraph[] = []
  let index = 0

  for (const node of doc.body.children) {
    if (!(node instanceof HTMLElement)) continue

    const audioSrc = node.getAttribute('data-audio-src')
    if (audioSrc) {
      paragraphs.push({
        id: `p${index + 1}`,
        text: '',
        audioUrl: audioSrc,
      })
      index++
      continue
    }

    if (node.tagName === 'P') {
      const { text, mentions } = extractTextAndMentions(node)
      if (!text && mentions.length === 0) continue
      paragraphs.push({
        id: `p${index + 1}`,
        text,
        mentions: mentions.length > 0 ? mentions : undefined,
      })
      index++
    }
  }

  return paragraphs.length > 0 ? paragraphs : [{ id: 'p1', text: cleanText(value) }]
}

export function htmlToParagraphs(value: string) {
  const html = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|section|article)>/gi, '</p>')
    .replace(/<(div|section|article)(\s[^>]*)?>/gi, '<p>')

  const blocks = [...html.matchAll(/<(p|h[1-6]|li|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => cleanText(match[2].replace(/<[^>]+>/g, '')))
    .filter(Boolean)

  if (blocks.length > 0) return blocks

  return cleanText(html.replace(/<[^>]+>/g, ''))
    .split(/\n{2,}/)
    .map((paragraph) => cleanText(paragraph))
    .filter(Boolean)
}

export function normalizeParagraph(paragraph: Paragraph, index: number): Paragraph {
  if (!/<[a-z][\s\S]*>/i.test(paragraph.text)) return paragraph

  return {
    ...paragraph,
    id: paragraph.id || `p${index + 1}`,
    text: htmlToParagraphs(paragraph.text).join('\n\n'),
  }
}

export function normalizeParagraphs(paragraphs: Paragraph[]) {
  return paragraphs.flatMap((paragraph, index) => {
    if (!/<[a-z][\s\S]*>/i.test(paragraph.text)) return [paragraph]

    return htmlToParagraphs(paragraph.text).map((text, paragraphIndex) => ({
      ...paragraph,
      id: `${paragraph.id || `p${index + 1}`}-${paragraphIndex + 1}`,
      text,
    }))
  })
}
