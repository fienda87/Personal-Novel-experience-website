'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { User, Buildings, Cube } from '@phosphor-icons/react'

export type CustomNodeData = {
  label: string
  type: 'character' | 'location' | 'item'
  subtitle?: string
  imageUrl?: string
  snippet?: string
  tags?: string[]
  strength?: number
  agility?: number
  intelligence?: number
  charisma?: number
  wisdom?: number
  vitality?: number
  faction?: string
  city?: string
  rarity?: string
}

const styles = {
  character: {
    border: 'ring-moonstone-blue/30 group-hover:ring-moonstone-blue/60',
    accent: 'text-moonstone-blue',
    badge: 'bg-moonstone-blue/15 text-moonstone-blue ring-1 ring-moonstone-blue/20',
    thumb: 'from-moonstone-blue/20 to-transparent',
    handle: '!bg-moonstone-blue !shadow-[0_0_8px_rgba(148,187,233,0.5)]',
  },
  location: {
    border: 'ring-ethereal-teal/30 group-hover:ring-ethereal-teal/60',
    accent: 'text-ethereal-teal',
    badge: 'bg-ethereal-teal/15 text-ethereal-teal ring-1 ring-ethereal-teal/20',
    thumb: 'from-ethereal-teal/20 to-transparent',
    handle: '!bg-ethereal-teal !shadow-[0_0_8px_rgba(20,184,166,0.5)]',
  },
  item: {
    border: 'ring-iridescent-silver/30 group-hover:ring-iridescent-silver/60',
    accent: 'text-iridescent-silver',
    badge: 'bg-iridescent-silver/15 text-iridescent-silver ring-1 ring-iridescent-silver/20',
    thumb: 'from-iridescent-silver/20 to-transparent',
    handle: '!bg-iridescent-silver !shadow-[0_0_8px_rgba(203,213,225,0.5)]',
  },
}

function Thumbnail({ type, imageUrl }: { type: string; imageUrl?: string }) {
  const s = styles[type as keyof typeof styles]
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="w-full h-full object-cover" />
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br ${s.thumb} flex items-center justify-center`}>
      {type === 'character' && <User size={20} weight="light" className={s.accent} />}
      {type === 'location' && <Buildings size={20} weight="light" className={s.accent} />}
      {type === 'item' && <Cube size={20} weight="light" className={s.accent} />}
    </div>
  )
}

function BaseNode({ data, type, children }: NodeProps<Node<CustomNodeData>> & { type: 'character' | 'location' | 'item'; children?: React.ReactNode }) {
  const s = styles[type]
  return (
    <div className="group w-64 glass overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(148,187,233,0.15)]">
        <div className="flex items-center gap-3 p-3">
            <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden ring-2 ring-white/10">
              <Thumbnail type={type} imageUrl={data.imageUrl} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm text-white/90 tracking-tight truncate">
                {data.label}
              </p>
              {data.subtitle && (
                <p className="font-mono text-[8px] text-white/40 uppercase tracking-wider mt-0.5 truncate">
                  {data.subtitle}
                </p>
              )}
            </div>
          </div>
          {children && (
            <div className="px-3 pb-3 flex flex-wrap gap-1">
              {children}
            </div>
          )}
      <Handle type="target" position={Position.Top} className={`!w-3 !h-3 !border-2 !border-[#0d1117] ${styles.character.handle}`} />
      <Handle type="source" position={Position.Bottom} className={`!w-3 !h-3 !border-2 !border-[#0d1117] ${s.handle}`} />
    </div>
  )
}

export const CharacterNode = memo((props: NodeProps<Node<CustomNodeData>>) => {
  const s = styles.character
  const d = props.data
  return (
    <BaseNode {...props} type="character">
      {d.strength != null && <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${s.badge}`}>STR {d.strength}</span>}
      {d.intelligence != null && <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${s.badge}`}>INT {d.intelligence}</span>}
      {d.agility != null && <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${s.badge}`}>AGI {d.agility}</span>}
    </BaseNode>
  )
})
CharacterNode.displayName = 'CharacterNode'

export const LocationNode = memo((props: NodeProps<Node<CustomNodeData>>) => {
  const s = styles.location
  const d = props.data
  return (
    <BaseNode {...props} type="location">
      {d.faction && <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${s.badge}`}>{d.faction}</span>}
      {d.city && <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${s.badge}`}>{d.city}</span>}
    </BaseNode>
  )
})
LocationNode.displayName = 'LocationNode'

export const ItemNode = memo((props: NodeProps<Node<CustomNodeData>>) => {
  const s = styles.item
  const d = props.data
  return (
    <BaseNode {...props} type="item">
      {d.rarity ? (
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${s.badge}`}>{d.rarity}</span>
      ) : (
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${s.badge}`}>ARTIFACT</span>
      )}
    </BaseNode>
  )
})
ItemNode.displayName = 'ItemNode'
