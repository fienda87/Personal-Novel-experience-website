export interface CharacterRelationship {
  type: 'ally' | 'enemy' | 'lover'
  targetId: string
  targetName: string
}

export interface Character {
  id: string
  name: string
  title: string
  role: string
  faction: string
  city: string
  imageUrl: string
  description: string
  lore: string
  stats: CharacterStats
  tags: string[]
  relationships?: CharacterRelationship[]
}

export interface CharacterStats {
  strength: number
  agility: number
  intelligence: number
  charisma: number
  wisdom: number
  vitality: number
}

export interface Chapter {
  id: string
  title: string
  number: number
  bannerUrl?: string
  content: Paragraph[]
  createdAt: string
  updatedAt: string
}

export interface Paragraph {
  id: string
  text: string
  audioUrl?: string
  mentions?: EntityMention[]
}

export interface EntityMention {
  entityId: string
  entityName: string
  entityType: 'character' | 'location' | 'item'
  startIndex: number
  endIndex: number
}

export interface Entity {
  id: string
  name: string
  type: 'character' | 'location' | 'item'
  imageUrl: string
  snippet: string
  tags: string[]
}

export interface LoreBlock {
  id: string
  type: 'text' | 'stat-block' | 'inventory' | 'skill'
  title: string
  content: string
}

export interface Relation {
  id: string
  sourceId: string
  targetId: string
  label: string
  type: 'ally' | 'enemy' | 'located-in' | 'owns' | 'member-of'
}
