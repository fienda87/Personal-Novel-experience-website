'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/glass-panel'
import { GlassButton } from '@/components/ui/glass-button'
import {
  Users, Plus, TrashSimple, X, MagnifyingGlass, Funnel,
} from '@phosphor-icons/react'

interface CharacterStats {
  strength: number
  agility: number
  intelligence: number
  charisma: number
  wisdom: number
  vitality: number
}

interface CharacterRelationship {
  type: 'ally' | 'enemy' | 'lover'
  targetId: string
  targetName: string
}

interface Character {
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

const emptyStats: CharacterStats = { strength: 10, agility: 10, intelligence: 10, charisma: 10, wisdom: 10, vitality: 10 }
const emptyChar: Character = {
  id: '', name: '', title: '', role: '', faction: '', city: '', imageUrl: '',
  description: '', lore: '', stats: { ...emptyStats }, tags: [], relationships: [],
}

const factions = ['Order of the Crimson Flame', 'The Hollow Court', 'Unaligned']
const statKeys: (keyof CharacterStats)[] = ['strength', 'agility', 'intelligence', 'charisma', 'wisdom', 'vitality']
const statLabels: Record<string, string> = {
  strength: 'STR', agility: 'AGI', intelligence: 'INT', charisma: 'CHA', wisdom: 'WIS', vitality: 'VIT',
}

export default function AdminCharacters() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [factionFilter, setFactionFilter] = useState('')
  const [editing, setEditing] = useState<Character | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCharacters()
  }, [])

  async function loadCharacters() {
    const res = await fetch('/api/characters')
    const data = await res.json()
    setCharacters(Array.isArray(data) ? data : [])
    setLoaded(true)
  }

  const filtered = characters.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
    const matchFaction = !factionFilter || c.faction === factionFilter
    return matchSearch && matchFaction
  })

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return
    setSaving(true)
    const payload = {
      ...editing,
      id: editing.id || `char-${Date.now()}`,
      tags: typeof editing.tags === 'string'
        ? (editing.tags as unknown as string).split(',').map((t) => t.trim()).filter(Boolean)
        : editing.tags,
    }
    await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    setEditing(null)
    loadCharacters()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/characters?id=${id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    loadCharacters()
  }

  const updateField = (field: string, value: unknown) => {
    if (!editing) return
    setEditing({ ...editing, [field]: value })
  }

  const updateStat = (stat: keyof CharacterStats, value: number) => {
    if (!editing) return
    setEditing({ ...editing, stats: { ...editing.stats, [stat]: value } })
  }

  const addTag = (tag: string) => {
    if (!editing || !tag.trim()) return
    setEditing({ ...editing, tags: [...editing.tags, tag.trim()] })
  }

  const removeTag = (i: number) => {
    if (!editing) return
    setEditing({ ...editing, tags: editing.tags.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <Users size={28} className="text-moonstone-blue" weight="light" />
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Characters</h1>
        </div>
        <GlassButton glow="moonstone" size="sm" showIcon onClick={() => setEditing({ ...emptyChar, id: `char-${Date.now()}` })}>
          <Plus size={16} weight="light" /> Add Character
        </GlassButton>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" weight="light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search characters..."
            className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:ring-moonstone-blue/40 transition-all duration-500"
          />
        </div>
        <div className="flex gap-1.5 items-center">
          <Funnel size={14} className="text-white/30" weight="light" />
          {['', ...factions].map((f) => (
            <button
              key={f}
              onClick={() => setFactionFilter(factionFilter === f ? '' : f)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-500 ${
                factionFilter === f
                  ? 'bg-moonstone-blue/20 ring-1 ring-moonstone-blue/40 text-moonstone-blue'
                  : 'bg-white/5 ring-1 ring-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div className="text-center py-20">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.25em]">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Users size={48} className="mx-auto text-white/10 mb-4" weight="light" />
          <p className="font-display text-xl text-white/40">No characters found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((char, i) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
            >
              <button
                onClick={() => setEditing(char)}
                className="w-full text-left group"
              >
                <div className="glass overflow-hidden transition-all duration-500 hover:border-moonstone-blue/30 hover:-translate-y-1">
                  <div className="aspect-[3/2] bg-gradient-to-br from-moonstone-blue/[0.06] to-black flex items-center justify-center relative">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)?.classList.remove('hidden') }}
                        />
                      ) : null}
                      <div className={`${char.imageUrl ? 'hidden' : ''} flex flex-col items-center`}>
                        <div className="w-14 h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                          <span className="font-display text-2xl text-moonstone-blue/60">{char.name[0]}</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                        <span className="bg-black/60 backdrop-blur-xl px-2 py-0.5 rounded-full text-[8px] font-mono ring-1 ring-white/10 text-white/60 uppercase tracking-wider">
                          Edit
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-display text-sm tracking-tight text-white/90 truncate group-hover:text-moonstone-blue transition-all duration-500">
                        {char.name}
                      </h3>
                      <p className="font-mono text-[8px] text-white/30 uppercase tracking-wider mt-0.5 truncate">
                        {char.title}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-mono text-white/30 ring-1 ring-white/10">
                          {char.faction.includes(' ') ? char.faction.split(' ').pop() : char.faction}
                        </span>
                        {char.role && (
                          <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-mono text-white/30 ring-1 ring-white/10">
                            {char.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-xl bg-[#050505] border-l border-white/10 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 z-10 flex items-center justify-between px-6 py-4">
                <h2 className="font-display text-xl tracking-tight">
                  {editing.id.startsWith('char-') && characters.find((c) => c.id === editing.id) ? 'Edit' : 'New'} Character
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-500"
                >
                  <X size={16} className="text-white/50" weight="light" />
                </button>
              </div>

              <div className="p-6 space-y-6 pb-32">
                <GlassPanel className="space-y-4">
                  <Field label="Name" value={editing.name} onChange={(v) => updateField('name', v)} />
                  <Field label="Title" value={editing.title} onChange={(v) => updateField('title', v)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Role" value={editing.role} onChange={(v) => updateField('role', v)} />
                    <Field label="City" value={editing.city} onChange={(v) => updateField('city', v)} />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] block mb-1.5">Faction</label>
                    <select
                      value={editing.faction}
                      onChange={(e) => updateField('faction', e.target.value)}
                      className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-moonstone-blue/40 transition-all duration-500 appearance-none"
                    >
                      <option value="">Select faction</option>
                      {factions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <Field label="Image URL" value={editing.imageUrl} onChange={(v) => updateField('imageUrl', v)} placeholder="https://..." />
                </GlassPanel>

                <GlassPanel className="space-y-3">
                  <LabelHeader>Description</LabelHeader>
                  <textarea
                    value={editing.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:ring-moonstone-blue/40 transition-all duration-500 resize-none"
                  />
                </GlassPanel>

                <GlassPanel className="space-y-3">
                  <LabelHeader>Lore</LabelHeader>
                  <textarea
                    value={editing.lore}
                    onChange={(e) => updateField('lore', e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:ring-moonstone-blue/40 transition-all duration-500 resize-none"
                  />
                </GlassPanel>

                <GlassPanel className="space-y-4">
                  <LabelHeader>Stats</LabelHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {statKeys.map((k) => (
                      <div key={k}>
                        <label className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] block mb-1">{statLabels[k]}</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={editing.stats[k]}
                          onChange={(e) => updateStat(k, Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                          className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-moonstone-blue/40 transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </GlassPanel>

                <GlassPanel className="space-y-3">
                  <LabelHeader>Tags</LabelHeader>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {editing.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 text-[10px] font-mono text-white/60">
                        {tag}
                        <button onClick={() => removeTag(i)} className="hover:text-red-400 transition-colors">
                          <X size={10} weight="light" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      className="flex-1 bg-white/5 ring-1 ring-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:ring-moonstone-blue/40 transition-all duration-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                    <GlassButton size="sm" onClick={() => {
                      const input = document.activeElement as HTMLInputElement
                      if (input && input.value) { addTag(input.value); input.value = '' }
                    }}>
                      Add
                    </GlassButton>
                  </div>
                </GlassPanel>

                <GlassPanel className="space-y-3">
                  <LabelHeader>Relationships</LabelHeader>
                  {(!editing.relationships || editing.relationships.length === 0) ? (
                    <p className="text-white/20 text-sm">No relationships defined</p>
                  ) : (
                    <div className="space-y-2">
                      {editing.relationships.map((rel, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2">
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            rel.type === 'ally' ? 'bg-ethereal-teal/20 text-ethereal-teal' :
                            rel.type === 'enemy' ? 'bg-red-500/20 text-red-400' :
                            'bg-pink-500/20 text-pink-400'
                          }`}>
                            {rel.type}
                          </span>
                          <span className="text-sm text-white/70 flex-1">{rel.targetName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassPanel>
              </div>

              <div className="sticky bottom-0 bg-[#050505]/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex items-center justify-between">
                {confirmDelete === editing.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(editing.id)}
                      className="px-4 py-2 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-red-400 text-xs font-mono uppercase tracking-wider hover:bg-red-500/30 transition-all duration-500"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-4 py-2 rounded-full bg-white/5 ring-1 ring-white/10 text-white/50 text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition-all duration-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(editing.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 ring-1 ring-white/10 text-white/40 hover:text-red-400 hover:ring-red-500/40 text-xs font-mono uppercase tracking-wider transition-all duration-500"
                  >
                    <TrashSimple size={12} weight="light" /> Delete
                  </button>
                )}
                <GlassButton glow="moonstone" onClick={handleSave} disabled={!editing.name.trim() || saving}>
                  {saving ? 'Saving...' : 'Save'}
                </GlassButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:ring-moonstone-blue/40 transition-all duration-500"
      />
    </div>
  )
}

function LabelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-px bg-white/10" />
      <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">{children}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  )
}
