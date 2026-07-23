import type { Metadata } from 'next'
import { CharacterContent } from './character-content'

export const metadata: Metadata = {
  title: 'Character Wiki — ETHÉREA',
  description: 'Explore character profiles, stats, and lore in the ETHÉREA universe.',
}

export default function CharacterPage() {
  return <CharacterContent />
}
