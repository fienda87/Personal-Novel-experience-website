import type { Metadata } from 'next'
import { ChapterContent } from './chapter-content'

export const metadata: Metadata = {
  title: 'Chapter — ETHÉREA',
  description: 'Read the chronicles of ETHÉREA. Immersive spatial narrative experience.',
}

export default function ChapterPage() {
  return <ChapterContent />
}
