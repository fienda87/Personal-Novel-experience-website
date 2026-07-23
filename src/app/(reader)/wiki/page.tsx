'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, MagnifyingGlass, Sword, ShieldCheck, Heart, Funnel } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Character } from '@/lib/types'

const ease = [0.32, 0.72, 0, 1] as [number, number, number, number]

type FilterType = 'all' | 'ally' | 'enemy' | 'lover'

const filters: { type: FilterType; label: string; icon: typeof Sword }[] = [
  { type: 'all', label: 'All', icon: Users },
  { type: 'ally', label: 'Alliance', icon: ShieldCheck },
  { type: 'enemy', label: 'Enemy', icon: Sword },
  { type: 'lover', label: 'Lovers', icon: Heart },
]

function matchesFilter(character: Character, filter: FilterType): boolean {
  if (filter === 'all') return true
  const rels = character.relationships ?? []
  return rels.some((r) => r.type === filter)
}

const artColors = [
  'from-moonstone-blue/20 via-purple-500/10 to-black',
  'from-ethereal-teal/20 via-blue-500/10 to-black',
  'from-pink-500/20 via-orange-500/10 to-black',
  'from-yellow-500/20 via-red-500/10 to-black',
  'from-green-500/20 via-cyan-500/10 to-black',
]

export default function WikiPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/characters')
      .then((r) => r.json())
      .then((data) => {
        setCharacters(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const filtered = characters.filter((c) => {
    if (!matchesFilter(c, filter)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.faction.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-2 h-2 rounded-full bg-moonstone-blue animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
        <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.3em] animate-pulse">
          Summoning the archives...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease }}
        className="mb-16"
      >
        <span className="font-mono text-[10px] text-moonstone-blue tracking-[0.25em] uppercase mb-3 block">
          Codex
        </span>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-4">
          Characters
        </h1>
        <p className="text-on-surface-variant text-base max-w-lg leading-relaxed">
          Browse the inhabitants of ETHÉREA. Filter by affiliation or search by name, title, or faction.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-12">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.type}
              onClick={() => setFilter(f.type)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                filter === f.type
                  ? 'bg-moonstone-blue/10 text-moonstone-blue ring-1 ring-moonstone-blue/30'
                  : 'bg-white/5 text-on-surface-variant ring-1 ring-white/10 hover:bg-white/10 hover:text-on-surface'
              )}
            >
              <f.icon size={12} weight={filter === f.type ? 'fill' : 'light'} />
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white/5 ring-1 ring-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-moonstone-blue/30 transition-all duration-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <Funnel size={32} weight="light" className="text-on-surface-variant mx-auto mb-4" />
          <p className="font-display text-xl text-on-surface-variant mb-2">No characters found</p>
          <p className="font-mono text-[10px] text-on-surface-variant tracking-[0.2em] uppercase">
            Try a different filter or search term
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((character, i) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.05 * i, ease }}
            >
              <Link
                href={`/wiki/character/${character.id}`}
                className="group block glass overflow-hidden transition-all duration-700 hover:border-moonstone-blue/30 hover:-translate-y-1 h-full"
              >
                <div className="h-full flex flex-col transition-all duration-700">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {character.imageUrl ? (
                      <img
                        src={character.imageUrl}
                        alt={character.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                          ;(el.nextElementSibling as HTMLElement)?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 bg-gradient-to-br ${artColors[i % artColors.length]} ${character.imageUrl ? 'hidden' : ''}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="font-display text-lg tracking-tight text-white group-hover:text-moonstone-blue transition-colors duration-500">
                        {character.name}
                      </h2>
                      <p className="font-mono text-[9px] text-white/50 uppercase tracking-wider truncate">
                        {character.title}
                      </p>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {character.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xl text-[8px] font-mono text-white/50 uppercase tracking-wider ring-1 ring-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
                      {character.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
                        {character.role}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
                        {character.faction.includes(' ') ? character.faction.split(' ').pop() : character.faction}
                      </span>
                      {(character.relationships?.length ?? 0) > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-moonstone-blue/10 text-[9px] font-mono text-moonstone-blue uppercase tracking-wider">
                          {character.relationships!.length} ties
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
